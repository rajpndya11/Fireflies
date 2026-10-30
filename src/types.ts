/**
 * Types & Domain Models for Fireflies Close-out
 */

export type PersonaId = 'priya' | 'marcus' | 'dana' | 'admin';
export type AppMode = 'today' | 'closeout';
export type TimeDay = 0 | 2 | 5 | 7 | 12 | 14;

export type CommitmentStatus =
  | 'extracted'
  | 'delivered'
  | 'claimed'
  | 'suggested-to-other'
  | 'dismissed'
  | 'unclaimed'
  | 'accepted'
  | 'declined'
  | 'done'
  | 'reassign-pending'
  | 'dropped'
  | 'went-quiet';

export type CommitmentPriority = 'high' | 'medium' | 'low';

export interface Commitment {
  id: string;
  meetingId: string;
  meetingTitle: string;
  speaker: string;
  quote: string;
  timestamp: string;
  dueText: string;
  initialOwner: string;
  suggestedOwner?: string;
  confirmedOwner?: string;
  status: CommitmentStatus;
  priority?: CommitmentPriority;
  confidence: number;
  deliveryChannel: 'slack' | 'app';
  nudgesCount: number;
  extractedAtDay: TimeDay;
  closedAtDay?: TimeDay;
  isRepeated?: boolean;
  repeatMentionCount?: number;
  repeat_of?: string | null;
  isGuest?: boolean;
  isOwnerless?: boolean;
  looksDoneEvidence?: {
    evidenceQuote: string;
    meetingTitle: string;
    timestamp: string;
  };
  dropReason?: string;
  dropChipsOffered?: boolean;
  snoozedUntilDay?: TimeDay;
  isMuted?: boolean;
  dependent?: {
    name: string;
    role: string;
    need: string;
    updateStatus: 'none' | 'prepared' | 'sent' | 'skipped';
    sentMessage?: string;
  };
  blocker?: {
    isBlocked: boolean;
    reason: string;
  };
  deadlineHistory?: {
    originalDue: string;
    adjustedDue?: string;
    reason?: string;
  };
  kind?: string;
  aiAttributionNotice?: string;
}

export interface AppEventLog {
  id: string;
  timestamp: string;
  simulatedDay: TimeDay;
  type:
    | 'commitment_extracted'
    | 'card_delivered'
    | 'commitment_claimed'
    | 'owner_suggested'
    | 'owner_suggestion_answered'
    | 'commitment_dismissed'
    | 'nudge_sent'
    | 'nudge_actioned'
    | 'closure_suggested'
    | 'commitment_closed'
    | 'commitment_repeated'
    | 'commitment_expired'
    | 'prebrief_opened'
    | 'report_viewed'
    | 'readback_posted'
    | 'readback_replied'
    | 'dependent_notified'
    | 'blocker_updated'
    | 'deadline_adjusted';
  payload: Record<string, any>;
}

export interface Persona {
  id: PersonaId;
  name: string;
  roleTitle: string;
  avatarInitials: string;
  avatarColor: string;
  description: string;
}

export const TOKENS = {
  bgApp: '#121212',
  bgNavyGradient: 'linear-gradient(180deg, rgba(20, 24, 45, 0.45) 0%, rgba(18, 18, 18, 0) 260px)',
  bgSidebar: '#0D0D0E',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderCard: 'rgba(255, 255, 255, 0.08)',
  borderFocus: '#5B45F0',
  bgCard: '#1B1B1D',
  bgCardHover: '#222226',
  textPrimary: '#EDEDEF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  primaryViolet: '#5B45F0',
  primaryVioletHover: '#4B36E0',
  primaryVioletSubtle: 'rgba(91, 69, 240, 0.12)',
  successGreenText: '#35C98B',
  successGreenBg: '#0F3324',
  successGreenBorder: 'rgba(53, 201, 139, 0.25)',
  brandPink: '#E8508F',
  notificationRed: '#F0443A',
  amberWarning: '#F5A524',
  heroBannerBg: '#3A1D0F',
  heroBannerBorder: '#6E3C1B',
  tileMaroonBg: '#2D141E',
  tileGreenBg: '#0F291E',
  tileIndigoBg: '#1B1A3B',
  radiusCard: '16px',
  radiusTile: '14px',
  radiusButton: '10px',
  radiusPill: '9999px',
};
