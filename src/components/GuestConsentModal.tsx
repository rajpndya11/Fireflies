import React, { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Check,
  Shield,
  Copy,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { TOKENS } from '../types';

interface GuestConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestName: string;
  quote: string;
  meetingTitle: string;
  timestamp: string;
  dueText: string;
  onConfirmConsent: () => void;
}

export const GuestConsentModal: React.FC<GuestConsentModalProps> = ({
  isOpen,
  onClose,
  guestName,
  quote,
  meetingTitle,
  timestamp,
  dueText,
  onConfirmConsent,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClaimByGuest = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirmConsent();
      onClose();
    }, 900);
  };

  const copyGuestLink = () => {
    navigator.clipboard.writeText(`https://app.fireflies.ai/guest/consent?item=c3_alex_logs&token=sec_98f4`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden bg-[#18181A]"
        style={{
          borderColor: TOKENS.borderCard,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/8 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#5B45F0]" />
            <h3 id="guest-modal-title" className="text-xs font-semibold text-white">
              Guest Email Preview & Consent Link
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[#A1A1AA] space-y-1">
            <span className="font-semibold text-white block">External Guest Privacy Rule:</span>
            Fireflies will never automatically assign tasks to non-workspace guests without affirmative opt-in consent.
          </div>

          {/* Email Preview Card */}
          <div className="rounded-xl border border-white/15 bg-black/50 overflow-hidden shadow-inner">
            <div className="px-4 py-2.5 bg-black/70 border-b border-white/8 flex items-center justify-between text-[11px] text-[#A1A1AA]">
              <span>To: alex.guest@partnerorg.com</span>
              <span>From: notes@fireflies.ai</span>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8508F]" />
                <span className="font-semibold text-white text-xs">Fireflies.ai Close-out</span>
              </div>

              <div>
                <p className="text-xs text-[#EDEDEF]">
                  Hi Alex, in today's <strong>{meetingTitle}</strong>, you mentioned:
                </p>
                <blockquote className="my-2 p-3 rounded-lg bg-white/5 border-l-2 border-[#5B45F0] text-white italic">
                  "{quote}"
                </blockquote>
                <span className="text-[11px] text-[#A1A1AA] block">
                  Target date: {dueText} • Timestamp [{timestamp}]
                </span>
              </div>

              <p className="text-[11px] text-[#A1A1AA]">
                If you'd like Fireflies to keep this on your personal checklist and send a 60-min pre-brief reminder before next sync, tap below:
              </p>

              {confirmed ? (
                <div className="p-3 rounded-xl bg-[#0F3324] border border-[#35C98B]/30 text-[#35C98B] flex items-center justify-center gap-2 font-medium">
                  <Check className="w-4 h-4" />
                  Consent Confirmed! Alex is now the confirmed owner.
                </div>
              ) : (
                <button
                  onClick={handleClaimByGuest}
                  className="w-full h-11 rounded-xl bg-[#5B45F0] hover:bg-[#4B36E0] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#5B45F0]"
                >
                  <Check className="w-4 h-4" />
                  Mine (I will do this)
                </button>
              )}
            </div>
          </div>

          {/* Shareable Link row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-[#71717A] truncate font-mono">
              https://app.fireflies.ai/guest/consent?item=c3_alex_logs
            </span>
            <button
              onClick={copyGuestLink}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1 shrink-0 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#35C98B]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Link Copied' : 'Copy Guest Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
