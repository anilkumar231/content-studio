"use client";

import { useEffect, useState } from "react";
import { TrendingUp, FileText, Mic, Clapperboard, Upload, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const STEPS = [
  { id: "trend",  label: "Trend Scan",    sub: "AI Research",    icon: TrendingUp,  color: "#00D4FF", glow: "0 0 20px #00D4FF44" },
  { id: "script", label: "Script AI",     sub: "Claude LLM",     icon: FileText,    color: "#8B5CF6", glow: "0 0 20px #8B5CF644" },
  { id: "voice",  label: "Voice Synth",   sub: "ElevenLabs",     icon: Mic,         color: "#10B981", glow: "0 0 20px #10B98144" },
  { id: "video",  label: "Video Engine",  sub: "Higgsfield",     icon: Clapperboard,color: "#F97316", glow: "0 0 20px #F9731644" },
  { id: "upload", label: "Publish",       sub: "YouTube + More", icon: Upload,      color: "#EC4899", glow: "0 0 20px #EC489944" },
];

const STEP_MAP: Record<string, number> = {
  topic_research: 0, script_generation: 1,
  tts_generation: 2, video_rendering: 3,
  upload: 4, completion: 4,
};

/* Node x centers in the SVG coordinate space (viewBox 0 0 640 120) */
const NODE_X = [64, 192, 320, 448, 576];
const NODE_Y = 60;
const NODE_R = 26;
const PIPE_Y  = NODE_Y;

interface Props { activeStep?: number; completedSteps?: number[] }

function Particle({ x1, x2, color, delay, dur }: {
  x1: number; x2: number; color: string; delay: number; dur: number;
}) {
  const id = `pp-${x1}-${x2}-${delay}`;
  return (
    <g>
      <defs>
        <path id={id} d={`M ${x1} ${PIPE_Y} L ${x2} ${PIPE_Y}`} />
      </defs>
      <circle r="3.5" fill={color} opacity="0">
        <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${delay}s`}>
          <mpath href={`#${id}`} />
        </animateMotion>
        <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.1;0.85;1"
          dur={`${dur}s`} repeatCount="indefinite" begin={`${delay}s`} />
        <animate attributeName="r" values="2;4;2" keyTimes="0;0.5;1"
          dur={`${dur}s`} repeatCount="indefinite" begin={`${delay}s`} />
      </circle>
    </g>
  );
}

export function AutomationFlow({ activeStep = -1, completedSteps = [] }: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 640 120" className="w-full" style={{ minWidth: 340, maxHeight: 140 }}>
        {/* ── Connection pipes ── */}
        {NODE_X.slice(0, -1).map((x, i) => {
          const x1 = x + NODE_R + 2;
          const x2 = NODE_X[i + 1] - NODE_R - 2;
          const pipeColor = completedSteps.includes(i) ? STEPS[i].color : "rgba(255,255,255,0.08)";
          const isActive  = activeStep === i || completedSteps.includes(i);
          const dur = 1.2 + i * 0.15;
          return (
            <g key={i}>
              {/* Static pipe line */}
              <line x1={x1} y1={PIPE_Y} x2={x2} y2={PIPE_Y}
                stroke={pipeColor} strokeWidth="1.5" strokeDasharray="4 4"
                opacity={isActive ? 0.8 : 0.3} />
              {/* Particles — always flow to show automation */}
              <Particle x1={x1} x2={x2} color={STEPS[i].color} delay={0}        dur={dur} />
              <Particle x1={x1} x2={x2} color={STEPS[i].color} delay={dur/3}    dur={dur} />
              <Particle x1={x1} x2={x2} color={STEPS[i].color} delay={dur*2/3}  dur={dur} />
            </g>
          );
        })}

        {/* ── Nodes ── */}
        {STEPS.map((step, i) => {
          const cx = NODE_X[i];
          const isActive    = activeStep === i;
          const isCompleted = completedSteps.includes(i);
          const StepIcon    = step.icon;

          return (
            <g key={step.id}>
              {/* Glow ring when active */}
              {isActive && (
                <circle cx={cx} cy={NODE_Y} r={NODE_R + 8}
                  fill="none" stroke={step.color} strokeWidth="1.5" opacity="0.3">
                  <animate attributeName="r" values={`${NODE_R+6};${NODE_R+14};${NODE_R+6}`}
                    dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4"
                    dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Node circle */}
              <circle cx={cx} cy={NODE_Y} r={NODE_R}
                fill={isActive || isCompleted
                  ? `${step.color}22`
                  : "rgba(255,255,255,0.04)"}
                stroke={isActive || isCompleted ? step.color : "rgba(255,255,255,0.10)"}
                strokeWidth={isActive ? 2 : 1.5} />

              {/* Icon via foreignObject */}
              <foreignObject
                x={cx - 12} y={NODE_Y - 12} width={24} height={24}
                style={{ overflow: "visible" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                  width:24, height:24, color: isActive || isCompleted ? step.color : "rgba(255,255,255,0.4)" }}>
                  {isCompleted
                    ? <CheckCircle2 size={16} color={step.color} />
                    : <StepIcon size={14} />}
                </div>
              </foreignObject>

              {/* Label below */}
              <text x={cx} y={NODE_Y + NODE_R + 14} textAnchor="middle"
                fontSize="9" fontWeight="600" fill={isActive ? step.color : "rgba(255,255,255,0.6)"}>
                {step.label}
              </text>
              <text x={cx} y={NODE_Y + NODE_R + 24} textAnchor="middle"
                fontSize="7.5" fill="rgba(255,255,255,0.3)">
                {step.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Connected wrapper that reads live pipeline state ── */
export function LiveAutomationFlow() {
  const [activeStep, setActiveStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    async function poll() {
      try {
        /* Get the most recent run */
        const { data: runs } = await supabase
          .from("pipeline_runs")
          .select("id,status")
          .order("started_at", { ascending: false })
          .limit(1);

        if (!runs?.length) return;
        const run = runs[0];

        if (run.status === "completed") {
          setActiveStep(-1);
          setCompletedSteps([0, 1, 2, 3, 4]);
          return;
        }
        if (run.status === "failed") { setActiveStep(-1); return; }

        /* Get latest log step */
        const { data: logs } = await supabase
          .from("pipeline_logs")
          .select("step")
          .eq("run_id", run.id)
          .order("timestamp", { ascending: false })
          .limit(1);

        if (logs?.length) {
          const stepIdx = STEP_MAP[logs[0].step] ?? -1;
          setActiveStep(stepIdx);
          setCompletedSteps(Array.from({ length: stepIdx }, (_, i) => i));
        }
      } catch { /* silent */ }
    }
    poll();
    const t = setInterval(poll, 8000);
    return () => clearInterval(t);
  }, []);

  return <AutomationFlow activeStep={activeStep} completedSteps={completedSteps} />;
}
