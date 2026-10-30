import React, { useEffect } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  Sparkles,
  Users,
  Check,
  Flag
} from 'lucide-react';
import { Commitment, TOKENS } from '../types';

interface PrebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  commitments: Commitment[];
  activePersona: string;
  onMarkDone: (id: string) => void;
  onDrop: (id: string, reason?: string) => void;
  onClaim: (id: string) => void;
  onResolveRepeating?: (id: string, action: 'own' | 'split' | 'drop') => void;
}

export const PrebriefModal: React.FC<PrebriefModalProps> = ({
  isOpen,
  onClose,
  commitments,
  activePersona,
  onMarkDone,
  onDrop,
  onClaim,
  onResolveRepeating,
}) => {
  // ESC key listener & focus management
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Categorize commitments for the Pre-brief
  const isDana = activePersona === 'dana';

  // 1. Yours to settle: active persona owns or is suggested to them, still open
  const yoursToSettle = commitments.filter((c) => {
    const isOwner =
      c.confirmedOwner?.toLowerCase() === activePersona.toLowerCase() ||
      (c.initialOwner?.toLowerCase() === activePersona.toLowerCase() && c.status !== 'dropped' && c.status !== 'done' && c.status !== 'dismissed');
    return isOwner && (c.status === 'claimed' || c.status === 'delivered' || c.status === 'suggested-to-other');
  });

  // 2. Waiting on others
  const waitingOnOthers = commitments.filter(
    (c) =>
      c.dependent?.name?.toLowerCase() === activePersona.toLowerCase() &&
      c.status !== 'done' &&
      c.status !== 'dropped'
  );

  // 3. Repeating without an owner (Arjun's roadmap item c2 or any unowned repeating)
  const repeatingWithoutOwner = commitments.filter(
    (c) =>
      (c.isRepeated || c.id === 'c2') &&
      (!c.confirmedOwner || c.confirmedOwner === 'unclear') &&
      c.status !== 'dropped' &&
      c.status !== 'done'
  );

  // 4. Closed since last time
  const closedSinceLastTime = commitments.filter(
    (c) => c.status === 'done' || c.status === 'dropped'
  );

  const isAllClear = yoursToSettle.length === 0 && (!isDana || repeatingWithoutOwner.length === 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prebrief-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: TOKENS.bgCard,
          borderColor: TOKENS.borderCard,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-white/8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#5B45F0]/15 text-[#5B45F0]">
                <Clock className="w-4 h-4" />
              </span>
              <h2 id="prebrief-modal-title" className="text-lg font-semibold text-[#EDEDEF]">
                Pre-brief: Weekly Product Sync
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-[#5B45F0]/20 text-[#A594FD]">
                Delivered 60 min before meeting
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Your 60-second preparation to settle promises, unblock teammates, and avoid repeating items in the room.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Pre-brief modal"
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0] focus-visible:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {isAllClear ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0F3324] border border-[#35C98B]/30 text-[#35C98B] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white">You are clear for this meeting.</h3>
              <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
                All promises made by you or waiting on you are resolved or updated. No loose commitments going into this sync.
              </p>
            </div>
          ) : (
            <>
              {/* Group 1: Yours to settle */}
              {yoursToSettle.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#A1A1AA]">
                      <span className="w-2 h-2 rounded-full bg-[#5B45F0]" />
                      Yours to settle ({yoursToSettle.length})
                    </h3>
                    <span className="text-[11px] text-[#A1A1AA]">
                      Choose Done or Drop with equal dignity
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {yoursToSettle.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-xl border border-white/8 bg-black/30 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-[#EDEDEF]">"{c.quote}"</p>
                              {c.priority && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold border ${
                                    c.priority === 'high'
                                      ? 'bg-amber-500/15 text-[#F5A524] border-amber-500/30'
                                      : c.priority === 'low'
                                      ? 'bg-white/5 text-neutral-400 border-white/10'
                                      : 'bg-[#5B45F0]/15 text-[#A594FD] border-[#5B45F0]/30'
                                  }`}
                                >
                                  <Flag className="w-2.5 h-2.5" />
                                  <span className="capitalize">{c.priority}</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#A1A1AA] mt-0.5 block">
                              Target date: {c.dueText} • Confidence: {Math.round(c.confidence * 100)}%
                            </span>
                          </div>
                        </div>

                        {/* Evidence hint if present */}
                        {c.looksDoneEvidence && (
                          <div className="p-2.5 rounded-lg bg-[#0F3324]/40 border border-[#35C98B]/30 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-[#35C98B]">
                              💡 Looks done? Mentioned in sync: "{c.looksDoneEvidence.evidenceQuote}"
                            </span>
                            <button
                              onClick={() => onMarkDone(c.id)}
                              className="px-2.5 py-1 rounded-md bg-[#35C98B] text-black font-semibold text-[11px] shrink-0"
                            >
                              Confirm Done
                            </button>
                          </div>
                        )}

                        {/* Actions: Done & Drop identical */}
                        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                          <button
                            onClick={() => onMarkDone(c.id)}
                            className="flex-1 h-9 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-[#EDEDEF] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#35C98B]" />
                            Done
                          </button>
                          <button
                            onClick={() => onDrop(c.id, 'Handled elsewhere')}
                            className="flex-1 h-9 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-[#EDEDEF] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0]"
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-[#A1A1AA] flex items-center justify-center text-[10px]">
                              ✕
                            </span>
                            Drop
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 2: Waiting on others */}
              {waitingOnOthers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#A1A1AA]">
                    <span className="w-2 h-2 rounded-full bg-[#F5A524]" />
                    Waiting on others ({waitingOnOthers.length})
                  </h3>
                  <div className="space-y-2">
                    {waitingOnOthers.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl border border-white/8 bg-black/20 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-[#EDEDEF]">"{c.quote}"</p>
                            {c.priority && (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold border ${
                                  c.priority === 'high'
                                    ? 'bg-amber-500/15 text-[#F5A524] border-amber-500/30'
                                    : c.priority === 'low'
                                    ? 'bg-white/5 text-neutral-400 border-white/10'
                                    : 'bg-[#5B45F0]/15 text-[#A594FD] border-[#5B45F0]/30'
                                }`}
                              >
                                <Flag className="w-2.5 h-2.5" />
                                <span className="capitalize">{c.priority}</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#A1A1AA]">
                            Owner: {c.confirmedOwner || c.initialOwner} • Due: {c.dueText}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#F5A524] px-2 py-0.5 rounded bg-amber-500/10">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 3: Repeating without an owner (Host Dana only) */}
              {isDana && repeatingWithoutOwner.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#A1A1AA]">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Repeating without an owner (Host view)
                    </h3>
                    <span className="text-[11px] text-red-400 font-medium">
                      Repeated in 2 consecutive syncs
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-white">
                        "we should update the roadmap before next week's leadership offsite"
                      </p>
                      <span className="text-[11px] text-[#A1A1AA] block mt-1">
                        Spoken by Arjun at 08:45 in Meeting 1, repeated at 06:15 in Meeting 2. No owner assigned.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-[#A1A1AA]">Host decision:</span>
                      <button
                        onClick={() => {
                          if (onResolveRepeating) onResolveRepeating('c2', 'own');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#5B45F0] hover:bg-[#4B36E0] text-white text-xs font-medium transition-colors"
                      >
                        Own it (Assign Priya)
                      </button>
                      <button
                        onClick={() => {
                          if (onResolveRepeating) onResolveRepeating('c2', 'split');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                      >
                        Split it into 2 tasks
                      </button>
                      <button
                        onClick={() => {
                          if (onResolveRepeating) onResolveRepeating('c2', 'drop');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white text-xs font-medium transition-colors"
                      >
                        Let it go (Drop)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Group 4: Closed since last time */}
              {closedSinceLastTime.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/8">
                  <h3 className="font-semibold text-[#35C98B] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Closed since last time ({closedSinceLastTime.length})
                  </h3>
                  <div className="space-y-1.5">
                    {closedSinceLastTime.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <span className="text-[#A1A1AA] line-through">"{c.quote}"</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            c.status === 'done'
                              ? 'bg-[#0F3324] text-[#35C98B]'
                              : 'bg-white/5 text-[#A1A1AA]'
                          }`}
                        >
                          {c.status === 'done' ? 'Completed' : `Dropped: ${c.dropReason || 'Planned change'}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-black/40 border-t border-white/8 flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#71717A]">
            Auto-sent via Slack DM & Fireflies meeting drawer exactly 60 minutes before scheduled start.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0]"
          >
            Done with Pre-brief
          </button>
        </div>
      </div>
    </div>
  );
};
