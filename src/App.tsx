/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Fireflies Close-out: From Spoken to Closed
 * An upgrade to Fireflies' existing Tasks & Meeting Prep turning extracted
 * commitments into owned items that reach honest closure.
 */

import React, { useReducer, useState, useMemo, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  UserCheck,
  UserX,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Shield,
  Sliders,
  Play,
  Share2,
  ExternalLink,
  MessageSquare,
  Calendar,
  Layers,
  BarChart3,
  Check,
  X,
  Lock,
  Eye,
  Bell,
  RefreshCw,
  Search,
  Zap,
  Info,
  HelpCircle,
  FileText,
  CornerDownRight,
  Inbox,
  Plus,
  AlertCircle,
  Users,
  Compass,
  Printer,
  Volume2,
  Flag
} from 'lucide-react';

import {
  Commitment,
  CommitmentStatus,
  CommitmentPriority,
  TimeDay,
  PersonaId,
  AppEventLog,
  TOKENS
} from './types';

import { ReadBackSection } from './components/ReadBackSection';
import { PrebriefModal } from './components/PrebriefModal';
import { AnalyticsEvalView } from './components/AnalyticsEvalView';
import { WorkspaceReportModal } from './components/WorkspaceReportModal';
import { CommitmentApiSpec } from './components/CommitmentApiSpec';
import { GuestConsentModal } from './components/GuestConsentModal';
import { SlackSimulator } from './components/SlackSimulator';
import { SelfTestModal } from './components/SelfTestModal';
import { GuidedStepper, STEPS } from './components/GuidedStepper';

/* ==========================================================================
   CONSTANTS & SEED DATA
   ========================================================================== */
export const LOCAL_STORAGE_KEY = 'fireflies_closeout_v4';

export const PERSONAS: Record<PersonaId, {
  id: PersonaId;
  name: string;
  roleTitle: string;
  avatarInitials: string;
  avatarColor: string;
  description: string;
}> = {
  priya: {
    id: 'priya',
    name: 'Priya',
    roleTitle: 'Product Manager (Owner)',
    avatarInitials: 'PR',
    avatarColor: '#8B5CF6',
    description: 'Meeting speaker & commitment owner. Can claim, suggest, drop, or mark done.',
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus',
    roleTitle: 'Staff Engineer (Dependent)',
    avatarInitials: 'MC',
    avatarColor: '#3B82F6',
    description: 'Teammate who receives suggested commitments and can accept or decline.',
  },
  dana: {
    id: 'dana',
    name: 'Dana',
    roleTitle: 'VP of Product (Manager & Host)',
    avatarInitials: 'DN',
    avatarColor: '#10B981',
    description: 'Manager view: aggregate team velocity and closure mix with K-anonymity privacy.',
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    roleTitle: 'Workspace Admin',
    avatarInitials: 'AD',
    avatarColor: '#F59E0B',
    description: 'Controls workspace defaults, nudge caps, and integration connections.',
  },
};

export const INITIAL_COMMITMENTS: Commitment[] = [
  {
    id: 'c1',
    meetingId: 'm1',
    meetingTitle: 'Weekly Product Sync',
    speaker: 'Priya',
    quote: "I'll send the pricing deck to the sales team by Friday.",
    timestamp: '04:12',
    dueText: 'Fri, Oct 30, 2026',
    initialOwner: 'Priya',
    confirmedOwner: 'Priya',
    status: 'claimed',
    priority: 'high',
    confidence: 0.96,
    deliveryChannel: 'slack',
    nudgesCount: 0,
    extractedAtDay: 0,
    looksDoneEvidence: {
      evidenceQuote: 'I sent out the pricing deck on Thursday night, sales confirmed receipt.',
      meetingTitle: 'Weekly Product Sync (Nov 3)',
      timestamp: '01:10',
    },
    dependent: {
      name: 'Arjun',
      role: 'Head of Sales',
      need: 'Enterprise sales one-pager deck for month-end pipeline',
      updateStatus: 'none',
    },
    blocker: {
      isBlocked: false,
      reason: 'Legal SLA footnote sign-off pending',
    },
    deadlineHistory: {
      originalDue: 'Fri, Oct 30, 2026',
    },
  },
  {
    id: 'c2',
    meetingId: 'm1',
    meetingTitle: 'Weekly Product Sync',
    speaker: 'Arjun',
    quote: "we should update the roadmap before next week's leadership offsite",
    timestamp: '08:45',
    dueText: 'Before next sprint',
    initialOwner: 'unclear',
    status: 'unclaimed',
    priority: 'medium',
    confidence: 0.68,
    deliveryChannel: 'app',
    nudgesCount: 1,
    extractedAtDay: 0,
    isRepeated: false,
    repeatMentionCount: 0,
    isOwnerless: true,
  },
  {
    id: 'c3',
    meetingId: 'm1',
    meetingTitle: 'Weekly Product Sync',
    speaker: 'Alex (Guest)',
    quote: "I'll share the API benchmark logs after this call.",
    timestamp: '12:20',
    dueText: 'Tue, Oct 27, 2026',
    initialOwner: 'Alex (Guest)',
    status: 'delivered',
    priority: 'medium',
    confidence: 0.92,
    deliveryChannel: 'slack',
    nudgesCount: 0,
    extractedAtDay: 0,
    isGuest: true,
  },
  {
    id: 'c4',
    meetingId: 'm1',
    meetingTitle: 'Weekly Product Sync',
    speaker: 'Marcus',
    quote: 'Yeah, I can take that and benchmark the p99 latency by Thursday.',
    timestamp: '18:05',
    dueText: 'Thu, Oct 29, 2026',
    initialOwner: 'Marcus',
    confirmedOwner: 'Marcus',
    status: 'claimed',
    priority: 'high',
    confidence: 0.94,
    deliveryChannel: 'slack',
    nudgesCount: 0,
    extractedAtDay: 0,
    deadlineHistory: {
      originalDue: 'Thu, Oct 29, 2026',
    },
  },
  {
    id: 'c5',
    meetingId: 'm1',
    meetingTitle: 'Weekly Product Sync',
    speaker: 'Priya',
    quote: 'maybe someone could look at pricing someday',
    timestamp: '20:00',
    dueText: 'Someday (Hypothetical)',
    initialOwner: 'Priya',
    status: 'dismissed',
    priority: 'low',
    confidence: 0.32,
    deliveryChannel: 'app',
    nudgesCount: 0,
    extractedAtDay: 0,
  },
  {
    id: 'c6',
    meetingId: 'm1',
    meetingTitle: 'Weekly Product Sync',
    speaker: 'Priya',
    quote: 'Marcus, could you draft the API rate limiting specification before our next platform review?',
    timestamp: '07:15',
    dueText: 'Fri, Nov 6, 2026',
    initialOwner: 'Priya',
    suggestedOwner: 'Marcus',
    status: 'suggested-to-other',
    priority: 'medium',
    confidence: 0.89,
    deliveryChannel: 'slack',
    nudgesCount: 0,
    extractedAtDay: 0,
  },
];

/* ==========================================================================
   APP STATE & REDUCER
   ========================================================================== */
interface UndoToast {
  commitmentId: string;
  previousCommitment: Commitment;
  timerSeconds: number;
  actionDescription: string;
}

interface AppState {
  mode: 'today' | 'closeout';
  activePersona: PersonaId;
  activeScreen: string;
  currentDay: TimeDay;
  commitments: Commitment[];
  eventLog: AppEventLog[];
  undoToast: UndoToast | null;
  guidedStep: number;
  slackOpen: boolean;
  prebriefModalOpen: boolean;
  workspaceReportOpen: boolean;
  guestConsentModalOpen: boolean;
  selfTestModalOpen: boolean;
  whyThisCardModalId: string | null;
  managerCohortSize: number;
  adminSettings: {
    nudgeCapPerWeek: number;
    confidenceThreshold: number;
    slackConnected: boolean;
    jiraConnected: boolean;
    asanaConnected: boolean;
    calendarConnected: boolean;
  };
  metricsSim: {
    claimRate: number;
    rClaimed: number;
    rUnclaimed: number;
    workspaces: number;
    arpa: number;
    newArpa: number;
    seatPrice: number;
    deltaRetention: number;
    deltaConversion: number;
    deltaSeats: number;
  };
  tasksSubTab: 'open' | 'waiting' | 'closed';
  meetingsSubTab: 'overview' | 'readback' | 'transcript';
  integrationsSubTab: 'overview' | 'api';
  analyticsSubTab: 'velocity' | 'eval';
  danaHostRouteAction: 'suggest' | 'unowned' | 'drop' | null;
}

type Action =
  | { type: 'SET_MODE'; mode: 'today' | 'closeout' }
  | { type: 'SET_PERSONA'; persona: PersonaId }
  | { type: 'SET_SCREEN'; screen: string }
  | { type: 'SET_TIME_DAY'; day: TimeDay }
  | { type: 'CLAIM_COMMITMENT'; id: string; persona: string }
  | { type: 'SUGGEST_OWNER'; id: string; suggestedTo: string }
  | { type: 'ANSWER_SUGGESTION'; id: string; accept: boolean; persona: string }
  | { type: 'DISMISS_COMMITMENT'; id: string; reason?: string }
  | { type: 'MARK_DONE'; id: string; confirmedQuote?: string }
  | { type: 'DROP_COMMITMENT_1TAP'; id: string }
  | { type: 'SET_DROP_CHIP'; id: string; reason: string }
  | { type: 'REASSIGN_COMMITMENT'; id: string; newOwner: string }
  | { type: 'TOGGLE_PRIORITY'; id: string }
  | { type: 'SET_PRIORITY'; id: string; priority: CommitmentPriority }
  | { type: 'CONFIRM_GUEST_CONSENT'; id: string }
  | { type: 'DANA_ROUTE_CARD'; id: string; decision: 'suggest' | 'unowned' | 'drop'; targetOwner?: string }
  | { type: 'UNDO_LAST_ACTION' }
  | { type: 'CLEAR_UNDO' }
  | { type: 'ADVANCE_GUIDED_STEP'; step?: number }
  | { type: 'TOGGLE_SLACK'; open?: boolean }
  | { type: 'OPEN_PREBRIEF'; open: boolean }
  | { type: 'OPEN_WORKSPACE_REPORT'; open: boolean }
  | { type: 'OPEN_GUEST_CONSENT'; open: boolean }
  | { type: 'OPEN_SELF_TEST'; open: boolean }
  | { type: 'OPEN_WHY_THIS_CARD'; id: string | null }
  | { type: 'SET_MANAGER_COHORT_SIZE'; size: number }
  | { type: 'SET_TASKS_SUB_TAB'; tab: 'open' | 'waiting' | 'closed' }
  | { type: 'SET_MEETINGS_SUB_TAB'; tab: 'overview' | 'readback' | 'transcript' }
  | { type: 'SET_INTEGRATIONS_SUB_TAB'; tab: 'overview' | 'api' }
  | { type: 'SET_ANALYTICS_SUB_TAB'; tab: 'velocity' | 'eval' }
  | { type: 'UPDATE_METRICS_SIM'; payload: Partial<AppState['metricsSim']> }
  | { type: 'RESET_DEMO' };

