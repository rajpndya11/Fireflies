import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  BookOpen,
  FileCheck
} from 'lucide-react';
import { TOKENS } from '../types';

export const CommitmentApiSpec: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'diagram' | 'webhooks' | 'trust' | 'events'>('diagram');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleWebhookPayload = `{
  "event": "commitment.claimed",
  "workspace_id": "ws_fireflies_prod",
  "timestamp": "2026-10-27T10:04:12Z",
  "data": {
    "commitment_id": "c1_pricing_deck",
    "meeting": {
      "id": "m1_weekly_sync",
      "title": "Weekly Product Sync",
      "timestamp_offset": "04:12"
    },
    "verbatim_quote": "I'll send the pricing deck to the sales team by Friday.",
    "speaker": "Priya",
    "confirmed_owner": "Priya",
    "target_date": "2026-10-30",
    "confidence_score": 0.96,
    "consent_verified": true,
    "outbound_sync": {
      "slack_channel": "#product-sync",
      "jira_issue_key": null,
      "calendar_block": true
    }
  }
}`;

  const allEvents = [
    { name: 'commitment_extracted', desc: 'AI extracts candidate commitment from transcript with verbatim quote and timestamp.' },
    { name: 'card_delivered', desc: 'Interactive card delivered to speaker via Slack DM or Fireflies app.' },
    { name: 'commitment_claimed', desc: 'Speaker explicitly taps "Mine", establishing human consent and confirmed ownership.' },
    { name: 'owner_suggested', desc: 'Speaker suggests commitment to another teammate with optional context.' },
    { name: 'owner_suggestion_answered', desc: 'Teammate explicitly accepts or declines suggested commitment.' },
    { name: 'commitment_dismissed', desc: 'Candidate flagged as not a commitment (stays in resolution denominator).' },
    { name: 'nudge_sent', desc: 'Capped nudge delivered (max 2 per week) prompting action before deadline.' },
    { name: 'nudge_actioned', desc: 'Recipient responds to nudge by confirming, adjusting date, or dropping.' },
    { name: 'closure_suggested', desc: 'Later meeting transcript evidence detected; suggests human confirmation.' },
    { name: 'commitment_closed', desc: 'Human confirms commitment is Done with optional evidence quote.' },
    { name: 'commitment_repeated', desc: 'Loop Keeper identifies unresolved commitment re-discussed in later meeting.' },
    { name: 'commitment_expired', desc: 'Item reached Day 14 without closure; transitions to went-quiet status.' },
    { name: 'prebrief_opened', desc: 'Participant opens 60-minute pre-brief drawer before recurring sync.' },
    { name: 'report_viewed', desc: 'Manager or admin views K-anonymized aggregate follow-through report.' },
    { name: 'readback_posted', desc: 'In-meeting read-back summary delivered in last 3 minutes of call.' },
    { name: 'readback_replied', desc: 'Attendee claims or rejects unowned item during in-meeting read-back.' },
    { name: 'dependent_notified', desc: 'Human-approved notification dispatched to dependent colleague upon closure.' },
    { name: 'blocker_updated', desc: 'Owner records or clears blocker without penalizing task score.' },
    { name: 'deadline_adjusted', desc: 'Owner updates target date with explicit reason to maintain honest timeline.' },
  ];

  return (
    <div
      className="p-6 rounded-2xl border space-y-6"
      style={{
        backgroundColor: TOKENS.bgCard,
        borderColor: TOKENS.borderCard,
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#5B45F0]/15 text-[#5B45F0]">
              <Code className="w-4 h-4" />
            </span>
            <h3 className="text-base font-semibold text-[#EDEDEF]">
              Fireflies Commitment API & State Architecture
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-white font-medium">
              v1.4 Spec
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Two-way sync with Jira, Asana, Slack, and Google Calendar. No boards, no sprints, no new backlog to maintain.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/8">
          <button
            onClick={() => setActiveSubTab('diagram')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === 'diagram' ? 'bg-[#5B45F0] text-white' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            State Machine
          </button>
          <button
            onClick={() => setActiveSubTab('webhooks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === 'webhooks' ? 'bg-[#5B45F0] text-white' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Webhooks
          </button>
          <button
            onClick={() => setActiveSubTab('events')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === 'events' ? 'bg-[#5B45F0] text-white' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Event Spec (19)
          </button>
          <button
            onClick={() => setActiveSubTab('trust')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === 'trust' ? 'bg-[#5B45F0] text-white' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Trust & Privacy
          </button>
        </div>
      </div>

      {/* Subtab 1: SVG State Machine Diagram */}
      {activeSubTab === 'diagram' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-black/40 border border-white/8 overflow-x-auto">
            <svg
              viewBox="0 0 900 240"
              className="w-full min-w-[700px] h-auto text-xs font-mono select-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-flow">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717A" />
                </marker>
                <marker id="arrow-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-flow">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#35C98B" />
                </marker>
              </defs>

              {/* Node 1: Extracted */}
              <rect x="20" y="90" width="105" height="42" rx="8" fill="#1B1B1D" stroke="#5B45F0" strokeWidth="1.5" />
              <text x="72" y="115" fill="#EDEDEF" textAnchor="middle" fontSize="11" fontWeight="600">1. Extracted</text>

              {/* Edge 1 -> 2 */}
              <line x1="125" y1="111" x2="165" y2="111" stroke="#71717A" strokeWidth="1.5" markerEnd="url(#arrow)" />

              {/* Node 2: Delivered */}
              <rect x="170" y="90" width="105" height="42" rx="8" fill="#1B1B1D" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <text x="222" y="115" fill="#EDEDEF" textAnchor="middle" fontSize="11" fontWeight="600">2. Delivered</text>

              {/* Edge 2 -> 3 (Claimed) */}
              <line x1="275" y1="111" x2="335" y2="111" stroke="#35C98B" strokeWidth="1.5" markerEnd="url(#arrow-green)" />
              <text x="305" y="103" fill="#35C98B" textAnchor="middle" fontSize="9">Mine (Consent)</text>

              {/* Edge 2 -> 4 (Suggested) */}
              <path d="M 222 90 L 222 45 L 340 45" fill="none" stroke="#71717A" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <text x="275" y="38" fill="#A1A1AA" textAnchor="middle" fontSize="9">Suggest</text>

              {/* Edge 2 -> Dismissed */}
              <path d="M 222 132 L 222 190 L 340 190" fill="none" stroke="#71717A" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <text x="275" y="182" fill="#A1A1AA" textAnchor="middle" fontSize="9">Not commitment</text>

              {/* Node 3: Claimed / Active */}
              <rect x="345" y="90" width="115" height="42" rx="8" fill="#1B1B1D" stroke="#35C98B" strokeWidth="1.5" />
              <text x="402" y="115" fill="#35C98B" textAnchor="middle" fontSize="11" fontWeight="600">3. Confirmed</text>

              {/* Node 4: Suggested */}
              <rect x="345" y="24" width="115" height="42" rx="8" fill="#1B1B1D" stroke="#F5A524" strokeWidth="1.5" />
              <text x="402" y="49" fill="#F5A524" textAnchor="middle" fontSize="11" fontWeight="600">Suggested</text>

              {/* Node: Dismissed */}
              <rect x="345" y="169" width="115" height="42" rx="8" fill="#1B1B1D" stroke="#71717A" strokeWidth="1.5" />
              <text x="402" y="194" fill="#A1A1AA" textAnchor="middle" fontSize="11">Not a promise</text>

              {/* Edge 3 -> Done */}
              <line x1="460" y1="100" x2="570" y2="70" stroke="#35C98B" strokeWidth="1.5" markerEnd="url(#arrow-green)" />
              <text x="510" y="80" fill="#35C98B" textAnchor="middle" fontSize="9">Done</text>

              {/* Edge 3 -> Drop */}
              <line x1="460" y1="115" x2="570" y2="115" stroke="#EDEDEF" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <text x="515" y="110" fill="#EDEDEF" textAnchor="middle" fontSize="9">Drop (1-tap)</text>

              {/* Edge 3 -> Went Quiet */}
              <line x1="460" y1="125" x2="570" y2="165" stroke="#71717A" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <text x="515" y="152" fill="#71717A" textAnchor="middle" fontSize="9">Day 14</text>

              {/* Final State 1: Done */}
              <rect x="580" y="50" width="120" height="40" rx="8" fill="#0F3324" stroke="#35C98B" strokeWidth="1.5" />
              <text x="640" y="75" fill="#35C98B" textAnchor="middle" fontSize="11" fontWeight="600">✓ Done (Resolved)</text>

              {/* Final State 2: Dropped */}
              <rect x="580" y="98" width="120" height="40" rx="8" fill="#222226" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
              <text x="640" y="123" fill="#EDEDEF" textAnchor="middle" fontSize="11" fontWeight="600">✕ Dropped (Resolved)</text>

              {/* Final State 3: Went Quiet */}
              <rect x="580" y="148" width="120" height="40" rx="8" fill="#18181A" stroke="#71717A" strokeWidth="1.5" />
              <text x="640" y="173" fill="#71717A" textAnchor="middle" fontSize="11">Went Quiet (Unresolved)</text>

              {/* Metric Box */}
              <rect x="730" y="50" width="150" height="138" rx="10" fill="black" stroke="#5B45F0" strokeWidth="1" strokeDasharray="3 3" />
              <text x="805" y="75" fill="#EDEDEF" textAnchor="middle" fontSize="10" fontWeight="bold">HONEST RESOLUTION</text>
              <text x="805" y="98" fill="#35C98B" textAnchor="middle" fontSize="12" fontWeight="bold">Done + Dropped</text>
              <line x1="745" y1="108" x2="865" y2="108" stroke="rgba(255,255,255,0.2)" />
              <text x="805" y="125" fill="#EDEDEF" textAnchor="middle" fontSize="11">All Extracted</text>
              <text x="805" y="145" fill="#A1A1AA" textAnchor="middle" fontSize="9">Dismissed stays</text>
              <text x="805" y="160" fill="#A1A1AA" textAnchor="middle" fontSize="9">in denominator</text>
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-1">
              <span className="font-semibold text-white">1. Strict Human Consent</span>
              <p className="text-[#A1A1AA]">
                AI extracts candidate promises, but never marks an item active or assigned without affirmative tap from the individual.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-1">
              <span className="font-semibold text-white">2. Equal Dignity for Drop</span>
              <p className="text-[#A1A1AA]">
                Dropping a commitment is a valid resolution outcome that clears mental overhead. It has identical button size and positive impact on the team resolution rate.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-1">
              <span className="font-semibold text-white">3. Zero Denominator Gaming</span>
              <p className="text-[#A1A1AA]">
                Dismissing a task as "Not a commitment" does not decrease the denominator. Dismissed cards stay counted so teams cannot inflate their resolution metric.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Webhooks */}
      {activeSubTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A1A1AA]">
              Real-time JSON event payload dispatched to configured webhooks (Slack, Jira, Asana, Zapier):
            </span>
            <button
              onClick={() => copyToClipboard(sampleWebhookPayload, 'webhook')}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-white flex items-center gap-1 border border-white/10 transition-colors"
            >
              {copiedKey === 'webhook' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#35C98B]" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy JSON
                </>
              )}
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-black/60 border border-white/8 font-mono text-xs text-[#EDEDEF] overflow-x-auto leading-relaxed">
            {sampleWebhookPayload}
          </pre>
        </div>
      )}

      {/* Subtab 3: Event Spec */}
      {activeSubTab === 'events' && (
        <div className="space-y-3">
          <div className="text-xs text-[#A1A1AA] pb-1">
            Complete telemetry event schema (19 registered event types logged in the event ledger):
          </div>
          <div className="divide-y divide-white/5 rounded-xl border border-white/8 bg-black/20 max-h-96 overflow-y-auto">
            {allEvents.map((ev, idx) => (
              <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-mono text-[#5B45F0] font-semibold shrink-0">
                  {ev.name}
                </span>
                <span className="text-[#A1A1AA] sm:text-right">
                  {ev.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 4: Trust Sheet */}
      {activeSubTab === 'trust' && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-black/30 border border-white/8 space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#35C98B]" />
              Enterprise Trust & Non-Surveillance Architecture
            </h4>
            <p className="text-[#A1A1AA] leading-relaxed">
              Fireflies Close-out is engineered specifically to eliminate the anxiety and surveillance traps of traditional workplace task tracking.
            </p>
            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-lg bg-black/20 border border-white/5">
                <span className="font-medium text-white block">1. Mathematical K-Anonymity (k=5)</span>
                <span className="text-[#A1A1AA]">
                  Managers never see individual names, task lists, or personal completion percentages. Cohorts under 5 people are automatically suppressed.
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/20 border border-white/5">
                <span className="font-medium text-white block">2. In-Room Visibility Follows Invite</span>
                <span className="text-[#A1A1AA]">
                  Commitments are visible only to participants who were on the meeting invite. No cross-organizational snooping.
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/20 border border-white/5">
                <span className="font-medium text-white block">3. Strict Nudge Caps (Max 2 / Week)</span>
                <span className="text-[#A1A1AA]">
                  Users are protected from notification spam. An item can receive at most two gentle nudges before either being brought to the 60-min pre-brief or quietly transitioning to went-quiet.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
