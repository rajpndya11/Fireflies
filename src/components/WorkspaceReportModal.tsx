import React, { useEffect } from 'react';
import {
  X,
  Printer,
  Shield,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react';
import { TOKENS } from '../types';

interface WorkspaceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohortSize: number;
  honestRate: number;
  baselineRate: number;
  doneCount: number;
  droppedCount: number;
  reassignedCount: number;
  wentQuietCount: number;
  openCount: number;
  totalCohort: number;
}

export const WorkspaceReportModal: React.FC<WorkspaceReportModalProps> = ({
  isOpen,
  onClose,
  cohortSize,
  honestRate,
  baselineRate,
  doneCount,
  droppedCount,
  reassignedCount,
  wentQuietCount,
  openCount,
  totalCohort,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPrivacySuppressed = cohortSize < 5;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden bg-[#18181A]"
        style={{
          borderColor: TOKENS.borderCard,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Toolbar (hidden when printing) */}
        <div className="p-4 px-6 border-b border-white/8 flex items-center justify-between bg-black/40 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#5B45F0]" />
            <span className="text-xs font-semibold text-white">
              1-Page Printable Executive Follow-Through Report
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#35C98B]/15 text-[#35C98B] font-medium">
              K-Anonymity Verified
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-[#5B45F0] hover:bg-[#4B36E0] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div
          id="printable-report"
          className="p-8 overflow-y-auto space-y-6 text-[#121212] bg-[#FAF9F6] print:p-0 print:bg-white print:text-black flex-1"
        >
          {/* Header */}
          <div className="border-b-2 border-neutral-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-[#E8508F]" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Fireflies.ai Close-out Workspace Intelligence
                </span>
              </div>
              <h1 id="report-modal-title" className="text-2xl font-bold text-neutral-950">
                Workspace Follow-Through & Closure Report
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                Period: Oct 27, 2026 – Nov 10, 2026 • Reporting Cohort: Product & Engineering Team
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded bg-neutral-200 text-xs font-bold text-neutral-800">
                Cohort: {cohortSize} Active Team Members
              </span>
              <span className="block text-[11px] text-neutral-500 mt-1">
                Strict Zero-Surveillance Standard
              </span>
            </div>
          </div>

          {isPrivacySuppressed ? (
            <div className="p-8 rounded-xl border border-neutral-300 bg-neutral-100 text-center space-y-3">
              <Shield className="w-8 h-8 text-neutral-600 mx-auto" />
              <h2 className="text-base font-bold text-neutral-900">
                Cohort Suppression Active (k &lt; 5)
              </h2>
              <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                This cohort has {cohortSize} active people. To mathematically guarantee that individual commitments cannot be inferred by managers, aggregates require at least 5 contributors.
              </p>
            </div>
          ) : (
            <>
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-neutral-300 bg-white">
                  <span className="text-xs text-neutral-500 font-medium block">
                    14-Day Honest Resolution
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-emerald-700">
                      {Math.round(honestRate * 100)}%
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      +{(Math.round((honestRate - baselineRate) * 100))}% vs baseline
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Target: 45% in 6 months (Exceeded)
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-neutral-300 bg-white">
                  <span className="text-xs text-neutral-500 font-medium block">
                    Baseline Unassisted Rate
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-neutral-700">
                      {Math.round(baselineRate * 100)}%
                    </span>
                    <span className="text-xs text-neutral-500">
                      Standard broadcast
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Without explicit consent loop
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-neutral-300 bg-white">
                  <span className="text-xs text-neutral-500 font-medium block">
                    Total Extracted Commitments
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-indigo-900">
                      {totalCohort}
                    </span>
                    <span className="text-xs text-neutral-600">
                      in cohort
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Verbatim quotes verified
                  </span>
                </div>
              </div>

              {/* Closure Breakdown Table */}
              <div className="border border-neutral-300 rounded-xl overflow-hidden bg-white">
                <div className="p-3 bg-neutral-100 border-b border-neutral-300 font-bold text-xs text-neutral-800">
                  Cohort Resolution Breakdown (Totals Only — Zero Individual Names)
                </div>
                <div className="divide-y divide-neutral-200 text-xs">
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-medium text-neutral-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      Marked Done with Human Confirmation
                    </span>
                    <span className="font-bold text-neutral-900">
                      {doneCount} ({Math.round((doneCount / totalCohort) * 100)}%)
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-medium text-neutral-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      Reassigned & Accepted by Teammate
                    </span>
                    <span className="font-bold text-neutral-900">
                      {reassignedCount} ({Math.round((reassignedCount / totalCohort) * 100)}%)
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-medium text-neutral-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-neutral-500" />
                      Deliberately Dropped (Legitimate Closure)
                    </span>
                    <span className="font-bold text-neutral-900">
                      {droppedCount} ({Math.round((droppedCount / totalCohort) * 100)}%)
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between bg-neutral-50">
                    <span className="font-medium text-neutral-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Still Open (Within 14-day window)
                    </span>
                    <span className="font-bold text-neutral-800">
                      {openCount} ({Math.round((openCount / totalCohort) * 100)}%)
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between bg-neutral-50">
                    <span className="font-medium text-neutral-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                      Went Quiet after 14 Days (Counted in denominator)
                    </span>
                    <span className="font-bold text-neutral-800">
                      {wentQuietCount} ({Math.round((wentQuietCount / totalCohort) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Executive Plain English Takeaways */}
              <div className="p-4 rounded-xl bg-white border border-neutral-300 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Leadership Key Observations
                </h3>
                <ul className="list-disc pl-5 text-xs text-neutral-700 space-y-1">
                  <li>
                    <strong>Closure Quality:</strong> Dropping unneeded promises cleanly account for {Math.round((droppedCount / totalCohort) * 100)}% of resolution, saving an estimated 14 hours of phantom follow-up work.
                  </li>
                  <li>
                    <strong>Velocity Gain:</strong> Promises made in meetings reach resolution in an average of 4.2 days vs 11.8 days in the baseline unassisted model.
                  </li>
                  <li>
                    <strong>Privacy Compliance:</strong> All data is aggregated at the team level with strict K-anonymity (k=5). No employee leaderboard, ranking, or individual scrutiny exists in this platform.
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Sign-off Footer */}
          <div className="pt-4 border-t border-neutral-300 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Generated by Fireflies Close-out System</span>
            <span>Audited & Encrypted • Fireflies.ai</span>
          </div>
        </div>
      </div>
    </div>
  );
};
