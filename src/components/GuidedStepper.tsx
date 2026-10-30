import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TOKENS } from '../types';

interface GuidedStepperProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const STEPS = [
  {
    step: 1,
    title: 'Extract & Consent',
    doThis: "Click 'Mine' on Priya's pricing deck card in Tasks or the Slack simulator.",
    expectThis: 'Card transitions to Confirmed Owner with explicit consent; zero forced assignments.',
    targetPersona: 'priya',
    targetScreen: 'tasks',
  },
  {
    step: 2,
    title: 'In-Meeting Read-back',
    doThis: "Switch to Meetings > Weekly Product Sync > 'Last 3 minutes' read-back tab.",
    expectThis: 'See in-room ownership reach 83% leading indicator before attendees disconnect.',
    targetPersona: 'priya',
    targetScreen: 'meetings',
  },
  {
    step: 3,
    title: 'Zero Surveillance',
    doThis: "Switch persona to Dana (VP Product) in the top bar.",
    expectThis: 'Manager sees team totals only. Testing the cohort slider (< 5) mathematically suppresses metrics.',
    targetPersona: 'dana',
    targetScreen: 'analytics',
  },
  {
    step: 4,
    title: 'Drop with Equal Dignity',
    doThis: "Click 'Drop' on an open card with 1 tap, then pick an optional chip.",
    expectThis: 'Immediate drop, 10-second undo toast, no red alert, counted as legitimate honest resolution.',
    targetPersona: 'priya',
    targetScreen: 'tasks',
  },
  {
    step: 5,
    title: '60-Min Pre-brief',
    doThis: "Click the '60-min Pre-brief' button in the top bar or meeting drawer.",
    expectThis: 'Review 3 groups: Yours to settle, Waiting on others, and Repeating without an owner.',
    targetPersona: 'priya',
    targetScreen: 'tasks',
  },
  {
    step: 6,
    title: 'Measure Honest Resolution',
    doThis: 'Use the Time Travel slider to advance to Day 14.',
    expectThis: 'Unresolved items transition to "Went quiet", staying in the denominator. Rate hits 45%+ target.',
    targetPersona: 'dana',
    targetScreen: 'analytics',
  },
];

export const GuidedStepper: React.FC<GuidedStepperProps> = ({
  currentStep,
  onSelectStep,
  onNext,
  onPrev,
}) => {
  const stepInfo = STEPS[currentStep - 1] || STEPS[0];

  return (
    <aside
      aria-label="Capstone Guided Walkthrough"
      className="p-3.5 px-4 rounded-2xl border bg-[#18181B] border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg"
      style={{
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Steps Pill Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
        <span className="text-[11px] font-bold text-[#A594FD] uppercase tracking-wider flex items-center gap-1.5 shrink-0 pr-1">
          <Compass className="w-4 h-4 text-[#5B45F0]" />
          Review Tour:
        </span>
        <div className="flex items-center gap-1.5">
          {STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => onSelectStep(s.step)}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 ${
                currentStep === s.step
                  ? 'bg-[#5B45F0] text-white shadow-sm'
                  : currentStep > s.step
                  ? 'bg-white/10 text-neutral-300 hover:text-white'
                  : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              <span>{s.step}. {s.title}</span>
              {currentStep > s.step && <CheckCircle2 className="w-3 h-3 text-[#35C98B]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Do this / Expect this prompt line */}
      <div className="flex-1 md:px-4 py-1.5 rounded-xl bg-black/40 border border-white/5 text-xs flex flex-col justify-center">
        <div className="flex items-center gap-2 text-white">
          <span className="text-[11px] font-bold text-[#F5A524] uppercase tracking-wide shrink-0">
            Do this:
          </span>
          <span className="truncate">{stepInfo.doThis}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-400 mt-0.5">
          <span className="text-[11px] font-bold text-[#35C98B] uppercase tracking-wide shrink-0">
            Expect this:
          </span>
          <span className="truncate">{stepInfo.expectThis}</span>
        </div>
      </div>

      {/* Prev / Next controls */}
      <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
        <button
          onClick={onPrev}
          disabled={currentStep <= 1}
          aria-label="Previous guided tour step"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0] focus-visible:outline-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNext}
          disabled={currentStep >= STEPS.length}
          aria-label="Next guided tour step"
          className="px-3 py-1.5 rounded-lg bg-[#5B45F0] hover:bg-[#4B36E0] text-white text-xs font-semibold disabled:opacity-30 flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0] focus-visible:outline-none"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
