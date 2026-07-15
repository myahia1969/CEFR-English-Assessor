import React, { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { motion } from "motion/react";
import { Compass, Sparkles, AlertCircle, HelpCircle } from "lucide-react";
import { CEFRLevel, EvaluationHistoryEntry } from "../types";

interface CEFRDomainRadarProps {
  userLevel: CEFRLevel | null;
  stats: {
    testsTaken: number;
    practiceQuestions: number;
    evaluations: number;
    accuracy: number;
  };
  testHistory: Array<{
    date: string;
    score: number;
    stabilizedLevel: CEFRLevel;
  }>;
  evaluationHistory: EvaluationHistoryEntry[];
}

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
  return mapping[level] ?? 1;
};

const valToLevel = (val: number): CEFRLevel => {
  const levels: CEFRLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  const index = Math.max(0, Math.min(6, Math.round(val)));
  return levels[index];
};

const levelNames: Record<CEFRLevel, string> = {
  A0: "Pre-A1 Starter",
  A1: "A1 Beginner",
  A2: "A2 Elementary",
  B1: "B1 Intermediate",
  B2: "B2 Upper-Intermediate",
  C1: "C1 Advanced",
  C2: "C2 Mastery"
};

export default function CEFRDomainRadar({
  userLevel,
  stats,
  testHistory = [],
  evaluationHistory = []
}: CEFRDomainRadarProps) {
  const radarData = useMemo(() => {
    const baseCEFR = userLevel || "B1";
    const baseVal = levelToVal(baseCEFR);

    // Initial default values derived from overall userLevel
    let listeningVal = baseVal;
    let readingVal = baseVal;
    let writingVal = baseVal;
    let speakingVal = baseVal;

    // 1. Incorporate Test History (influence Reading and Listening)
    if (testHistory && testHistory.length > 0) {
      const lastTests = testHistory.slice(0, 3);
      const avgTestVal = lastTests.reduce((acc, t) => acc + levelToVal(t.stabilizedLevel), 0) / lastTests.length;
      readingVal = (readingVal + avgTestVal) / 2;
      listeningVal = (listeningVal + avgTestVal) / 2;
    }

    // 2. Incorporate AI Evaluations (Writing & Speaking)
    const writingEvaluations = (evaluationHistory || []).filter(e => e.type === "writing");
    const speakingEvaluations = (evaluationHistory || []).filter(e => e.type === "speaking");

    if (writingEvaluations.length > 0) {
      const avgWritingVal = writingEvaluations.reduce((acc, e) => acc + levelToVal(e.result.overall_assigned_level), 0) / writingEvaluations.length;
      writingVal = (writingVal * 0.4) + (avgWritingVal * 0.6);
    }

    if (speakingEvaluations.length > 0) {
      const avgSpeakingVal = speakingEvaluations.reduce((acc, e) => acc + levelToVal(e.result.overall_assigned_level), 0) / speakingEvaluations.length;
      speakingVal = (speakingVal * 0.4) + (avgSpeakingVal * 0.6);

      let criteriaPronVal = 0;
      let count = 0;
      speakingEvaluations.forEach(e => {
        const scores = e.result.criteria_scores;
        if (scores && scores.pronunciation) {
          criteriaPronVal += levelToVal(scores.pronunciation as CEFRLevel);
          count++;
        }
      });
      if (count > 0) {
        speakingVal = (speakingVal * 0.5) + ((criteriaPronVal / count) * 0.5);
      }
    }

    // Convert values to 0-100 percentages and levels
    const getPercentage = (val: number) => Math.max(10, Math.min(100, Math.round((val / 6) * 100)));

    return [
      {
        subject: "Listening / الاستماع",
        A: getPercentage(listeningVal),
        level: valToLevel(listeningVal),
        raw: listeningVal.toFixed(1)
      },
      {
        subject: "Reading / القراءة",
        A: getPercentage(readingVal),
        level: valToLevel(readingVal),
        raw: readingVal.toFixed(1)
      },
      {
        subject: "Writing / الكتابة",
        A: getPercentage(writingVal),
        level: valToLevel(writingVal),
        raw: writingVal.toFixed(1)
      },
      {
        subject: "Speaking / التحدث",
        A: getPercentage(speakingVal),
        level: valToLevel(speakingVal),
        raw: speakingVal.toFixed(1)
      }
    ];
  }, [userLevel, testHistory, evaluationHistory]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#141417] border border-white/10 p-3 rounded-lg shadow-xl text-left space-y-1.5 font-sans">
          <p className="text-xs font-bold text-[#D4AF37]">{data.subject.split(" / ")[0]}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-white font-mono">
            <span>CEFR Band:</span>
            <span className="bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-1.5 py-0.5 rounded text-[#D4AF37] font-bold">
              {data.level}
            </span>
          </div>
          <p className="text-[9px] text-[#8E9299]">
            {levelNames[data.level as CEFRLevel] || data.level}
          </p>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#D4AF37] h-full rounded-full"
              style={{ width: `${data.A}%` }}
            />
          </div>
          <p className="text-[8px] text-[#8E9299]/70 font-mono text-right">
            Mastery Rating: {data.A}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0F0F12] border border-white/5 rounded-xl p-5 flex flex-col justify-between"
      id="cefr-domains-radar-card"
    >
      <div className="space-y-1 text-left mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#D4AF37] font-mono uppercase font-bold tracking-wider flex items-center gap-1">
            <Compass className="h-3.5 w-3.5 animate-spin-slow" />
            <span>CEFR Domain Profiler</span>
          </span>
          <div className="text-[9px] font-mono text-[#8E9299] flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            <Sparkles className="h-2.5 w-2.5 text-[#D4AF37]" />
            <span>Interactive Map</span>
          </div>
        </div>
        <h3 className="text-sm font-serif text-white tracking-wide">
          نظرة عامة على الكفاءة اللغوية / 4-Domain CEFR Balance
        </h3>
        <p className="text-[10px] text-[#8E9299]">
          Visual balance of macro-skills derived from tests and AI evaluation rubrics.
        </p>
      </div>

      <div className="w-full h-[240px] flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#ffffff" strokeOpacity={0.08} />
            <PolarAngleAxis
              dataKey="subject"
              tick={(props) => {
                const { payload, x, y, cx, cy } = props;
                const value = payload.value;
                const [en, ar] = value.split(" / ");
                // Determine alignment depending on horizontal position
                const textAnchor = x > cx ? "start" : x < cx ? "end" : "middle";
                const dy = y > cy ? 12 : y < cy ? -2 : 4;
                return (
                  <g>
                    <text
                      x={x}
                      y={y + dy}
                      textAnchor={textAnchor}
                      fill="#FFFFFF"
                      fontSize={9}
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      {en}
                    </text>
                    <text
                      x={x}
                      y={y + dy + 10}
                      textAnchor={textAnchor}
                      fill="#8E9299"
                      fontSize={8}
                      fontFamily="sans-serif"
                    >
                      {ar}
                    </text>
                  </g>
                );
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "#8E9299", fontSize: 8, fontFamily: "monospace" }}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Radar
              name="My Progress"
              dataKey="A"
              stroke="#D4AF37"
              fill="#D4AF37"
              fillOpacity={0.25}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
        {radarData.map((data, idx) => (
          <div key={idx} className="bg-white/5 p-2 rounded-lg border border-white/5 text-left space-y-0.5">
            <span className="text-[9px] font-mono text-[#8E9299] uppercase tracking-wider block font-bold truncate">
              {data.subject.split(" / ")[0]}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-white font-mono">{data.A}%</span>
              <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-1 rounded font-black font-mono">
                {data.level}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