function logEvent(
  state: AppState,
  type: AppEventLog['type'],
  payload: Record<string, any>
): AppEventLog[] {
  const newEntry: AppEventLog = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    simulatedDay: state.currentDay,
    type,
    payload,
  };
  return [newEntry, ...state.eventLog].slice(0, 100);
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_PERSONA':
      return { ...state, activePersona: action.persona };

    case 'SET_SCREEN':
      return { ...state, activeScreen: action.screen };

    case 'SET_TIME_DAY': {
      const newDay = action.day;
      let updatedCommitments = state.commitments.map((c) => ({ ...c }));
      let newEvents = [...state.eventLog];

      // Day 2: Nudges triggered for unresponded items (capped at 2)
      if (newDay >= 2) {
        updatedCommitments = updatedCommitments.map((c) => {
          if (c.status === 'delivered' && c.nudgesCount === 0) {
            newEvents = [
              {
                id: `ev-nudge-${c.id}-${Date.now()}`,
                timestamp: '09:00:00',
                simulatedDay: newDay,
                type: 'nudge_sent',
                payload: { commitmentId: c.id, recipient: c.initialOwner, nudgeNumber: 1 },
              },
              ...newEvents,
            ];
            return { ...c, nudgesCount: 1 };
          }
          return c;
        });
      }

      // Day 7: Meeting 2 repeats & evidence
      if (newDay >= 7) {
        updatedCommitments = updatedCommitments.map((c) => {
          if (c.id === 'c2' && !c.isRepeated) {
            newEvents = [
              {
                id: `ev-rep-${c.id}-${Date.now()}`,
                timestamp: '10:06:15',
                simulatedDay: newDay,
                type: 'commitment_repeated',
                payload: { commitmentId: c.id, mentionInMeeting: 'Meeting 2', quote: 'We still need to update the roadmap' },
              },
              ...newEvents,
            ];
            return { ...c, isRepeated: true, repeatMentionCount: 1 };
          }
          if (c.id === 'c1' && c.status === 'claimed') {
            newEvents = [
              {
                id: `ev-looks-done-${c.id}-${Date.now()}`,
                timestamp: '10:01:10',
                simulatedDay: newDay,
                type: 'closure_suggested',
                payload: { commitmentId: c.id, evidence: c.looksDoneEvidence?.evidenceQuote },
              },
              ...newEvents,
            ];
          }
          return c;
        });
      }

      // Day 14: Unresolved open items transition to "went-quiet" (replaces expired)
      if (newDay >= 14) {
        updatedCommitments = updatedCommitments.map((c) => {
          if (
            c.status === 'delivered' ||
            c.status === 'unclaimed' ||
            c.status === 'suggested-to-other' ||
            c.status === 'claimed'
          ) {
            newEvents = [
              {
                id: `ev-quiet-${c.id}-${Date.now()}`,
                timestamp: '23:59:59',
                simulatedDay: newDay,
                type: 'commitment_expired',
                payload: { commitmentId: c.id, status: 'went-quiet', reason: 'Unresolved after 14 days' },
              },
              ...newEvents,
            ];
            return { ...c, status: 'went-quiet' as CommitmentStatus };
          }
          return c;
        });
      }

      return {
        ...state,
        currentDay: newDay,
        commitments: updatedCommitments,
        eventLog: newEvents,
      };
    }

    case 'CLAIM_COMMITMENT': {
      const target = state.commitments.find((c) => c.id === action.id);
      if (!target) return state;

      const previousCommitment = { ...target };
      const updated = state.commitments.map((c) =>
        c.id === action.id
          ? { ...c, status: 'claimed' as CommitmentStatus, confirmedOwner: action.persona }
          : c
      );

      const events = logEvent(state, 'commitment_claimed', {
        commitmentId: action.id,
        owner: action.persona,
        quote: target.quote,
      });

      return {
        ...state,
        commitments: updated,
        eventLog: events,
        undoToast: {
          commitmentId: action.id,
          previousCommitment,
          timerSeconds: 10,
          actionDescription: `Confirmed by ${action.persona}`,
        },
      };
    }

    case 'SUGGEST_OWNER': {
      const target = state.commitments.find((c) => c.id === action.id);
      if (!target) return state;

      const previousCommitment = { ...target };
      const updated = state.commitments.map((c) =>
        c.id === action.id
          ? { ...c, status: 'suggested-to-other' as CommitmentStatus, suggestedOwner: action.suggestedTo }
          : c
      );

      const events = logEvent(state, 'owner_suggested', {
        commitmentId: action.id,
        suggestedBy: state.activePersona,
        suggestedTo: action.suggestedTo,
      });

      return {
        ...state,
        commitments: updated,
        eventLog: events,
        undoToast: {
          commitmentId: action.id,
          previousCommitment,
          timerSeconds: 10,
          actionDescription: `Suggested to ${action.suggestedTo}`,
        },
      };
    }

    case 'ANSWER_SUGGESTION': {
      const target = state.commitments.find((c) => c.id === action.id);
      if (!target) return state;

      const previousCommitment = { ...target };
      const newStatus: CommitmentStatus = action.accept ? 'claimed' : 'unclaimed';
      const confirmedOwner = action.accept ? action.persona : undefined;

      const updated = state.commitments.map((c) =>
        c.id === action.id
          ? { ...c, status: newStatus, confirmedOwner, suggestedOwner: undefined }
          : c
      );

      const events = logEvent(state, 'owner_suggestion_answered', {
        commitmentId: action.id,
        persona: action.persona,
        accepted: action.accept,
      });

      return {
        ...state,
        commitments: updated,
        eventLog: events,
        undoToast: {
          commitmentId: action.id,
          previousCommitment,
          timerSeconds: 10,
          actionDescription: action.accept
            ? `${action.persona} accepted commitment`
            : `${action.persona} declined (returned to Waiting)`,
        },
      };
    }

    case 'DISMISS_COMMITMENT': {
      const target = state.commitments.find((c) => c.id === action.id);
      if (!target) return state;

      const previousCommitment = { ...target };
      const updated = state.commitments.map((c) =>
        c.id === action.id ? { ...c, status: 'dismissed' as CommitmentStatus } : c
      );

      const events = logEvent(state, 'commitment_dismissed', {
        commitmentId: action.id,
        reason: action.reason || 'Not a commitment',
        staysInDenominator: true,
      });

      return {
        ...state,
        commitments: updated,
        eventLog: events,
        undoToast: {
          commitmentId: action.id,
          previousCommitment,
          timerSeconds: 10,
          actionDescription: 'Flagged as not a commitment (stays in denominator)',
        },
      };
    }

    case 'MARK_DONE': {
      const target = state.commitments.find((c) => c.id === action.id);
      if (!target) return state;

      const previousCommitment = { ...target };
      const updated = state.commitments.map((c) =>
        c.id === action.id
          ? {
              ...c,
              status: 'done' as CommitmentStatus,
              closedAtDay: state.currentDay,
            }
          : c
      );

      const events = logEvent(state, 'commitment_closed', {
        commitmentId: action.id,
        outcome: 'done',
        confirmedEvidence: action.confirmedQuote,
        dayClosed: state.currentDay,
      });

      return {
        ...state,
        commitments: updated,
        eventLog: events,
        undoToast: {
          commitmentId: action.id,
          previousCommitment,
          timerSeconds: 10,
          actionDescription: 'Marked as Done',
        },
      };
    }

    // Fix A2: Drop is 1-tap with immediate 10s undo toast and optional chips
    case 'DROP_COMMITMENT_1TAP': {
      const target = state.commitments.find((c) => c.id === action.id);
      if (!target) return state;

      const previousCommitment = { ...target };
      const updated = state.commitments.map((c) =>
        c.id === action.id
          ? {
              ...c,
              status: 'dropped' as CommitmentStatus,
              dropReason: 'Handled elsewhere', // Default polite reason if no chip clicked
              closedAtDay: state.currentDay,
              dropChipsOffered: true,
            }
          : c
      );

      const events = logEvent(state, 'commitment_closed', {
        commitmentId: action.id,
        outcome: 'dropped',
        dayClosed: state.currentDay,
      });

      return {
        ...state,
        commitments: updated,
        eventLog: events,
        undoToast: {
          commitmentId: action.id,
          previousCommitment,
          timerSeconds: 10,
          actionDescription: 'Honest drop recorded (1 tap)',
        },
      };
    }

    case 'SET_DROP_CHIP': {
      const updated = state.commitments.map((c) =>
        c.id === action.id ? { ...c, dropReason: action.reason } : c
      );

      const events = logEvent(state, 'commitment_closed', {
        commitmentId: action.id,
        outcome: 'dropped_reason_specified',
        reason: action.reason,
      });

      return {
        ...state,
        commitments: updated,
        eventLog: events,
      };
    }

    case 'REASSIGN_COMMITMENT': {
      const target = state.commitments.find((c) => c.id === action.id);
      if (!target) return state;

      const previousCommitment = { ...target };
      const updated = state.commitments.map((c) =>
        c.id === action.id
          ? { ...c, status: 'suggested-to-other' as CommitmentStatus, suggestedOwner: action.newOwner }
          : c
      );

      const events = logEvent(state, 'owner_suggested', {
        commitmentId: action.id,
        suggestedTo: action.newOwner,
      });

      return {
        ...state,
        commitments: updated,
        eventLog: events,
        undoToast: {
          commitmentId: action.id,
          previousCommitment,
          timerSeconds: 10,
          actionDescription: `Reassigned to ${action.newOwner} (pending acceptance)`,
        },
      };
    }

    case 'TOGGLE_PRIORITY': {
      const target = state.commitments.find((c) => c.id === action.id);
      if (!target) return state;

      const priorityCycle: Record<CommitmentPriority, CommitmentPriority> = {
        low: 'medium',
        medium: 'high',
        high: 'low',
      };
      const currentPriority: CommitmentPriority = target.priority || 'medium';
      const nextPriority = priorityCycle[currentPriority];

      const updated = state.commitments.map((c) =>
        c.id === action.id ? { ...c, priority: nextPriority } : c
      );

      const events = logEvent(state, 'priority_updated' as any, {
        commitmentId: action.id,
        previousPriority: currentPriority,
        newPriority: nextPriority,
      });

      return {
        ...state,
        commitments: updated,
        eventLog: events,
      };
    }

    case 'SET_PRIORITY': {
      const target = state.commitments.find((c) => c.id === action.id);
      if (!target) return state;

      const updated = state.commitments.map((c) =>
        c.id === action.id ? { ...c, priority: action.priority } : c
      );

      const events = logEvent(state, 'priority_updated' as any, {
        commitmentId: action.id,
        newPriority: action.priority,
      });

      return {
        ...state,
        commitments: updated,
        eventLog: events,
      };
    }

    // Fix A3: External guest consent
    case 'CONFIRM_GUEST_CONSENT': {
      const target = state.commitments.find((c) => c.id === action.id);
      if (!target) return state;

      const previousCommitment = { ...target };
      const updated = state.commitments.map((c) =>
        c.id === action.id
          ? { ...c, status: 'claimed' as CommitmentStatus, confirmedOwner: 'Alex (Guest)' }
          : c
      );

      const events = logEvent(state, 'commitment_claimed', {
        commitmentId: action.id,
        owner: 'Alex (Guest)',
        channel: 'guest_email_consent',
      });

      return {
        ...state,
        commitments: updated,
        eventLog: events,
        guestConsentModalOpen: false,
        undoToast: {
          commitmentId: action.id,
          previousCommitment,
          timerSeconds: 10,
          actionDescription: 'Guest Alex confirmed promise via email link',
        },
      };
    }

    // Fix A3: Dana routes ownerless card
    case 'DANA_ROUTE_CARD': {
      const target = state.commitments.find((c) => c.id === action.id);
      if (!target) return state;

      const previousCommitment = { ...target };
      let updatedCommitment: Commitment;

      if (action.decision === 'suggest') {
        updatedCommitment = {
          ...target,
          status: 'suggested-to-other',
          suggestedOwner: action.targetOwner || 'Priya',
          isOwnerless: false,
        };
      } else if (action.decision === 'drop') {
        updatedCommitment = {
          ...target,
          status: 'dropped',
          dropReason: 'Team decided not to pursue',
          closedAtDay: state.currentDay,
          isOwnerless: false,
        };
      } else {
        // Keep unowned in recap
        updatedCommitment = {
          ...target,
          status: 'unclaimed',
          isOwnerless: true,
        };
      }

      const updated = state.commitments.map((c) => (c.id === action.id ? updatedCommitment : c));
      const events = logEvent(state, 'owner_suggested', {
        commitmentId: action.id,
        hostDecision: action.decision,
        targetOwner: action.targetOwner,
      });

      return {
        ...state,
        commitments: updated,
        eventLog: events,
        undoToast: {
          commitmentId: action.id,
          previousCommitment,
          timerSeconds: 10,
          actionDescription: `Host routed unassigned card: ${action.decision}`,
        },
      };
    }

    case 'UNDO_LAST_ACTION': {
      if (!state.undoToast) return state;
      const { previousCommitment } = state.undoToast;
      const reverted = state.commitments.map((c) =>
        c.id === previousCommitment.id ? { ...previousCommitment } : c
      );
      return {
        ...state,
        commitments: reverted,
        undoToast: null,
      };
    }

    case 'CLEAR_UNDO':
      return { ...state, undoToast: null };

    case 'ADVANCE_GUIDED_STEP': {
      const nextStep = action.step ?? Math.min(state.guidedStep + 1, STEPS.length);
      const stepDef = STEPS[nextStep - 1] || STEPS[0];
      return {
        ...state,
        guidedStep: nextStep,
        activePersona: stepDef.targetPersona as PersonaId,
        activeScreen: stepDef.targetScreen,
      };
    }

    case 'TOGGLE_SLACK':
      return {
        ...state,
        slackOpen: action.open !== undefined ? action.open : !state.slackOpen,
      };

    case 'OPEN_PREBRIEF': {
      const events = action.open
        ? logEvent(state, 'prebrief_opened', { persona: state.activePersona, timing: '60_min_before_meeting' })
        : state.eventLog;
      return {
        ...state,
        prebriefModalOpen: action.open,
        eventLog: events,
      };
    }

    case 'OPEN_WORKSPACE_REPORT':
      return { ...state, workspaceReportOpen: action.open };

    case 'OPEN_GUEST_CONSENT':
      return { ...state, guestConsentModalOpen: action.open };

    case 'OPEN_SELF_TEST':
      return { ...state, selfTestModalOpen: action.open };

    case 'OPEN_WHY_THIS_CARD':
      return { ...state, whyThisCardModalId: action.id };

    case 'SET_MANAGER_COHORT_SIZE':
      return { ...state, managerCohortSize: action.size };

    case 'SET_TASKS_SUB_TAB':
      return { ...state, tasksSubTab: action.tab };

    case 'SET_MEETINGS_SUB_TAB':
      return { ...state, meetingsSubTab: action.tab };

    case 'SET_INTEGRATIONS_SUB_TAB':
      return { ...state, integrationsSubTab: action.tab };

    case 'SET_ANALYTICS_SUB_TAB':
      return { ...state, analyticsSubTab: action.tab };

    case 'UPDATE_METRICS_SIM':
      return {
        ...state,
        metricsSim: { ...state.metricsSim, ...action.payload },
      };

    case 'RESET_DEMO': {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch (e) {}
      return {
        ...initialAppState,
        eventLog: [
          {
            id: `ev-reset-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            simulatedDay: 0,
            type: 'commitment_extracted',
            payload: { message: 'Reset prototype to pristine initial state' },
          },
        ],
      };
    }

    default:
      return state;
  }
}

const initialAppState: AppState = {
  mode: 'closeout',
  activePersona: 'priya',
  activeScreen: 'home',
  currentDay: 0,
  commitments: INITIAL_COMMITMENTS,
  eventLog: [
    {
      id: 'ev-init-1',
      timestamp: '10:04:12',
      simulatedDay: 0,
      type: 'commitment_extracted',
      payload: { speaker: 'Priya', quote: "I'll send the pricing deck to the sales team by Friday.", confidence: 0.96 },
    },
    {
      id: 'ev-init-2',
      timestamp: '10:04:15',
      simulatedDay: 0,
      type: 'card_delivered',
      payload: { recipient: 'Priya', channel: 'slack', cardType: 'private_dm_consent' },
    },
    {
      id: 'ev-init-3',
      timestamp: '10:07:15',
      simulatedDay: 0,
      type: 'commitment_extracted',
      payload: { speaker: 'Priya', quote: 'Marcus, could you draft the API rate limiting specification?', confidence: 0.89 },
    },
    {
      id: 'ev-init-4',
      timestamp: '10:18:05',
      simulatedDay: 0,
      type: 'commitment_extracted',
      payload: { speaker: 'Marcus', quote: 'Yeah, I can take that and benchmark the p99 latency by Thursday.', confidence: 0.94 },
    },
  ],
  undoToast: null,
  guidedStep: 1,
  slackOpen: false,
  prebriefModalOpen: false,
  workspaceReportOpen: false,
  guestConsentModalOpen: false,
  selfTestModalOpen: false,
  whyThisCardModalId: null,
  managerCohortSize: 10,
  adminSettings: {
    nudgeCapPerWeek: 2,
    confidenceThreshold: 0.75,
    slackConnected: true,
    jiraConnected: true,
    asanaConnected: false,
    calendarConnected: true,
  },
  metricsSim: {
    claimRate: 0.7,
    rClaimed: 0.6,
    rUnclaimed: 0.1,
    workspaces: 2400,
    arpa: 240,
    newArpa: 380,
    seatPrice: 19,
    deltaRetention: 0.064,
    deltaConversion: 0.028,
    deltaSeats: 1.4,
  },
  tasksSubTab: 'open',
  meetingsSubTab: 'overview',
  integrationsSubTab: 'overview',
  analyticsSubTab: 'velocity',
  danaHostRouteAction: null,
};

function getInitialState(): AppState {
  if (typeof window !== 'undefined') {
    try {
      const cached = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.commitments && Array.isArray(parsed.commitments)) {
          parsed.commitments = parsed.commitments.map((c: any) => ({
            ...c,
            priority: c.priority || (c.id === 'c1' || c.id === 'c4' ? 'high' : c.id === 'c5' ? 'low' : 'medium'),
          }));
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read cached state, using baseline', e);
    }
  }
  return initialAppState;
}

/* ==========================================================================
   METRIC FORMULA (Fix A1: Identical Everywhere)
   14-day honest resolution = (Done + Reassigned & Accepted + Dropped within 14d) / Total Extracted Cohort
   Not a commitment stays in denominator.
   ========================================================================== */
export function calculateHonestResolutionRate(commitments: Commitment[]) {
  const total = commitments.length;
  if (total === 0) return 0;

  const resolved = commitments.filter(
    (c) => c.status === 'done' || c.status === 'dropped'
  ).length;

  return Math.round((resolved / total) * 100);
}

export function formatDayLabel(day: TimeDay): string {
  switch (day) {
    case 0:
      return 'Day 0 (Tue Oct 27, 2026)';
    case 2:
      return 'Day 2 (Thu Oct 29, 2026)';
    case 5:
      return 'Day 5 (Sun Nov 1, 2026)';
    case 7:
      return 'Day 7 (Tue Nov 3, 2026)';
    case 12:
      return 'Day 12 (Sun Nov 8, 2026)';
    case 14:
      return 'Day 14 (Tue Nov 10, 2026)';
    default:
      return `Day ${day}`;
  }
}

/* ==========================================================================
   PRIORITY BADGE DROPDOWN COMPONENT
   ========================================================================== */
interface PriorityBadgeDropdownProps {
  commitmentId: string;
  priority: CommitmentPriority;
  isOpenTask: boolean;
  onSetPriority: (id: string, priority: CommitmentPriority) => void;
}

export const PriorityBadgeDropdown: React.FC<PriorityBadgeDropdownProps> = ({
  commitmentId,
  priority,
  isOpenTask,
  onSetPriority,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const priorityConfigs: Record<
    CommitmentPriority,
    { label: string; badge: string; iconColor: string }
  > = {
    high: {
      label: 'High',
      badge: 'bg-amber-500/15 text-[#F5A524] border-amber-500/30 hover:bg-amber-500/25',
      iconColor: 'text-[#F5A524]',
    },
    medium: {
      label: 'Medium',
      badge: 'bg-[#5B45F0]/15 text-[#A594FD] border-[#5B45F0]/30 hover:bg-[#5B45F0]/25',
      iconColor: 'text-[#A594FD]',
    },
    low: {
      label: 'Low',
      badge: 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10',
      iconColor: 'text-neutral-500',
    },
  };

  const currentConfig = priorityConfigs[priority || 'medium'];

  if (!isOpenTask) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${currentConfig.badge}`}
      >
        <Flag className={`w-3 h-3 ${currentConfig.iconColor}`} />
        <span>{currentConfig.label}</span>
      </span>
    );
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Click to reassign priority"
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#5B45F0] cursor-pointer ${currentConfig.badge}`}
      >
        <Flag className={`w-3 h-3 ${currentConfig.iconColor}`} />
        <span>{currentConfig.label}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Assign priority"
          className="absolute left-0 mt-1.5 w-36 rounded-xl bg-[#1B1B1D] border border-white/15 shadow-2xl p-1 z-50 animate-fadeIn"
          style={{
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-neutral-500 border-b border-white/5 mb-1">
            Reassign Priority
          </div>
          {(['high', 'medium', 'low'] as CommitmentPriority[]).map((p) => {
            const isSelected = p === (priority || 'medium');
            const pConf = priorityConfigs[p];
            return (
              <button
                key={p}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetPriority(commitmentId, p);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flag className={`w-3.5 h-3.5 ${pConf.iconColor}`} />
                  <span className="capitalize">{pConf.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#35C98B]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */
export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);

  // Sync state to versioned localStorage (Fix A8)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      }
    } catch (e) {
      console.warn('Failed to persist to localStorage', e);
    }
  }, [state]);

  // Undo countdown toast timer
  useEffect(() => {
    if (!state.undoToast) return;
    const interval = setInterval(() => {
      dispatch({ type: 'CLEAR_UNDO' });
    }, 10000);
    return () => clearInterval(interval);
  }, [state.undoToast]);

  const honestRate = useMemo(() => {
    return calculateHonestResolutionRate(state.commitments);
  }, [state.commitments]);

  const isDana = state.activePersona === 'dana';
  const isMarcus = state.activePersona === 'marcus';
  const isPriya = state.activePersona === 'priya';

  // Counts for break-out
  const doneCount = state.commitments.filter((c) => c.status === 'done').length;
  const droppedCount = state.commitments.filter((c) => c.status === 'dropped').length;
  const reassignedCount = state.commitments.filter((c) => c.status === 'suggested-to-other').length;
  const wentQuietCount = state.commitments.filter((c) => c.status === 'went-quiet').length;
  const openCount = state.commitments.filter(
    (c) => c.status === 'claimed' || c.status === 'delivered' || c.status === 'unclaimed'
  ).length;

  // Selected commitment for "Why this card?" modal
  const whyCard = state.commitments.find((c) => c.id === state.whyThisCardModalId);

  return (
    <div
      className="min-h-screen text-[#EDEDEF] flex flex-col font-sans"
      style={{
        backgroundColor: TOKENS.bgApp,
        backgroundImage: TOKENS.bgNavyGradient,
      }}
    >
      {/* 10-Second Undo Toast (Fix A2) */}
      {state.undoToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-3 px-5 rounded-2xl bg-[#1B1B1D] border border-white/20 shadow-2xl flex items-center gap-4 text-xs animate-slideUp"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#35C98B] animate-ping" />
            <span className="text-white font-medium">{state.undoToast.actionDescription}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'UNDO_LAST_ACTION' })}
              className="px-3 py-1 rounded-lg bg-[#5B45F0] hover:bg-[#4B36E0] text-white font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-white"
            >
              Undo (10s)
            </button>
            <button
              onClick={() => dispatch({ type: 'CLEAR_UNDO' })}
              aria-label="Dismiss undo notification"
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* TOP BAR */}
      <header className="h-16 border-b border-white/8 bg-[#0D0D0E]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
        {/* Persona Switcher & App Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#E8508F] shrink-0" />
            <span className="font-bold text-sm text-white tracking-tight hidden sm:inline">
              Fireflies Close-out
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Persona Dropdown Pill */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-[#1B1B1D] border border-white/10 rounded-xl px-2.5 py-1 text-xs">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{ backgroundColor: PERSONAS[state.activePersona].avatarColor }}
              >
                {PERSONAS[state.activePersona].avatarInitials}
              </span>
              <select
                aria-label="Select active persona"
                value={state.activePersona}
                onChange={(e) =>
                  dispatch({ type: 'SET_PERSONA', persona: e.target.value as PersonaId })
                }
                className="bg-transparent text-white font-semibold focus-visible:outline-none cursor-pointer pr-1"
              >
                <option value="priya" className="bg-[#1B1B1D] text-white">
                  Priya (PM, Owner)
                </option>
                <option value="marcus" className="bg-[#1B1B1D] text-white">
                  Marcus (Eng, Dependent)
                </option>
                <option value="dana" className="bg-[#1B1B1D] text-white">
                  Dana (VP Product, Manager)
                </option>
                <option value="admin" className="bg-[#1B1B1D] text-white">
                  Admin (Workspace)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Bar with Ctrl+K */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-2">
          <div className="w-full relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search meetings, commitments... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 rounded-xl bg-[#1B1B1D] border border-white/8 text-xs text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-[#5B45F0] focus-visible:outline-none"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-neutral-400 font-mono">
              ⌘K
            </span>
          </div>
        </div>

        {/* Controls: Mode Toggle, Pre-brief, Slack Simulator, Bell, Capture */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Today | With Close-out Mode Toggle */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => dispatch({ type: 'SET_MODE', mode: 'today' })}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                state.mode === 'today'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_MODE', mode: 'closeout' })}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                state.mode === 'closeout'
                  ? 'bg-[#5B45F0] text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              With Close-out
            </button>
          </div>

          {/* 60-Min Pre-brief Button (Fix A4) */}
          <button
            onClick={() => dispatch({ type: 'OPEN_PREBRIEF', open: true })}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0]"
          >
            <Clock className="w-3.5 h-3.5 text-[#5B45F0]" />
            <span>60-min Pre-brief</span>
          </button>

          {/* Slack Simulator Toggle */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SLACK' })}
            className={`p-2 rounded-xl border transition-colors ${
              state.slackOpen
                ? 'bg-[#E8508F] text-white border-[#E8508F]'
                : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
            }`}
            title="Toggle Slack Simulator"
            aria-label="Toggle Slack Simulator"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Capture Button */}
          <button
            onClick={() => dispatch({ type: 'OPEN_SELF_TEST', open: true })}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5B45F0] hover:bg-[#4B36E0] text-white text-xs font-semibold shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0]"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Run Self-Test</span>
          </button>
        </div>
      </header>

      {/* TIME TRAVEL SCRUBBER BAR (Fix A9: Anchor to Day 0 = Tue 27 Oct 2026) */}
      <section
        aria-label="Cohort time travel simulator"
        className="px-4 sm:px-6 py-2 bg-[#121417] border-b border-white/8 flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#5B45F0]" />
            Cohort Timeline:
          </span>
          <span className="font-semibold text-white">{formatDayLabel(state.currentDay)}</span>
        </div>

        {/* Day Pills: 0, 2, 5, 7, 12, 14 */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {([0, 2, 5, 7, 12, 14] as TimeDay[]).map((day) => (
            <button
              key={day}
              onClick={() => dispatch({ type: 'SET_TIME_DAY', day })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                state.currentDay === day
                  ? 'bg-[#5B45F0] text-white shadow-sm'
                  : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              Day {day}
              {day === 0 && ' (Sync 1)'}
              {day === 7 && ' (Sync 2)'}
              {day === 12 && ' (Prompt)'}
              {day === 14 && ' (Quiet)'}
            </button>
          ))}
        </div>

        {/* Offline / Gemini Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#35C98B]">
          <span className="w-2 h-2 rounded-full bg-[#35C98B] animate-pulse" />
          <span>Extraction Engine: Contiguous Substring Verified</span>
        </div>
      </section>

      {/* MAIN CONTAINER: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR (Design Rules: Order exactly as specified) */}
        <aside
          aria-label="Main Navigation"
          className="w-56 bg-[#0D0D0E] border-r border-white/8 flex flex-col justify-between p-3 select-none shrink-0"
        >
          <div className="space-y-4">
            {/* Persona identity card in sidebar */}
            <div className="p-3 rounded-xl bg-[#1B1B1D] border border-white/5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                  style={{ backgroundColor: PERSONAS[state.activePersona].avatarColor }}
                >
                  {PERSONAS[state.activePersona].avatarInitials}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-xs text-white truncate">
                    {PERSONAS[state.activePersona].name}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {PERSONAS[state.activePersona].roleTitle}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar nav items in exact required order */}
            <nav className="space-y-0.5 text-xs">
              {/* Group 1: Home, AskFred */}
              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  state.activeScreen === 'home'
                    ? 'bg-[#1B1B1D] text-white font-semibold border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Inbox className="w-4 h-4 text-neutral-400" />
                <span>Home</span>
              </button>

              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'askfred' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  state.activeScreen === 'askfred'
                    ? 'bg-[#1B1B1D] text-white font-semibold border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-neutral-400" />
                <span>AskFred</span>
              </button>

              <div className="py-1 px-3">
                <div className="h-[1px] bg-white/5" />
              </div>

              {/* Group 2: Meetings, Tasks, AI Skills */}
              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'meetings' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  state.activeScreen === 'meetings'
                    ? 'bg-[#1B1B1D] text-white font-semibold border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span>Meetings</span>
              </button>

              {/* Fix A10: Keep Tasks as nav name, never rename to Commitments */}
              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'tasks' })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                  state.activeScreen === 'tasks'
                    ? 'bg-[#1B1B1D] text-white font-semibold border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                  <span>Tasks</span>
                </div>
                {openCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#5B45F0] text-white">
                    {openCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'aiskills' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  state.activeScreen === 'aiskills'
                    ? 'bg-[#1B1B1D] text-white font-semibold border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4 text-neutral-400" />
                <span>AI Skills</span>
              </button>

              <div className="py-1 px-3">
                <div className="h-[1px] bg-white/5" />
              </div>

              {/* Group 3: Analytics, Voice Agents */}
              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'analytics' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  state.activeScreen === 'analytics'
                    ? 'bg-[#1B1B1D] text-white font-semibold border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-neutral-400" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'voiceagents' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  state.activeScreen === 'voiceagents'
                    ? 'bg-[#1B1B1D] text-white font-semibold border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Zap className="w-4 h-4 text-neutral-400" />
                <span>Voice Agents</span>
              </button>

              <div className="py-1 px-3">
                <div className="h-[1px] bg-white/5" />
              </div>

              {/* Group 4: Upgrade (green 40% OFF pill), Get Desktop App */}
              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'upgrade' })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#0F3324]/50 border border-[#35C98B]/20 text-[#35C98B] hover:bg-[#0F3324] transition-colors"
              >
                <span className="font-semibold text-xs">Upgrade</span>
                <span className="text-[10px] bg-[#35C98B] text-black font-bold px-1.5 py-0.2 rounded-full">
                  40% OFF
                </span>
              </button>

              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'desktopapp' })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                  state.activeScreen === 'desktopapp'
                    ? 'bg-[#1B1B1D] text-white font-semibold border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Get Desktop App</span>
                <ExternalLink className="w-3 h-3 text-neutral-500" />
              </button>

              <div className="py-1 px-3">
                <div className="h-[1px] bg-white/5" />
              </div>

              {/* Group 5: Integrations, Settings */}
              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'integrations' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  state.activeScreen === 'integrations'
                    ? 'bg-[#1B1B1D] text-white font-semibold border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-4 h-4 text-neutral-400" />
                <span>Integrations</span>
              </button>

              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'settings' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  state.activeScreen === 'settings'
                    ? 'bg-[#1B1B1D] text-white font-semibold border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sliders className="w-4 h-4 text-neutral-400" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <button
              onClick={() => dispatch({ type: 'RESET_DEMO' })}
              className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Prototype
            </button>
          </div>
        </aside>

        {/* MAIN BODY AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* GUIDED WALKTHROUGH STEPPER */}
          <GuidedStepper
            currentStep={state.guidedStep}
            onSelectStep={(step) => dispatch({ type: 'ADVANCE_GUIDED_STEP', step })}
            onNext={() => dispatch({ type: 'ADVANCE_GUIDED_STEP' })}
            onPrev={() =>
              dispatch({ type: 'ADVANCE_GUIDED_STEP', step: Math.max(1, state.guidedStep - 1) })
            }
          />

          {/* SCREEN: HOME */}
          {state.activeScreen === 'home' && (
            <div className="space-y-6">
              {/* Hero Banner with Fix A1 Honest Resolution KPI */}
              <div
                className="p-6 sm:p-8 rounded-2xl border relative overflow-hidden"
                style={{
                  backgroundColor: TOKENS.heroBannerBg,
                  borderColor: TOKENS.heroBannerBorder,
                }}
              >
                <div className="max-w-2xl space-y-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E8508F]" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Fireflies Close-out System
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    From Spoken to Closed
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                    Turning extracted meeting commitments into owned items that reach honest closure. Target: raising 14-day honest resolution from 28% to 45% in six months.
                  </p>

                  {/* Fix A1: Honest Resolution KPI with Tooltip */}
                  <div className="pt-3 flex flex-wrap items-center gap-4">
                    <div className="p-3.5 px-5 rounded-xl bg-black/40 border border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-neutral-300 font-medium">
                          14-Day Honest Resolution
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
                            aria-label="Toggle metric formula definition"
                            className="text-neutral-400 hover:text-white focus-visible:outline-none"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                          {showFormulaTooltip && (
                            <div className="absolute left-0 bottom-6 z-20 w-72 p-3 rounded-xl bg-[#1B1B1D] border border-white/20 text-[11px] text-neutral-300 shadow-xl space-y-1">
                              <span className="font-bold text-white block">Formula Definition:</span>
                              <p>
                                <strong>(Done + Accepted Reassignment + Dropped)</strong> ÷ <strong>Total Extracted</strong>.
                              </p>
                              <p className="text-neutral-400">
                                "Not a commitment" stays in the denominator so dismissing cards can never artificially raise the rate.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-[#35C98B] tabular-nums">
                          {honestRate}%
                        </span>
                        <span className="text-xs text-neutral-400 font-medium">
                          Target: 45% • Baseline: 28%
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'tasks' })}
                      className="px-4 py-2.5 rounded-xl bg-[#5B45F0] hover:bg-[#4B36E0] text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-colors"
                    >
                      <span>Review Your Commitments</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Quick Metric Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  className="p-5 rounded-2xl border"
                  style={{
                    backgroundColor: TOKENS.tileMaroonBg,
                    borderColor: 'rgba(232, 80, 143, 0.25)',
                  }}
                >
                  <span className="text-xs font-semibold text-neutral-300 block">Consent Rule</span>
                  <div className="text-2xl font-bold text-white mt-1">100% Owned</div>
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Zero forced assignments. The person confirms.
                  </span>
                </div>

                <div
                  className="p-5 rounded-2xl border"
                  style={{
                    backgroundColor: TOKENS.tileGreenBg,
                    borderColor: 'rgba(53, 201, 139, 0.25)',
                  }}
                >
                  <span className="text-xs font-semibold text-neutral-300 block">Dignity for Drop</span>
                  <div className="text-2xl font-bold text-[#35C98B] mt-1">{droppedCount} Dropped</div>
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Equal size & style as Done. Clears mental overhead.
                  </span>
                </div>

                <div
                  className="p-5 rounded-2xl border"
                  style={{
                    backgroundColor: TOKENS.tileIndigoBg,
                    borderColor: 'rgba(91, 69, 240, 0.25)',
                  }}
                >
                  <span className="text-xs font-semibold text-neutral-300 block">Zero Surveillance</span>
                  <div className="text-2xl font-bold text-white mt-1">k = 5 Safe</div>
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Managers see team totals only. No per-person tracking.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: MEETINGS */}
          {state.activeScreen === 'meetings' && (
            <div className="space-y-6">
              {/* Meeting Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
                <div>
                  <h1 className="text-xl font-bold text-white">Weekly Product Sync</h1>
                  <p className="text-xs text-neutral-400">
                    Tue Oct 27, 2026 • 25 minutes • 10 attendees (Priya, Marcus, Arjun, Alex, Dana...)
                  </p>
                </div>

                {/* Sub-tabs: Overview, Last 3 Minutes Read-back, Transcript */}
                <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/8 text-xs">
                  <button
                    onClick={() => dispatch({ type: 'SET_MEETINGS_SUB_TAB', tab: 'overview' })}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      state.meetingsSubTab === 'overview'
                        ? 'bg-[#5B45F0] text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Meeting Overview
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_MEETINGS_SUB_TAB', tab: 'readback' })}
                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                      state.meetingsSubTab === 'readback'
                        ? 'bg-[#5B45F0] text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Last 3 Minutes Read-back
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_MEETINGS_SUB_TAB', tab: 'transcript' })}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      state.meetingsSubTab === 'transcript'
                        ? 'bg-[#5B45F0] text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Verbatim Transcript
                  </button>
                </div>
              </div>

              {/* Sub-tab 1: Read-back Component (Prompt C) */}
              {state.meetingsSubTab === 'readback' && (
                <ReadBackSection
                  activePersonaName={PERSONAS[state.activePersona].name}
                  onClaimItem={(id, name) => dispatch({ type: 'CLAIM_COMMITMENT', id, persona: name })}
                  claimedMap={{
                    c1: 'Priya',
                    c4: 'Marcus',
                    ...(state.commitments.find((c) => c.id === 'c2')?.confirmedOwner
                      ? { c2: state.commitments.find((c) => c.id === 'c2')?.confirmedOwner! }
                      : {}),
                  }}
                />
              )}

              {/* Sub-tab 2: Overview */}
              {state.meetingsSubTab === 'overview' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#1B1B1D] border border-white/8 space-y-3">
                    <h3 className="text-sm font-semibold text-white">Meeting Summary</h3>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Discussed self-serve growth (+18% MoM), enterprise sales enablement requirements, database p99 query latency benchmarks, and webhook rate limiting.
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-xs text-neutral-400">
                      <span className="px-2.5 py-1 rounded-md bg-white/5">5 Commitments Extracted</span>
                      <span className="px-2.5 py-1 rounded-md bg-white/5">1 External Guest</span>
                      <span className="px-2.5 py-1 rounded-md bg-white/5">1 Unowned Statement Routed</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Transcript with Verbatim Quotes */}
              {state.meetingsSubTab === 'transcript' && (
                <div className="p-5 rounded-2xl bg-[#1B1B1D] border border-white/8 space-y-3 font-mono text-xs">
                  <div className="text-neutral-400 pb-2 border-b border-white/5">
                    Source: Audio recording via Fireflies Companion
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2 text-neutral-300 leading-relaxed">
                    <p>[00:00] Dana: Let's get started. We have 10 people in the room today. Priya, walk us through the pricing update.</p>
                    <p>[01:30] Marcus: From the infra side, database queries for multi-tenant accounts are holding up well, no latency spike.</p>
                    <p>[04:12] <strong className="text-[#35C98B]">Priya: I'll send the pricing deck to the sales team by Friday.</strong></p>
                    <p>[07:15] <strong className="text-violet-400">Priya: Marcus, could you draft the API rate limiting specification before our next platform review?</strong></p>
                    <p>[08:45] <strong className="text-amber-400">Arjun: we should update the roadmap before next week's leadership offsite.</strong></p>
                    <p>[12:20] <strong className="text-indigo-400">Alex (Guest): I'll share the API benchmark logs after this call.</strong></p>
                    <p>[18:05] <strong className="text-[#35C98B]">Marcus: Yeah, I can take that and benchmark the p99 latency by Thursday.</strong></p>
                    <p>[20:00] <span className="text-neutral-500">Priya: Maybe someone could look at pricing someday, especially the international currency tiers. (Hypothetical filtered out)</span></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCREEN: TASKS (Design Rules: Named Tasks, 3 Equal Buttons for Done, Reassign, Drop) */}
          {state.activeScreen === 'tasks' && (
            <div className="space-y-6">
              {/* Header and Sub-tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white">Tasks</h1>
                  <p className="text-xs text-neutral-400">
                    Consent-driven meeting commitments. Done, Reassign, and Drop are three equal choices.
                  </p>
                </div>

                <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/8 text-xs">
                  <button
                    onClick={() => dispatch({ type: 'SET_TASKS_SUB_TAB', tab: 'open' })}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      state.tasksSubTab === 'open'
                        ? 'bg-[#5B45F0] text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Open ({openCount})
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_TASKS_SUB_TAB', tab: 'waiting' })}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      state.tasksSubTab === 'waiting'
                        ? 'bg-[#5B45F0] text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Waiting on Others ({reassignedCount})
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_TASKS_SUB_TAB', tab: 'closed' })}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      state.tasksSubTab === 'closed'
                        ? 'bg-[#5B45F0] text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Closed & Dropped ({doneCount + droppedCount + wentQuietCount})
                  </button>
                </div>
              </div>

              {/* Fix A3: Dedicated Host Section in Dana's view for Unassigned Team Promises ("we") */}
              {isDana && (
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-amber-500/20 text-[#F5A524]">
                        <Users className="w-4 h-4" />
                      </span>
                      <h3 className="text-sm font-semibold text-white">
                        Host Routing: Unassigned Team Promises (1)
                      </h3>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-[#F5A524] font-medium">
                      Requires Host Decision
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300">
                    Spoken by Arjun at [08:45]: <em>"we should update the roadmap before next week's leadership offsite"</em>.
                    Because "we" is ownerless, Fireflies does not auto-assign it to individuals. As meeting host, choose:
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'DANA_ROUTE_CARD',
                          id: 'c2',
                          decision: 'suggest',
                          targetOwner: 'Priya',
                        })
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-[#5B45F0] hover:bg-[#4B36E0] text-white text-xs font-semibold transition-colors"
                    >
                      Suggest to Priya (Creates card)
                    </button>
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'DANA_ROUTE_CARD',
                          id: 'c2',
                          decision: 'unowned',
                        })
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                    >
                      Keep Unowned (In recap only)
                    </button>
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'DANA_ROUTE_CARD',
                          id: 'c2',
                          decision: 'drop',
                        })
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
                    >
                      Let Go (Drop)
                    </button>
                  </div>
                </div>
              )}

              {/* Commitments Card List */}
              <div className="space-y-4">
                {state.commitments
                  .filter((c) => {
                    // Host Dana filter
                    if (isDana && c.id === 'c2') return false; // Handled in host section above

                    if (state.tasksSubTab === 'open') {
                      return (
                        c.status === 'claimed' ||
                        c.status === 'delivered' ||
                        c.status === 'unclaimed' ||
                        c.status === 'went-quiet'
                      );
                    }
                    if (state.tasksSubTab === 'waiting') {
                      return c.status === 'suggested-to-other';
                    }
                    if (state.tasksSubTab === 'closed') {
                      return (
                        c.status === 'done' ||
                        c.status === 'dropped' ||
                        c.status === 'dismissed'
                      );
                    }
                    return true;
                  })
                  .map((c) => {
                    const priority = c.priority || 'medium';
                    const priorityConfig = {
                      high: {
                        label: 'High',
                        badge: 'bg-amber-500/15 text-[#F5A524] border-amber-500/30 hover:bg-amber-500/25',
                        iconColor: 'text-[#F5A524]',
                      },
                      medium: {
                        label: 'Medium',
                        badge: 'bg-[#5B45F0]/15 text-[#A594FD] border-[#5B45F0]/30 hover:bg-[#5B45F0]/25',
                        iconColor: 'text-[#A594FD]',
                      },
                      low: {
                        label: 'Low',
                        badge: 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10',
                        iconColor: 'text-neutral-500',
                      },
                    }[priority];
                    const isOpenTask =
                      c.status !== 'done' &&
                      c.status !== 'dropped' &&
                      c.status !== 'dismissed';

                    return (
                    <article
                      key={c.id}
                      className="p-5 rounded-2xl border space-y-4 transition-all"
                      style={{
                        backgroundColor: TOKENS.bgCard,
                        borderColor: TOKENS.borderCard,
                      }}
                    >
                      {/* Top Header Row: Speaker, Time, Due, Priority, Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-white">{c.speaker}</span>
                          <span className="text-neutral-500">·</span>
                          <span className="text-neutral-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-neutral-500" />
                            {c.timestamp} in {c.meetingTitle}
                          </span>
                          <span className="text-neutral-500">·</span>
                          <span className="text-neutral-300">Target: {c.dueText}</span>
                          <span className="text-neutral-500">·</span>

                          {/* Priority Indicator with Dropdown Menu in Header */}
                          <PriorityBadgeDropdown
                            commitmentId={c.id}
                            priority={priority}
                            isOpenTask={isOpenTask}
                            onSetPriority={(id, p) =>
                              dispatch({ type: 'SET_PRIORITY', id, priority: p })
                            }
                          />
                        </div>

                        {/* Status Label (Always Icon + Text) */}
                        <div className="flex items-center gap-2">
                          {c.status === 'claimed' && (
                            <span className="text-[11px] font-semibold text-[#35C98B] bg-[#0F3324] border border-[#35C98B]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirmed by {c.confirmedOwner}
                            </span>
                          )}
                          {c.status === 'suggested-to-other' && (
                            <span className="text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              Suggested to {c.suggestedOwner} (Pending)
                            </span>
                          )}
                          {c.status === 'done' && (
                            <span className="text-[11px] font-semibold text-[#35C98B] bg-[#0F3324] border border-[#35C98B]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              Done
                            </span>
                          )}
                          {c.status === 'dropped' && (
                            <span className="text-[11px] font-medium text-neutral-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-3.5 h-3.5 rounded-full border border-neutral-400 flex items-center justify-center text-[9px]">✕</span>
                              Dropped ({c.dropReason || 'Planned change'})
                            </span>
                          )}
                          {c.status === 'went-quiet' && (
                            <span className="text-[11px] font-medium text-neutral-400 bg-black/40 border border-white/5 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-neutral-500" />
                              Went quiet after 14 days
                            </span>
                          )}
                          {c.status === 'delivered' && (
                            <span className="text-[11px] font-medium text-neutral-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                              Delivered to {c.initialOwner}
                            </span>
                          )}

                          <button
                            onClick={() => dispatch({ type: 'OPEN_WHY_THIS_CARD', id: c.id })}
                            className="p-1 rounded text-neutral-400 hover:text-white"
                            title="Why this card?"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Verbatim Quote */}
                      <blockquote className="text-sm font-medium text-white pl-3.5 border-l-2 border-[#5B45F0]">
                        "{c.quote}"
                      </blockquote>

                      {/* Fix A3: Alex external guest card with consent link */}
                      {c.isGuest && c.status === 'delivered' && (
                        <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-semibold text-white block">
                              External Guest Promise: Alex
                            </span>
                            <span className="text-neutral-400">
                              Fireflies cannot assign work to external guests without affirmative consent.
                            </span>
                          </div>
                          <button
                            onClick={() => dispatch({ type: 'OPEN_GUEST_CONSENT', open: true })}
                            className="px-3.5 py-1.5 rounded-xl bg-[#5B45F0] hover:bg-[#4B36E0] text-white font-semibold transition-colors shrink-0"
                          >
                            Send Guest Consent Link
                          </button>
                        </div>
                      )}

                      {/* Day 12 / 13 "Still yours?" subtle prompt (Fix A5) */}
                      {state.currentDay >= 12 && c.status === 'claimed' && (
                        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-between gap-3 text-xs">
                          <span className="text-neutral-200">
                            Meeting coming up in 2 days. <strong>Still yours?</strong>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {}}
                              className="px-3 py-1 rounded-lg bg-[#5B45F0] text-white font-semibold text-xs"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => dispatch({ type: 'DROP_COMMITMENT_1TAP', id: c.id })}
                              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs"
                            >
                              Drop
                            </button>
                          </div>
                        </div>
                      )}

                      {/* "Looks done?" AI evidence suggestion */}
                      {state.currentDay >= 7 && c.looksDoneEvidence && c.status === 'claimed' && (
                        <div className="p-3.5 rounded-xl bg-[#0F3324]/40 border border-[#35C98B]/30 space-y-2 text-xs">
                          <div className="font-semibold text-[#35C98B] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Looks done? Quoted evidence detected in subsequent sync:
                          </div>
                          <p className="text-neutral-200 italic pl-3 border-l-2 border-[#35C98B]">
                            "{c.looksDoneEvidence.evidenceQuote}"
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() =>
                                dispatch({
                                  type: 'MARK_DONE',
                                  id: c.id,
                                  confirmedQuote: c.looksDoneEvidence?.evidenceQuote,
                                })
                              }
                              className="px-3.5 py-1.5 rounded-lg bg-[#35C98B] text-black font-bold text-xs"
                            >
                              Confirm Done
                            </button>
                            <button
                              onClick={() => dispatch({ type: 'DROP_COMMITMENT_1TAP', id: c.id })}
                              className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs"
                            >
                              Drop instead
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Optional chips below dropped card (Fix A2) */}
                      {c.status === 'dropped' && (
                        <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
                          <span className="text-[11px] text-neutral-400 block font-medium">
                            Optional reason (saves automatically, no confirmation modal needed):
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {[
                              'Plans changed',
                              'Handled elsewhere',
                              'No longer needed',
                              'Not viable',
                              'No reason',
                            ].map((chip) => (
                              <button
                                key={chip}
                                onClick={() => dispatch({ type: 'SET_DROP_CHIP', id: c.id, reason: chip })}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  c.dropReason === chip
                                    ? 'bg-[#5B45F0] text-white border border-[#5B45F0]'
                                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5'
                                }`}
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3 EQUAL BUTTONS: DONE, REASSIGN, DROP (Design Rules) */}
                      {state.mode === 'closeout' && c.status === 'claimed' && (
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            {/* Done Button */}
                            <button
                              onClick={() => dispatch({ type: 'MARK_DONE', id: c.id })}
                              className="px-4 py-2 min-h-[40px] rounded-[10px] bg-[#1B1B1D] hover:bg-white/5 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0]"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#35C98B]" />
                              <span>Done</span>
                            </button>

                            {/* Reassign Button */}
                            <button
                              onClick={() =>
                                dispatch({
                                  type: 'REASSIGN_COMMITMENT',
                                  id: c.id,
                                  newOwner: isPriya ? 'Marcus' : 'Priya',
                                })
                              }
                              className="px-4 py-2 min-h-[40px] rounded-[10px] bg-[#1B1B1D] hover:bg-white/5 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0]"
                            >
                              <UserCheck className="w-4 h-4 text-[#5B45F0]" />
                              <span>Reassign</span>
                            </button>

                            {/* Drop Button: Equal size, outline, weight, never red or dimmer */}
                            <button
                              onClick={() => dispatch({ type: 'DROP_COMMITMENT_1TAP', id: c.id })}
                              className="px-4 py-2 min-h-[40px] rounded-[10px] bg-[#1B1B1D] hover:bg-white/5 border border-white/10 text-xs font-semibold text-[#EDEDEF] flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0]"
                            >
                              <span className="w-4 h-4 rounded-full border border-neutral-400 flex items-center justify-center text-[10px]">
                                ✕
                              </span>
                              <span>Drop</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Quick-toggle Priority Button for open tasks */}
                            <button
                              onClick={() => dispatch({ type: 'TOGGLE_PRIORITY', id: c.id })}
                              className="px-3 py-2 min-h-[40px] rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0]"
                              title="Quick-toggle priority (Low → Medium → High)"
                              aria-label={`Toggle priority. Current: ${priorityConfig.label}`}
                            >
                              <Flag className={`w-3.5 h-3.5 ${priorityConfig.iconColor}`} />
                              <span>Priority: <strong className="text-white capitalize">{priorityConfig.label}</strong></span>
                            </button>

                            {/* Not a commitment: Quiet button with slash-circle */}
                            <button
                              onClick={() => dispatch({ type: 'DISMISS_COMMITMENT', id: c.id })}
                              className="px-3 py-2 text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
                            >
                              <span className="w-3.5 h-3.5 rounded-full border border-neutral-500 flex items-center justify-center text-[9px]">
                                ⊘
                              </span>
                              <span>Not a commitment</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Delivered / Suggested Acceptance Actions */}
                      {c.status === 'delivered' && !c.isGuest && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => dispatch({ type: 'CLAIM_COMMITMENT', id: c.id, persona: c.initialOwner })}
                              className="px-4 py-2 min-h-[40px] rounded-[10px] bg-[#5B45F0] hover:bg-[#4B36E0] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Mine (Accept)
                            </button>
                            <button
                              onClick={() =>
                                dispatch({
                                  type: 'SUGGEST_OWNER',
                                  id: c.id,
                                  suggestedTo: isPriya ? 'Marcus' : 'Priya',
                                })
                              }
                              className="px-4 py-2 min-h-[40px] rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors"
                            >
                              Suggest to peer
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Quick-toggle Priority Button for delivered open tasks */}
                            <button
                              onClick={() => dispatch({ type: 'TOGGLE_PRIORITY', id: c.id })}
                              className="px-3 py-2 min-h-[40px] rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0]"
                              title="Quick-toggle priority"
                              aria-label={`Toggle priority. Current: ${priorityConfig.label}`}
                            >
                              <Flag className={`w-3.5 h-3.5 ${priorityConfig.iconColor}`} />
                              <span>Priority: <strong className="text-white capitalize">{priorityConfig.label}</strong></span>
                            </button>
                            <button
                              onClick={() => dispatch({ type: 'DISMISS_COMMITMENT', id: c.id })}
                              className="px-3 py-2 text-xs text-neutral-400 hover:text-white"
                            >
                              Not a commitment
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Unclaimed Actions with Quick-toggle */}
                      {c.status === 'unclaimed' && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                dispatch({
                                  type: 'CLAIM_COMMITMENT',
                                  id: c.id,
                                  persona: PERSONAS[state.activePersona].name,
                                })
                              }
                              className="px-4 py-2 min-h-[40px] rounded-[10px] bg-[#5B45F0] hover:bg-[#4B36E0] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Mine (Claim this)
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => dispatch({ type: 'TOGGLE_PRIORITY', id: c.id })}
                              className="px-3 py-2 min-h-[40px] rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-[#5B45F0]"
                              title="Quick-toggle priority"
                              aria-label={`Toggle priority. Current: ${priorityConfig.label}`}
                            >
                              <Flag className={`w-3.5 h-3.5 ${priorityConfig.iconColor}`} />
                              <span>Priority: <strong className="text-white capitalize">{priorityConfig.label}</strong></span>
                            </button>
                          </div>
                        </div>
                      )}

                      {c.status === 'suggested-to-other' && c.suggestedOwner === PERSONAS[state.activePersona].name && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs">
                          <span className="text-amber-200">
                            Suggested to you by {c.speaker}. Would you like to accept?
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                dispatch({
                                  type: 'ANSWER_SUGGESTION',
                                  id: c.id,
                                  accept: true,
                                  persona: PERSONAS[state.activePersona].name,
                                })
                              }
                              className="px-3.5 py-1.5 rounded-lg bg-[#5B45F0] text-white font-semibold"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                dispatch({
                                  type: 'ANSWER_SUGGESTION',
                                  id: c.id,
                                  accept: false,
                                  persona: PERSONAS[state.activePersona].name,
                                })
                              }
                              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                    );
                  })}
              </div>
            </div>
          )}

          {/* SCREEN: ANALYTICS (Prompt D: Dana's View, K-Anonymity Slider, Math Model) */}
          {state.activeScreen === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
                <div>
                  <h1 className="text-xl font-bold text-white">Analytics & Executive Intelligence</h1>
                  <p className="text-xs text-neutral-400">
                    Cohort resolution velocity and privacy-preserving team intelligence.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/8 text-xs">
                    <button
                      onClick={() => dispatch({ type: 'SET_ANALYTICS_SUB_TAB', tab: 'velocity' })}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        state.analyticsSubTab === 'velocity'
                          ? 'bg-[#5B45F0] text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Team Velocity
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'SET_ANALYTICS_SUB_TAB', tab: 'eval' })}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        state.analyticsSubTab === 'eval'
                          ? 'bg-[#5B45F0] text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      AI Quality & Eval
                    </button>
                  </div>

                  <button
                    onClick={() => dispatch({ type: 'OPEN_WORKSPACE_REPORT', open: true })}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Printable Report
                  </button>
                </div>
              </div>

              {state.analyticsSubTab === 'eval' ? (
                <AnalyticsEvalView />
              ) : (
                <div className="space-y-6">
                  {/* K-Anonymity Cohort Size Slider (Prompt D1) */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#35C98B]" />
                      <div>
                        <span className="font-semibold text-white block">
                          K-Anonymity Privacy Threshold Control (k=5)
                        </span>
                        <span className="text-neutral-400">
                          Cohort size: {state.managerCohortSize} contributors • Aggregate totals only
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="2"
                        max="20"
                        value={state.managerCohortSize}
                        onChange={(e) =>
                          dispatch({ type: 'SET_MANAGER_COHORT_SIZE', size: parseInt(e.target.value) })
                        }
                        className="accent-[#5B45F0] cursor-pointer"
                      />
                      <span className="font-bold text-white w-8 text-right">
                        {state.managerCohortSize}
                      </span>
                    </div>
                  </div>

                  {state.managerCohortSize < 5 ? (
                    <div className="p-10 text-center rounded-2xl bg-[#1B1B1D] border border-amber-500/30 space-y-3">
                      <Shield className="w-10 h-10 text-[#F5A524] mx-auto" />
                      <h3 className="text-base font-bold text-white">Cohort Suppression Active (k &lt; 5)</h3>
                      <p className="text-xs text-neutral-400 max-w-md mx-auto">
                        This group has only {state.managerCohortSize} active members. To mathematically guarantee zero individual surveillance, aggregates are suppressed until cohort size reaches 5 or more.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Metric Comparison Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-5 rounded-2xl bg-[#1B1B1D] border border-white/8 space-y-1">
                          <span className="text-xs text-neutral-400 font-medium">14-Day Honest Resolution</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-[#35C98B]">{honestRate}%</span>
                            <span className="text-xs font-semibold text-emerald-400">+{(honestRate - 28)}% vs base</span>
                          </div>
                          <span className="text-[11px] text-neutral-400 block pt-1">
                            Target: 45% in 6 months (Honest metric)
                          </span>
                        </div>

                        <div className="p-5 rounded-2xl bg-[#1B1B1D] border border-white/8 space-y-1">
                          <span className="text-xs text-neutral-400 font-medium">Baseline Resolution (Unassisted)</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-neutral-400">28%</span>
                            <span className="text-xs text-neutral-500">Industry standard</span>
                          </div>
                          <span className="text-[11px] text-neutral-400 block pt-1">
                            Without explicit consent loop
                          </span>
                        </div>

                        <div className="p-5 rounded-2xl bg-[#1B1B1D] border border-white/8 space-y-1">
                          <span className="text-xs text-neutral-400 font-medium">Resolution Mix</span>
                          <div className="flex items-baseline gap-2 text-sm font-bold text-white pt-1">
                            <span>Done: {doneCount}</span>
                            <span>·</span>
                            <span>Dropped: {droppedCount}</span>
                            <span>·</span>
                            <span>Quiet: {wentQuietCount}</span>
                          </div>
                          <span className="text-[11px] text-neutral-400 block pt-1">
                            Zero denominator manipulation
                          </span>
                        </div>
                      </div>

                      {/* Math Sensitivity Grid (Prompt D3) */}
                      <div className="p-6 rounded-2xl bg-[#1B1B1D] border border-white/8 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-white">
                              Sensitivity Analysis: Claim Rate vs Closure-Once-Claimed
                            </h3>
                            <p className="text-xs text-neutral-400">
                              Model: R = c × r(claimed) + (1 - c) × r(unclaimed)
                            </p>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-[#35C98B]/20 text-[#35C98B] font-bold">
                            Target: 45%
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 text-neutral-400">
                                <th className="py-2.5 px-3">r(claimed) ↓ / c (claim rate) →</th>
                                <th className="py-2.5 px-3 text-center">c = 50%</th>
                                <th className="py-2.5 px-3 text-center">c = 60%</th>
                                <th className="py-2.5 px-3 text-center">c = 70%</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {[0.5, 0.6, 0.7].map((rCl) => (
                                <tr key={rCl} className="hover:bg-white/[0.02]">
                                  <td className="py-3 px-3 font-semibold text-white">
                                    r_claimed = {Math.round(rCl * 100)}%
                                  </td>
                                  {[0.5, 0.6, 0.7].map((cRate) => {
                                    const val = Math.round((cRate * rCl + (1 - cRate) * 0.1) * 100);
                                    const hits = val >= 45;
                                    return (
                                      <td key={cRate} className="py-3 px-3 text-center">
                                        <span
                                          className={`inline-block px-3 py-1 rounded-md font-bold ${
                                            hits
                                              ? 'bg-[#0F3324] text-[#35C98B] border border-[#35C98B]/40'
                                              : 'bg-white/5 text-neutral-400'
                                          }`}
                                        >
                                          {val}% {hits && '★'}
                                        </span>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SCREEN: INTEGRATIONS */}
          {state.activeScreen === 'integrations' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
                <div>
                  <h1 className="text-xl font-bold text-white">Integrations & Two-Way Sync</h1>
                  <p className="text-xs text-neutral-400">
                    Connect Jira, Asana, Slack, and Calendar without replacing them.
                  </p>
                </div>

                <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/8 text-xs">
                  <button
                    onClick={() => dispatch({ type: 'SET_INTEGRATIONS_SUB_TAB', tab: 'overview' })}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      state.integrationsSubTab === 'overview'
                        ? 'bg-[#5B45F0] text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Connected Apps
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_INTEGRATIONS_SUB_TAB', tab: 'api' })}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      state.integrationsSubTab === 'api'
                        ? 'bg-[#5B45F0] text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Commitment API Spec
                  </button>
                </div>
              </div>

              {state.integrationsSubTab === 'api' ? (
                <CommitmentApiSpec />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#1B1B1D] border border-white/8 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-semibold text-white text-sm block">Slack Two-Way Sync</span>
                      <p className="text-xs text-neutral-400 mt-1">
                        Delivers interactive consent cards via bot DM and recap summaries to channels.
                      </p>
                      <span className="text-[11px] text-[#35C98B] mt-2 block font-medium">Connected ✓</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#1B1B1D] border border-white/8 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-semibold text-white text-sm block">Jira Software</span>
                      <p className="text-xs text-neutral-400 mt-1">
                        Two-way status sync for engineering commitments. Done in Jira closes the item.
                      </p>
                      <span className="text-[11px] text-[#35C98B] mt-2 block font-medium">Connected ✓</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#1B1B1D] border border-white/8 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-semibold text-white text-sm block">Asana</span>
                      <p className="text-xs text-neutral-400 mt-1">
                        Syncs marketing and operations tasks directly to project boards.
                      </p>
                      <span className="text-[11px] text-neutral-400 mt-2 block font-medium">Available</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#1B1B1D] border border-white/8 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-semibold text-white text-sm block">Google Calendar</span>
                      <p className="text-xs text-neutral-400 mt-1">
                        Schedules 60-min pre-brief drawer before recurring meeting starts.
                      </p>
                      <span className="text-[11px] text-[#35C98B] mt-2 block font-medium">Connected ✓</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCREEN: SETTINGS */}
          {state.activeScreen === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-xl font-bold text-white">Close-out Workspace Settings</h1>
                <p className="text-xs text-neutral-400">
                  Global controls for consent enforcement, notification caps, and privacy thresholds.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1B1B1D] border border-white/8 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div>
                    <span className="font-semibold text-white block">Nudge Cap Budget</span>
                    <span className="text-neutral-400">Maximum gentle nudges per item per week</span>
                  </div>
                  <span className="font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg">
                    {state.adminSettings.nudgeCapPerWeek} / week
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div>
                    <span className="font-semibold text-white block">Extraction Confidence Gate</span>
                    <span className="text-neutral-400">
                      Minimum model score required to deliver candidate commitment
                    </span>
                  </div>
                  <span className="font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg">
                    {Math.round(state.adminSettings.confidenceThreshold * 100)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Pre-brief Schedule Window</span>
                    <span className="text-neutral-400">Time window before recurring meeting</span>
                  </div>
                  <span className="font-bold text-[#35C98B] bg-[#0F3324] px-2.5 py-1 rounded-lg">
                    60 Minutes
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FOOTER RIBBON (Required Design Rule) */}
      <footer className="h-9 bg-[#0D0D0E] border-t border-white/8 px-6 flex items-center justify-between text-[11px] text-neutral-400">
        <span>Concept prototype. Fictional people and meetings. Not affiliated with Fireflies.ai.</span>
        <div className="flex items-center gap-3">
          <span>Day 0 = Tue 27 Oct 2026</span>
          <span>·</span>
          <span>Version: fireflies_closeout_v4</span>
        </div>
      </footer>

      {/* MODAL 1: PRE-BRIEF (Fix A4) */}
      <PrebriefModal
        isOpen={state.prebriefModalOpen}
        onClose={() => dispatch({ type: 'OPEN_PREBRIEF', open: false })}
        commitments={state.commitments}
        activePersona={state.activePersona}
        onMarkDone={(id) => dispatch({ type: 'MARK_DONE', id })}
        onDrop={(id, reason) => {
          dispatch({ type: 'DROP_COMMITMENT_1TAP', id });
          if (reason) dispatch({ type: 'SET_DROP_CHIP', id, reason });
        }}
        onClaim={(id) =>
          dispatch({ type: 'CLAIM_COMMITMENT', id, persona: PERSONAS[state.activePersona].name })
        }
        onResolveRepeating={(id, action) => {
          if (action === 'own') {
            dispatch({
              type: 'DANA_ROUTE_CARD',
              id,
              decision: 'suggest',
              targetOwner: 'Priya',
            });
          } else if (action === 'drop') {
            dispatch({
              type: 'DANA_ROUTE_CARD',
              id,
              decision: 'drop',
            });
          }
        }}
      />

      {/* MODAL 2: WORKSPACE REPORT (Prompt D) */}
      <WorkspaceReportModal
        isOpen={state.workspaceReportOpen}
        onClose={() => dispatch({ type: 'OPEN_WORKSPACE_REPORT', open: false })}
        cohortSize={state.managerCohortSize}
        honestRate={honestRate / 100}
        baselineRate={0.28}
        doneCount={doneCount}
        droppedCount={droppedCount}
        reassignedCount={reassignedCount}
        wentQuietCount={wentQuietCount}
        openCount={openCount}
        totalCohort={state.commitments.length}
      />

      {/* MODAL 3: GUEST CONSENT (Fix A3) */}
      <GuestConsentModal
        isOpen={state.guestConsentModalOpen}
        onClose={() => dispatch({ type: 'OPEN_GUEST_CONSENT', open: false })}
        guestName="Alex (Guest)"
        quote="I'll share the API benchmark logs after this call."
        meetingTitle="Weekly Product Sync"
        timestamp="12:20"
        dueText="Tue, Oct 27, 2026"
        onConfirmConsent={() => dispatch({ type: 'CONFIRM_GUEST_CONSENT', id: 'c3' })}
      />

      {/* MODAL 4: INVARIANT SELF-TEST (Fix A6) */}
      <SelfTestModal
        isOpen={state.selfTestModalOpen}
        onClose={() => dispatch({ type: 'OPEN_SELF_TEST', open: false })}
      />

      {/* MODAL 5: WHY THIS CARD? TRANSPARENCY (Prompt B) */}
      {whyCard && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => dispatch({ type: 'OPEN_WHY_THIS_CARD', id: null })}
        >
          <div
            className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden bg-[#18181A] text-xs p-6 space-y-4"
            style={{ borderColor: TOKENS.borderCard }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5B45F0]" />
                <h3 className="font-semibold text-white">Why this card?</h3>
              </div>
              <button
                onClick={() => dispatch({ type: 'OPEN_WHY_THIS_CARD', id: null })}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-neutral-400 text-[11px] block">Extracted from verbatim audio:</span>
                <p className="text-white italic">"{whyCard.quote}"</p>
                <span className="text-[11px] text-neutral-400 block mt-1">
                  Speaker: {whyCard.speaker} • [{whyCard.timestamp}] • Confidence: {Math.round(whyCard.confidence * 100)}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0F3324]/50 border border-[#35C98B]/30 text-[#35C98B] space-y-1">
                <span className="font-semibold block">What AI did NOT do:</span>
                <p className="text-xs text-neutral-200">
                  AI did not assign this to you. AI did not add it to your calendar. You decide whether to tap Mine, Reassign, or Drop.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLACK SIMULATOR (Two-Way Sync) */}
      <SlackSimulator
        isOpen={state.slackOpen}
        onClose={() => dispatch({ type: 'TOGGLE_SLACK', open: false })}
        activePersona={state.activePersona}
        commitments={state.commitments}
        currentDay={state.currentDay}
        onClaim={(id, persona) => dispatch({ type: 'CLAIM_COMMITMENT', id, persona })}
        onSuggest={(id, suggestedTo) => dispatch({ type: 'SUGGEST_OWNER', id, suggestedTo })}
        onAnswerSuggestion={(id, accept, persona) =>
          dispatch({ type: 'ANSWER_SUGGESTION', id, accept, persona })
        }
        onMarkDone={(id, quote) => dispatch({ type: 'MARK_DONE', id, confirmedQuote: quote })}
        onDrop={(id, reason) => {
          dispatch({ type: 'DROP_COMMITMENT_1TAP', id });
          if (reason) dispatch({ type: 'SET_DROP_CHIP', id, reason });
        }}
        onDismiss={(id) => dispatch({ type: 'DISMISS_COMMITMENT', id })}
      />
    </div>
  );
}
