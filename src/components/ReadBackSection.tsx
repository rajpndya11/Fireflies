import React, { useState } from 'react';
import {
  Video,
  MessageSquare,
  Check,
  X,
  Volume2,
  Users,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { TOKENS } from '../types';

interface ReadBackSectionProps {
  onClaimItem?: (id: string, name: string) => void;
  claimedMap?: Record<string, string>;
  activePersonaName: string;
}

export const ReadBackSection: React.FC<ReadBackSectionProps> = ({
  onClaimItem,
  claimedMap = {},
  activePersonaName,
}) => {
  const [platform, setPlatform] = useState<'zoom' | 'meet' | 'teams' | 'slack'>('zoom');
  const [hostPreset, setHostPreset] = useState<'team_sync' | 'one_on_one' | 'client_call'>('team_sync');
  const [replayMode, setReplayMode] = useState<'with_closeout' | 'without_closeout'>('with_closeout');
  const [unownedClaimed, setUnownedClaimed] = useState<string | null>(null);

  const isRoadmapClaimed = unownedClaimed || claimedMap['c2'];

  return (
    <div
      className="p-6 rounded-2xl border"
      style={{
        backgroundColor: TOKENS.bgCard,
        borderColor: TOKENS.borderCard,
      }}
    >
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#5B45F0]/15 text-[#5B45F0]">
              <Volume2 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-semibold text-[#EDEDEF]">
              Before You Leave: Last 3-Minute Read-back
            </h3>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: 'rgba(53, 201, 139, 0.15)',
                color: TOKENS.successGreenText,
              }}
            >
              Leading Indicator: 83% Owned
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Delivered in the meeting room before disconnect. Attendees confirm promises live with one tap.
          </p>
        </div>

        {/* Replay Comparison Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-black/40 p-1 rounded-xl border border-white/8">
          <span className="text-[11px] text-[#A1A1AA] pl-2 font-medium">Replay Comparison:</span>
          <button
            onClick={() => setReplayMode('without_closeout')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              replayMode === 'without_closeout'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Without Close-out
          </button>
          <button
            onClick={() => setReplayMode('with_closeout')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              replayMode === 'with_closeout'
                ? 'bg-[#5B45F0] text-white shadow-sm'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            With Close-out
          </button>
        </div>
      </div>

      {/* Replay State Banner if 'without_closeout' */}
      {replayMode === 'without_closeout' ? (
        <div className="mt-5 p-5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#F5A524] mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Without Close-out: The Broadcast Summary Trap
              </h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3">
                Fireflies sends an email recap 10 minutes after the call with 5 extracted tasks.
                Because nobody was prompted to accept before leaving, zero items have explicit consent.
                Result: <strong>0% owned items</strong>, tasks languish unassigned, and repeat in next week's sync.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-[11px] text-[#A1A1AA] block">Delivery Method</span>
                  <span className="font-medium text-white">Broadcast email</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-[11px] text-[#A1A1AA] block">Consent Required</span>
                  <span className="font-medium text-amber-400">None (Auto-assigned)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-[11px] text-[#A1A1AA] block">Room Closure</span>
                  <span className="font-medium text-amber-400">0% confirmed</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-[11px] text-[#A1A1AA] block">14-Day Resolution</span>
                  <span className="font-medium text-white">28% (Baseline)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* With Close-out Active Experience */
        <div className="mt-5 space-y-5">
          {/* Preset Selector & Platform Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#A1A1AA]">Host Preset:</span>
              {(
                [
                  { id: 'team_sync', label: 'Team sync' },
                  { id: 'one_on_one', label: '1:1' },
                  { id: 'client_call', label: 'Client call' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setHostPreset(preset.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    hostPreset === preset.id
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-[#A1A1AA] hover:text-white bg-transparent border border-white/5'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Platform in-meeting switcher */}
            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
              <span className="text-[11px] text-[#71717A] px-2 font-medium">Render in:</span>
              <button
                onClick={() => setPlatform('zoom')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  platform === 'zoom'
                    ? 'bg-blue-600 text-white'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Zoom App
              </button>
              <button
                onClick={() => setPlatform('meet')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  platform === 'meet'
                    ? 'bg-emerald-600 text-white'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Google Meet
              </button>
              <button
                onClick={() => setPlatform('teams')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  platform === 'teams'
                    ? 'bg-indigo-600 text-white'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                MS Teams
              </button>
              <button
                onClick={() => setPlatform('slack')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  platform === 'slack'
                    ? 'bg-[#E8508F] text-white'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Slack DM
              </button>
            </div>
          </div>

          {/* In-Meeting Floating Simulation Box */}
          <div className="rounded-xl border border-white/10 overflow-hidden bg-[#141416] shadow-xl">
            {/* Window bar */}
            <div className="px-4 py-2.5 bg-black/50 border-b border-white/8 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[#A1A1AA] ml-2 font-mono text-[11px]">
                  {platform === 'zoom' && 'Zoom In-Meeting Apps > Fireflies Close-out (Right Dock)'}
                  {platform === 'meet' && 'Google Meet Side Panel > Fireflies Companion'}
                  {platform === 'teams' && 'Microsoft Teams Meeting Stage > Side Tab'}
                  {platform === 'slack' && '#product-sync Slack Channel Bot Broadcast'}
                </span>
              </div>
              <span className="text-[11px] text-[#35C98B] flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#35C98B] animate-pulse" />
                Live In-Meeting Sync (Minute 22:30 / 25:00)
              </span>
            </div>

            {/* In-meeting UI Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-white">
                    {hostPreset === 'team_sync' && 'Weekly Product Sync — Read-back'}
                    {hostPreset === 'one_on_one' && '1:1 Coaching Sync — Action Items'}
                    {hostPreset === 'client_call' && 'Enterprise Client Call — Agreed Deliverables'}
                  </h5>
                  <p className="text-[11px] text-[#A1A1AA]">
                    "Here is what I heard today. Please confirm your items before we disconnect:"
                  </p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-[#A1A1AA]">
                  Preset: {hostPreset.replace('_', ' ')}
                </span>
              </div>

              {/* Items List inside meeting */}
              <div className="space-y-2">
                {/* Item 1: Priya */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/8 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">Priya</span>
                      <span className="text-[11px] text-[#71717A]">[04:12]</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#35C98B]/15 text-[#35C98B] font-medium">
                        Confirmed Live
                      </span>
                    </div>
                    <p className="text-xs text-[#EDEDEF]">
                      "I'll send the pricing deck to the sales team by Friday."
                    </p>
                    <span className="text-[11px] text-[#A1A1AA] block">Target: Fri, Oct 30, 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-[#35C98B]/20 text-[#35C98B] text-[11px] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Mine
                    </span>
                  </div>
                </div>

                {/* Item 2: Marcus */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/8 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">Marcus</span>
                      <span className="text-[11px] text-[#71717A]">[18:05]</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#35C98B]/15 text-[#35C98B] font-medium">
                        Confirmed Live
                      </span>
                    </div>
                    <p className="text-xs text-[#EDEDEF]">
                      "Yeah, I can take that and benchmark the p99 latency by Thursday."
                    </p>
                    <span className="text-[11px] text-[#A1A1AA] block">Target: Thu, Oct 29, 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-[#35C98B]/20 text-[#35C98B] text-[11px] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Mine
                    </span>
                  </div>
                </div>

                {/* Item 3: Alex (Guest) */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/8 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">Alex (Guest)</span>
                      <span className="text-[11px] text-[#71717A]">[12:20]</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#5B45F0]/20 text-[#A594FD] font-medium">
                        Guest Email Link Prepared
                      </span>
                    </div>
                    <p className="text-xs text-[#EDEDEF]">
                      "I'll share the API benchmark logs after this call."
                    </p>
                    <span className="text-[11px] text-[#A1A1AA] block">Target: Tue, Oct 27, 2026</span>
                  </div>
                  <div className="shrink-0 text-xs">
                    <span className="text-[11px] text-[#A1A1AA]">Consent Link Sent</span>
                  </div>
                </div>

                {/* Item 4: Unowned - Arjun 'we should update the roadmap' */}
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">Arjun</span>
                      <span className="text-[11px] text-[#71717A]">[08:45]</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-[#F5A524] font-medium">
                        {isRoadmapClaimed ? 'Claimed in Room' : 'Unowned Statement ("we")'}
                      </span>
                    </div>
                    <p className="text-xs text-[#EDEDEF]">
                      "we should update the roadmap before next week's leadership offsite."
                    </p>
                    <span className="text-[11px] text-[#A1A1AA] block">
                      Target: Before next sprint • {isRoadmapClaimed ? `Claimed by ${isRoadmapClaimed}` : 'No one has claimed this yet'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isRoadmapClaimed ? (
                      <span className="px-2.5 py-1 rounded-md bg-[#35C98B]/20 text-[#35C98B] text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Claimed by {isRoadmapClaimed}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setUnownedClaimed(activePersonaName);
                            if (onClaimItem) onClaimItem('c2', activePersonaName);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#5B45F0] hover:bg-[#4B36E0] text-white text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Mine
                        </button>
                        <button
                          onClick={() => {
                            setUnownedClaimed('Deferred to Host');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A1A1AA] text-xs font-medium transition-colors"
                        >
                          Not me
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Footer of In-meeting UI */}
              <div className="pt-2 flex items-center justify-between text-xs text-[#A1A1AA] border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#35C98B]" />
                  Zero forced assignments: Every promise required live confirmation.
                </span>
                <span className="font-semibold text-white">
                  Room Ownership Rate: <span className="text-[#35C98B]">83%</span> (5 of 6 clear)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
