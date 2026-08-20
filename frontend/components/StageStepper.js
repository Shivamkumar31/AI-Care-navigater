"use client";

const STAGE_COLORS = {
  done: "bg-brand-500 text-white",
  current: "bg-brand-100 text-brand-700 border-2 border-brand-500",
  upcoming: "bg-slate-100 text-slate-400",
};

export default function StageStepper({ stages, currentStage, onSelect }) {
  const currentIndex = stages.indexOf(currentStage);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {stages.map((stage, idx) => {
        let status = "upcoming";
        if (idx < currentIndex) status = "done";
        if (idx === currentIndex) status = "current";
        return (
          <button
            key={stage}
            onClick={() => onSelect && onSelect(stage)}
            className={`text-sm font-medium rounded-full px-4 py-2 transition-colors ${STAGE_COLORS[status]} ${onSelect ? "cursor-pointer hover:opacity-90" : "cursor-default"}`}
          >
            {idx + 1}. {stage}
          </button>
        );
      })}
    </div>
  );
}
