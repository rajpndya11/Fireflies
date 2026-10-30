import React, { useState } from 'react';
import {
  MessageSquare,
  Check,
  X,
  XCircle,
  Bell,
  Clock,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Commitment, TOKENS, TimeDay } from '../types';

interface SlackSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: string;
  commitments: Commitment[];
  currentDay: TimeDay;
  onClaim: (id: string, persona: string) => void;
  onSuggest: (id: string, suggestedTo: string) => void;
  onAnswerSuggestion: (id: string, accept: boolean, persona: string) => void;
  onMarkDone: (id: string, confirmedQuote?: string) => void;
  onDrop: (id: string, reason?: string) => void;
  onDismiss: (id: string) => void;
}

export const SlackSimulator: React.FC<SlackSimulatorProps> = ({
  isOpen,
  onClose,
  activePersona,
  commitments,
  currentDay,
  onClaim,
  onSuggest,
  onAnswerSuggestion,
  onMarkDone,
  onDrop,
  onDismiss,
}) => {
  const [tab, setTab] = useState<'dm' | 'channel' | 'digest'>('dm');

  if (!isOpen) return null;

  // Priya's primary card
  const priyaCard = commitments.find((c) => c.id === 'c1');
  // Marcus's suggested card
  const marcusSuggested = commitments.find((c) => c.id === 'c6');
  // Marcus's Redis card
  const marcusRedis = commitments.find((c) => c.id === 'c4');

  return (
    <div
      role="complementary"
      aria-label="Slack Simulator"
      className="fixed bottom-4 right-4 z-40 w-96 max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden bg-[#1A1D21] border-white/10 animate-fadeIn"
      style={{
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Slack Header */}
      <div className="p-3 px-4 bg-[#121417] border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8508F]" />
          <span className="text-xs font-bold text-white tracking-wide">
            Slack Simulator • #fireflies-app
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-[#35C98B] font-medium">
            Two-Way Sync Active
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slack Channels/DMs Bar */}
      <div className="px-3 py-2 bg-[#171A1E] border-b border-white/5 flex items-center gap-2 text-xs">
        <button
          onClick={() => setTab('dm')}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            tab === 'dm' ? 'bg-[#5B45F0] text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Fireflies Bot DM
        </button>
        <button
          onClick={() => setTab('channel')}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            tab === 'channel' ? 'bg-[#5B45F0] text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          #product-sync
        </button>
        <button
          onClick={() => setTab('digest')}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            tab === 'digest' ? 'bg-[#5B45F0] text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Daily Digest (09:00)
        </button>
      </div>

      {/* Body */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
        {tab === 'dm' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#5B45F0] text-white font-bold text-xs flex items-center justify-center shrink-0">
                FF
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-white text-xs">Fireflies Bot</span>
                  <span className="text-[10px] text-neutral-500">10:04 AM</span>
                </div>
                <p className="text-[#A1A1AA] text-xs">
                  Hi {activePersona === 'priya' ? 'Priya' : activePersona === 'marcus' ? 'Marcus' : 'there'}, I extracted candidate promises from your <strong>Weekly Product Sync</strong>:
                </p>
              </div>
            </div>

            {/* If Persona is Priya, show Pricing card */}
            {activePersona === 'priya' && priyaCard && (
              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white">Your Promise</span>
                  <span className="text-[10px] text-neutral-400">Target: Fri, Oct 30</span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/5 border-l-2 border-[#5B45F0] text-white font-medium text-xs italic">
                  "{priyaCard.quote}"
                </div>

                <div className="text-[11px] text-neutral-400">
                  Status:{' '}
                  <span className="font-semibold text-white">
                    {priyaCard.status === 'claimed'
                      ? 'Confirmed (Mine)'
                      : priyaCard.status === 'done'
                      ? 'Completed ✓'
                      : priyaCard.status === 'dropped'
                      ? `Dropped: ${priyaCard.dropReason || 'Planned change'}`
                      : 'Pending Confirmation'}
                  </span>
                </div>

                {priyaCard.status === 'claimed' ? (
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => onMarkDone('c1')}
                      className="flex-1 py-1.5 rounded-lg bg-[#0F3324] hover:bg-[#154631] text-[#35C98B] font-semibold text-xs border border-[#35C98B]/30 transition-colors"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => onDrop('c1', 'Plans changed')}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors"
                    >
                      Drop
                    </button>
                  </div>
                ) : priyaCard.status === 'delivered' ? (
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => onClaim('c1', 'Priya')}
                      className="flex-1 py-1.5 rounded-lg bg-[#5B45F0] hover:bg-[#4B36E0] text-white font-semibold text-xs transition-colors"
                    >
                      Mine
                    </button>
                    <button
                      onClick={() => onSuggest('c1', 'Marcus')}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-colors"
                    >
                      Suggest to peer
                    </button>
                    <button
                      onClick={() => onDismiss('c1')}
                      className="px-2 py-1.5 rounded-lg text-neutral-400 hover:text-white text-[11px]"
                    >
                      Not a promise
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            {/* If Persona is Marcus, show Suggested Rate Limiting card */}
            {activePersona === 'marcus' && marcusSuggested && (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-amber-300">
                    Suggested to you by Priya
                  </span>
                  <span className="text-[10px] text-neutral-400">Target: Fri, Nov 6</span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/5 border-l-2 border-amber-500 text-white font-medium text-xs italic">
                  "{marcusSuggested.quote}"
                </div>

                <div className="text-[11px] text-neutral-400">
                  Status:{' '}
                  <span className="font-semibold text-white">
                    {marcusSuggested.confirmedOwner === 'Marcus'
                      ? 'Accepted by Marcus'
                      : marcusSuggested.status === 'unclaimed'
                      ? 'Declined (Returned to Unassigned)'
                      : 'Pending your acceptance'}
                  </span>
                </div>

                {marcusSuggested.status === 'suggested-to-other' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onAnswerSuggestion('c6', true, 'Marcus')}
                      className="flex-1 py-1.5 rounded-lg bg-[#5B45F0] hover:bg-[#4B36E0] text-white font-semibold text-xs transition-colors"
                    >
                      Accept Commitment
                    </button>
                    <button
                      onClick={() => onAnswerSuggestion('c6', false, 'Marcus')}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 font-medium text-xs border border-white/10 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Day 12 / 13 "Still yours?" Prompt */}
            {currentDay >= 12 && priyaCard && priyaCard.status === 'claimed' && (
              <div className="p-3 rounded-xl border border-violet-500/30 bg-violet-500/10 space-y-2 text-xs">
                <span className="font-semibold text-white block">
                  Meeting coming up in 2 days. Still yours?
                </span>
                <p className="text-neutral-300 text-[11px]">
                  Weekly Product Sync takes place Tuesday. Would you like to keep this active or drop it cleanly?
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {}}
                    className="px-3 py-1 rounded-md bg-[#5B45F0] text-white font-medium text-xs"
                  >
                    Yes, still mine
                  </button>
                  <button
                    onClick={() => onDrop('c1', 'Plans changed')}
                    className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white font-medium text-xs"
                  >
                    Drop
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'channel' && (
          <div className="space-y-3">
            <div className="text-[11px] text-neutral-500 text-center">
              Channel #product-sync • 10 participants
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/8 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Fireflies Close-out Bot</span>
                <span className="text-[10px] text-neutral-500">10:25 AM</span>
              </div>
              <p className="text-neutral-300 text-xs">
                Meeting recap for <strong>Weekly Product Sync</strong>:
              </p>
              <ul className="list-disc pl-4 text-[11px] text-neutral-400 space-y-1">
                <li>Priya confirmed: Pricing deck to sales by Friday.</li>
                <li>Marcus confirmed: p99 latency benchmarks by Thursday.</li>
                <li>Alex (Guest): API benchmark logs shared via guest link.</li>
                <li>Unassigned: "we should update roadmap" (routed to Dana).</li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'digest' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-black/40 border border-white/8 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Clock className="w-3.5 h-3.5 text-[#5B45F0]" />
                Daily Digest (09:00 AM)
              </div>
              <p className="text-[11px] text-neutral-400">
                You have 1 open commitment due this week. Nudge budget for this item: 1 of 2 sent.
              </p>
              <div className="p-2 rounded-lg bg-white/5 text-xs text-white">
                "I'll send the pricing deck to the sales team by Friday."
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 px-4 bg-[#121417] border-t border-white/8 flex items-center justify-between text-[11px] text-neutral-500">
        <span>Capped Nudges: Max 2/week</span>
        <span>Consent Enforced</span>
      </div>
    </div>
  );
};
