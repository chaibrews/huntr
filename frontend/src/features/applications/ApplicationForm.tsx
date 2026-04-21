import { useState, FormEvent } from "react";
import type { CreateApplicationInput } from "../../api/applications";
import type { Status, WorkSetup } from "../../types";

interface Props {
  onClose: () => void;
  onCreate: (data: CreateApplicationInput) => Promise<void>;
}

const STATUS_OPTIONS: Status[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
];
const WORK_OPTIONS: WorkSetup[] = ["ONSITE", "HYBRID", "REMOTE"];

export default function ApplicationForm({ onClose, onCreate }: Props) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<Status>("SAVED");
  const [workSetup, setWorkSetup] = useState<WorkSetup | "">("");
  const [location, setLocation] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [appliedAt, setAppliedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onCreate({
        company,
        role,
        status,
        workSetup: (workSetup || null) as WorkSetup | null,
        location: location || null,
        url: url || null,
        notes: notes || null,
        appliedAt: appliedAt || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-primary overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-shadow">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              New Application
            </h2>
            <p className="text-xs text-foreground/40 mt-0.5">
              Track a new job you're interested in
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-background flex items-center justify-center
                       text-foreground/40 hover:text-foreground/70 hover:bg-shadow transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Company + Role — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Company <span className="text-primary-darker">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                placeholder="e.g. Microsoft"
                className="bg-background border border-shadow rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-primary-darker/50 focus:bg-white transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Role <span className="text-primary-darker">*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                placeholder="e.g. Full Stack Engineer"
                className="bg-background border border-shadow rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-primary-darker/50 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Status + Work Setup */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="bg-background border border-shadow rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-primary-darker/50 transition-colors appearance-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Work Setup
              </label>
              <select
                value={workSetup}
                onChange={(e) => setWorkSetup(e.target.value as WorkSetup)}
                className="bg-background border border-shadow rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-primary-darker/50 transition-colors appearance-none"
              >
                <option value="">Not specified</option>
                {WORK_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w.charAt(0) + w.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location + Applied Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, New York"
                className="bg-background border border-shadow rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-primary-darker/50 focus:bg-white transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Applied Date
              </label>
              <input
                type="date"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
                className="bg-background border border-shadow rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-primary-darker/50 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Job Posting URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="bg-background border border-shadow rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:border-primary-darker/50 focus:bg-white transition-colors"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Recruiter contact, referral info, anything relevant..."
              className="bg-background border border-shadow rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:border-primary-darker/50 focus:bg-white transition-colors
                         resize-none leading-relaxed"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-shadow text-sm font-medium
                         text-foreground/60 hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 primary-button py-2 text-sm"
            >
              {loading ? "Adding..." : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
