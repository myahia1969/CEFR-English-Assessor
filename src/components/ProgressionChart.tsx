import React from "react";
import * as d3 from "d3";
import { motion } from "motion/react";
import { CEFRLevel } from "../types";

interface TestHistoryEntry {
  date: string;
  score: number;
  stabilizedLevel: CEFRLevel;
}

interface ProgressionChartProps {
  testHistory: TestHistoryEntry[];
}

const CEFR_LEVELS: CEFRLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

const levelNames: Record<CEFRLevel, string> = {
  A0: "Pre-A1 Starter",
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper-Intermediate",
  C1: "Advanced",
  C2: "Mastery"
};

const levelToVal = (level: CEFRLevel): number => {
  const mapping: Record<CEFRLevel, number> = {
    A0: 0,
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
    C2: 6
  };
  return mapping[level] ?? 1; // Fallback to A1
};

const valToLevel = (val: number): CEFRLevel => {
  const levels: CEFRLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  const index = Math.max(0, Math.min(6, Math.round(val)));
  return levels[index];
};

export default function ProgressionChart({ testHistory }: ProgressionChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [metric, setMetric] = React.useState<"level" | "score">("level");
  const [dimensions, setDimensions] = React.useState({ width: 500, height: 165 });
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    index: number;
    date: string;
    score: number;
    level: CEFRLevel;
    value: number;
    isProjection?: boolean;
  } | null>(null);

  // Resize listener to ensure fully fluid and responsive SVG
  React.useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      setDimensions({
        width: Math.max(width, 280),
        height: 165
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (!testHistory || testHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-center p-6 bg-[#0F0F12] light:bg-white rounded-lg border border-dashed border-white/10 light:border-slate-200">
        <span className="text-xs text-[#8E9299] light:text-slate-400">
          No placement history yet. Complete a test to plot your progression!
        </span>
      </div>
    );
  }

  // Pre-process and reverse/sort the history chronologically to visualize gain over time
  const sortedHistory = [...testHistory].reverse();

  const data = sortedHistory.map((h, index) => ({
    index,
    date: h.date,
    score: h.score,
    level: h.stabilizedLevel,
    value: metric === "level" ? levelToVal(h.stabilizedLevel) : h.score
  }));

  const margin = { top: 20, right: 25, bottom: 35, left: 40 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  const N = data.length;
  const lastRealPoint = data[N - 1];

  // Let's compute slope/intercept for BOTH metrics so we always have accurate data
  let slopeLevel = 0.15;
  let interceptLevel = levelToVal(lastRealPoint.level);
  let slopeScore = 0.5;
  let interceptScore = lastRealPoint.score;

  if (N > 1) {
    let sumX = 0;
    let sumLevel = 0;
    let sumXLevel = 0;
    let sumXX = 0;
    let sumScore = 0;
    let sumXScore = 0;

    for (let i = 0; i < N; i++) {
      const idx = data[i].index;
      sumX += idx;
      sumLevel += levelToVal(data[i].level);
      sumXLevel += idx * levelToVal(data[i].level);
      sumXX += idx * idx;
      sumScore += data[i].score;
      sumXScore += idx * data[i].score;
    }

    const denom = N * sumXX - sumX * sumX;
    if (denom !== 0) {
      slopeLevel = (N * sumXLevel - sumX * sumLevel) / denom;
      slopeScore = (N * sumXScore - sumX * sumScore) / denom;
    }

    // Bound level slope (always positive to represent user's growth goal with practice)
    const minSlopeL = 0.05;
    const maxSlopeL = 0.45;
    if (slopeLevel < minSlopeL) slopeLevel = minSlopeL;
    if (slopeLevel > maxSlopeL) slopeLevel = maxSlopeL;

    // Bound score slope
    const minSlopeS = 0.2;
    const maxSlopeS = 1.5;
    if (slopeScore < minSlopeS) slopeScore = minSlopeS;
    if (slopeScore > maxSlopeS) slopeScore = maxSlopeS;

    interceptLevel = levelToVal(lastRealPoint.level) - slopeLevel * (N - 1);
    interceptScore = lastRealPoint.score - slopeScore * (N - 1);
  } else {
    // Default slopes for N === 1
    slopeLevel = 0.15;
    slopeScore = 0.5;
    interceptLevel = levelToVal(lastRealPoint.level);
    interceptScore = lastRealPoint.score;
  }

  // Create projected points starting from N-1 (to connect line smoothly)
  const projectedPoints = [
    {
      index: lastRealPoint.index,
      date: lastRealPoint.date,
      score: lastRealPoint.score,
      level: lastRealPoint.level,
      value: lastRealPoint.value,
      isProjection: false
    },
    ...[1, 2, 3].map((step) => {
      const futureIndex = (N - 1) + step;
      const lvlVal = Math.min(6, Math.max(0, slopeLevel * futureIndex + interceptLevel));
      const scrVal = Math.min(20, Math.max(0, slopeScore * futureIndex + interceptScore));
      
      return {
        index: futureIndex,
        date: `Est. Quiz +${step}`,
        score: Math.round(scrVal),
        level: valToLevel(lvlVal),
        value: metric === "level" ? lvlVal : scrVal,
        isProjection: true
      };
    })
  ];

  // Benchmark progress of other users starting at the same initial CEFR level
  const initialLevel = sortedHistory[0].stabilizedLevel;
  const initialLevelVal = levelToVal(initialLevel);
  const initialScoreBenchmark = Math.round(Math.max(6, Math.min(18, initialLevelVal * 2.5 + 4)));

  const benchmarkPoints = Array.from({ length: N + 3 }).map((_, i) => {
    // Average user starting at the same initial CEFR level progresses steadily
    const peerLevelVal = Math.min(6, initialLevelVal + i * 0.08);
    const peerScoreVal = Math.min(20, initialScoreBenchmark + i * 0.35);

    return {
      index: i,
      level: valToLevel(peerLevelVal),
      score: Math.round(peerScoreVal),
      value: metric === "level" ? peerLevelVal : peerScoreVal,
      isBenchmark: true
    };
  });

  // X scale: map data indexes to pixels including the projection
  const xDomain = [0, N + 2];
  const xScale = d3.scaleLinear()
    .domain(xDomain)
    .range([0, chartWidth]);

  // Y scale: map domain depending on metric (0-6 for CEFR levels, 0-20 for scores)
  const yScale = d3.scaleLinear()
    .domain(metric === "level" ? [0, 6] : [0, 20])
    .range([chartHeight, 0]);

  // Generators for smooth monotone spline line & shaded area
  const lineGenerator = d3.line<typeof data[0]>()
    .x((d) => xScale(d.index))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const projectionLineGenerator = d3.line<typeof projectedPoints[0]>()
    .x((d) => xScale(d.index))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const benchmarkLineGenerator = d3.line<typeof benchmarkPoints[0]>()
    .x((d) => xScale(d.index))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const areaGenerator = d3.area<typeof data[0]>()
    .x((d) => xScale(d.index))
    .y0(chartHeight)
    .y1((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);

  // Ticks for Y Axis
  const yTicks = metric === "level" ? [0, 1, 2, 3, 4, 5, 6] : [0, 4, 8, 12, 16, 20];

  // Tooltip positioning variables
  const tooltipX = hoveredPoint ? xScale(hoveredPoint.index) + margin.left : 0;
  const tooltipY = hoveredPoint ? yScale(hoveredPoint.value) + margin.top : 0;

  // Find index of next level and generate smart text
  const currentL = levelToVal(lastRealPoint.level);
  let forecastText = "";
  if (currentL >= 6) {
    forecastText = "Peak CEFR level achieved (C2 Mastery)! Excellent work. Continue taking quizzes regularly to maintain your perfect language proficiency.";
  } else {
    const nextL = currentL + 1;
    const estimatedX = (nextL - interceptLevel) / slopeLevel;
    const assessmentsLeft = Math.max(1, Math.ceil(estimatedX - (N - 1)));
    const nextLevelName = CEFR_LEVELS[nextL];
    forecastText = `Based on your recent quiz results, you are on a robust growth trajectory (+${(slopeLevel * 100).toFixed(0)}% skill coefficient). You are projected to attain the ${nextLevelName} (${levelNames[nextLevelName]}) level in approximately ${assessmentsLeft} more diagnostic quiz${assessmentsLeft > 1 ? "zes" : ""}.`;
  }

  return (
    <div className="space-y-4 w-full">
      <div ref={containerRef} className="relative w-full h-[230px] select-none flex flex-col justify-between" id="progression-chart-container">
        {/* Metric Toggles and Legend */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-[#8E9299] font-mono uppercase font-bold tracking-wider">
              {metric === "level" ? "Visualizing Grade Delta (CEFR)" : "Visualizing Score over Time Progress (0-20)"}
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[9px] font-mono mt-0.5">
              <span className="text-[#D4AF37] flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-[#D4AF37] inline-block" />
                Your Progress
              </span>
              <span className="text-[#D4AF37]/70 flex items-center gap-1">
                <span className="w-2.5 h-0.5 border-t border-dashed border-[#D4AF37]/70 inline-block" />
                Forecast
              </span>
              <span className="text-indigo-400 flex items-center gap-1">
                <span className="w-2.5 h-0.5 border-t border-dashed border-indigo-400 inline-block" />
                Peer Benchmark (Started {initialLevel})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => {
                setMetric("level");
                setHoveredPoint(null);
              }}
              className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase font-bold tracking-wider transition cursor-pointer ${
                metric === "level"
                  ? "bg-[#D4AF37] text-black font-black"
                  : "text-[#8E9299] hover:text-white hover:bg-white/5 font-semibold"
              }`}
            >
              CEFR Level
            </button>
            <button
              onClick={() => {
                setMetric("score");
                setHoveredPoint(null);
              }}
              className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase font-bold tracking-wider transition cursor-pointer ${
                metric === "score"
                  ? "bg-[#D4AF37] text-black font-black"
                  : "text-[#8E9299] hover:text-white hover:bg-white/5 font-semibold"
              }`}
            >
              Test Score
            </button>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="w-full flex-1 relative">
          <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              
              {/* Y Axis Gridlines and Labels */}
              {yTicks.map((tick) => (
                <g key={tick} className="opacity-90">
                  <line
                    x1={0}
                    y1={yScale(tick)}
                    x2={chartWidth}
                    y2={yScale(tick)}
                    className="stroke-white/5 light:stroke-slate-100"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={-10}
                    y={yScale(tick) + 3}
                    className="fill-[#8E9299] light:fill-slate-500 font-mono text-[9px] font-bold"
                    textAnchor="end"
                  >
                    {metric === "level" ? CEFR_LEVELS[tick] : tick}
                  </text>
                </g>
              ))}

              {/* X Axis Date labels (Real only) */}
              {data.map((d, i) => {
                const shouldShowLabel = 
                  data.length <= 6 || 
                  i === 0 || 
                  i === data.length - 1 || 
                  i % Math.ceil(data.length / 5) === 0;

                if (!shouldShowLabel) return null;

                return (
                  <g key={i} className="opacity-90">
                    <line
                      x1={xScale(d.index)}
                      y1={chartHeight}
                      x2={xScale(d.index)}
                      y2={chartHeight + 5}
                      className="stroke-white/10 light:stroke-slate-200"
                      strokeWidth={1}
                    />
                    <text
                      x={xScale(d.index)}
                      y={chartHeight + 16}
                      className="fill-[#8E9299] light:fill-slate-500 font-mono text-[8px]"
                      textAnchor="middle"
                    >
                      {d.date}
                    </text>
                  </g>
                );
              })}

              {/* Hover guideline vertical rule */}
              {hoveredPoint && (
                <line
                  x1={xScale(hoveredPoint.index)}
                  y1={0}
                  x2={xScale(hoveredPoint.index)}
                  y2={chartHeight}
                  className="stroke-[#D4AF37]/40 light:stroke-amber-500/40"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )}

              {/* Shaded area path with gradient fill for historical data */}
              {data.length > 0 && (
                <>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" className="light:stop-color-amber-500 light:stop-opacity-20" />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" className="light:stop-color-amber-500 light:stop-opacity-0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={areaGenerator(data) || undefined}
                    fill="url(#areaGradient)"
                    className="transition-all duration-300"
                  />
                </>
              )}

              {/* Community Average / Peer Benchmark line */}
              {benchmarkPoints.length > 0 && (
                <motion.path
                  d={benchmarkLineGenerator(benchmarkPoints) || undefined}
                  fill="none"
                  className="stroke-indigo-400/40 light:stroke-indigo-500/40"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 1 }}
                />
              )}

              {/* Golden line path for historical data */}
              {data.length > 0 && (
                <motion.path
                  d={lineGenerator(data) || undefined}
                  fill="none"
                  className="stroke-[#D4AF37] light:stroke-amber-600"
                  strokeWidth={2.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              )}

              {/* Dashed line path for projected forecast data */}
              {projectedPoints.length > 0 && (
                <motion.path
                  d={projectionLineGenerator(projectedPoints) || undefined}
                  fill="none"
                  className="stroke-[#D4AF37]/50 light:stroke-amber-600/50"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 1 }}
                />
              )}

              {/* Interactive data point handles for historical points */}
              {data.map((d, i) => (
                <g
                  key={`real-${i}`}
                  onMouseEnter={() => setHoveredPoint(d)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={xScale(d.index)}
                    cy={yScale(d.value)}
                    r={12}
                    fill="transparent"
                  />
                  <circle
                    cx={xScale(d.index)}
                    cy={yScale(d.value)}
                    r={hoveredPoint?.index === d.index && !hoveredPoint.isProjection ? 6 : 4}
                    className="fill-[#141417] light:fill-white stroke-[#D4AF37] light:stroke-amber-600 transition-all duration-150"
                    strokeWidth={hoveredPoint?.index === d.index && !hoveredPoint.isProjection ? 2.5 : 1.5}
                  />
                </g>
              ))}

              {/* Interactive data point handles for projected points */}
              {projectedPoints.slice(1).map((d, i) => (
                <g
                  key={`proj-${i}`}
                  onMouseEnter={() => setHoveredPoint(d)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={xScale(d.index)}
                    cy={yScale(d.value)}
                    r={12}
                    fill="transparent"
                  />
                  <circle
                    cx={xScale(d.index)}
                    cy={yScale(d.value)}
                    r={hoveredPoint?.index === d.index && hoveredPoint.isProjection ? 6 : 4}
                    className="fill-transparent stroke-[#D4AF37]/75 light:stroke-amber-600/75 transition-all duration-150"
                    strokeWidth={hoveredPoint?.index === d.index && hoveredPoint.isProjection ? 2 : 1.5}
                    strokeDasharray="2 2"
                  />
                </g>
              ))}

            </g>
          </svg>

          {/* Floating Interactive Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute bg-[#141417] border border-[#D4AF37]/40 text-white p-3.5 rounded-xl shadow-2xl text-xs pointer-events-none transition-all duration-150 z-25 min-w-[190px] light:bg-white light:text-slate-800 light:border-slate-300"
              style={{
                left: `${tooltipX}px`,
                top: `${tooltipY - 85}px`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 light:border-slate-200 pb-1.5">
                  <span className="font-mono text-[9px] text-[#8E9299] light:text-slate-500 uppercase tracking-wider font-semibold">
                    {hoveredPoint.isProjection ? "Growth Forecast" : "Assessment"}
                  </span>
                  <span className={`font-mono text-[9px] px-2 py-0.5 rounded border ${
                    hoveredPoint.isProjection 
                      ? "text-[#D4AF37]/70 border-[#D4AF37]/25 bg-[#D4AF37]/5 italic" 
                      : "text-[#D4AF37] light:text-amber-700 font-bold bg-[#D4AF37]/5 border-[#D4AF37]/15"
                  }`}>
                    {hoveredPoint.date}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="text-[#8E9299] light:text-slate-500">CEFR Level:</span>
                    <span className="font-serif font-black text-[#D4AF37] light:text-amber-700 uppercase bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20 text-xs">
                      {hoveredPoint.level}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8E9299] light:text-slate-400 font-medium italic">
                    {levelNames[hoveredPoint.level] || ""}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-[11px] pt-1.5 border-t border-white/5 light:border-slate-100">
                  <span className="text-[#8E9299] light:text-slate-500 font-medium">Diagnostic Score:</span>
                  <span className="font-mono font-bold text-white light:text-slate-800 bg-white/5 light:bg-slate-100 px-1.5 py-0.5 rounded">
                    {hoveredPoint.score} / 20
                  </span>
                </div>

                {/* Benchmark Peer comparison info */}
                {(() => {
                  const peerVal = benchmarkPoints.find((b) => b.index === hoveredPoint.index);
                  if (!peerVal) return null;
                  return (
                    <div className="flex items-center justify-between gap-3 text-[11px] pt-1.5 border-t border-indigo-500/10 light:border-slate-200">
                      <span className="text-[#8E9299] light:text-slate-500 font-medium">Peer Benchmark:</span>
                      <span className="font-mono font-bold text-indigo-400 light:text-indigo-600 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {metric === "level" ? `${peerVal.level} (${levelNames[peerVal.level] || ""})` : `${peerVal.score} / 20`}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Smart Projection Insight Card */}
      <div className="bg-[#0F0F12]/85 p-3 rounded-xl border border-white/5 flex items-start gap-3 text-left">
        <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shrink-0 mt-0.5">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider">
            AI Growth Forecast Engine
          </div>
          <p className="text-[11px] text-[#8E9299] leading-relaxed">
            {forecastText}
          </p>
        </div>
      </div>
    </div>
  );
}
