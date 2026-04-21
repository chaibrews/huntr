import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Application, Status, WorkSetup } from "../../types";
import { getApplicationById } from "../../api/applications";
import { useApplications } from "../../hooks/useApplications";
import { MapPin } from "lucide-react";

const STATUS_OPTIONS: Status[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "ARCHIVED",
];
const WORK_OPTIONS: WorkSetup[] = ["ONSITE", "HYBRID", "REMOTE"];

const STATUS_STYLES: Record<Status, { bg: string; fg: string }> = {
  SAVED: {
    bg: "#EBEAF3",
    fg: "#6a698c",
  },
  APPLIED: {
    bg: "#EAEBFC",
    fg: "#6D83DD",
  },
  INTERVIEW: {
    bg: "#F0EBFC",
    fg: "#806ed3",
  },
  OFFER: {
    bg: "#EFF3F2",
    fg: "#A2C4B2",
  },
  REJECTED: { bg: "bg-red-50", fg: "text-red-500" },
  ARCHIVED: {
    bg: "bg-foreground/5",
    fg: "text-foreground/50",
  },
};

const WORK_LABELS: Record<WorkSetup, string> = {
  ONSITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { changeStatus, update, remove } = useApplications();

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getApplicationById(id)
      .then((data) => {
        setApp(data);
        setNotes(data.notes ?? "");
      })
      .catch(() => setError("Application not found"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(status: Status) {
    if (!app) return;
    setApp((prev) => (prev ? { ...prev, status } : prev)); // optimistic
    try {
      const updated = await changeStatus(app.id, status);
      setApp(updated); // reconcile with server response (includes new history entry)
    } catch {
      setApp(app); // rollback on failure
    }
  }

  async function handleWorkSetupChange(workSetup: WorkSetup) {
    if (!app) return;
    setApp((prev) => (prev ? { ...prev, workSetup } : prev)); // optimistic
    try {
      const updated = await update(app.id, { workSetup });
      setApp(updated);
    } catch {
      setApp(app);
    }
  }

  async function handleSaveNotes() {
    if (!app) return;
    setSaving(true);
    const updated = await update(app.id, { notes });
    setApp(updated);
    setSaving(false);
    setEditNotes(false);
  }

  async function handleDelete() {
    if (!app || !confirm(`Delete application to ${app.company}?`)) return;
    await remove(app.id);
    navigate("/");
  }

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-primary animate-pulse">Loading...</p>
      </div>
    );

  if (error || !app)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">{error ?? "Not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="primary-button px-6 py-2 text-sm"
          >
            Back to board
          </button>
        </div>
      </div>
    );

  const statusCfg = STATUS_STYLES[app.status];

  return (
    <div className="min-h-screen bg-background">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-shadow flex items-center justify-between px-8 h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xs text-foreground/50 hover:text-foreground/80 transition-colors"
          >
            ← Back
          </button>
          <div className="w-px h-5 bg-shadow" />
          <span className="text-xs font-medium text-foreground/70 truncate max-w-xs">
            {app.company} — {app.role}
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="text-xs text-red-400 hover:text-red-500 transition-colors"
        >
          Delete
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* ── HERO ── */}
        <div
          className="bg-white rounded-md border border-shadow  p-6 mb-3"
          style={{ backgroundColor: statusCfg.bg }}
        >
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-foreground/50 font-medium mb-0.5">
                    {app.company}
                  </p>
                  <h1 className="text-xl font-bold text-foreground leading-tight">
                    {app.role}
                  </h1>
                  {app.location && (
                    <p className="text-sm flex items-center gap-1 mt-1 text-foreground/40">
                      <MapPin size={16} /> {app.location}
                    </p>
                  )}
                </div>

                {/* Status pill */}
                <span
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0"
                  style={{
                    backgroundColor: statusCfg.bg,
                    color: statusCfg.fg,
                    borderColor: statusCfg.fg,
                  }}
                >
                  {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── META GRID ── */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Status control */}
          <div className="bg-white rounded-md border border-shadow  p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">
              Status
            </p>
            <select
              value={app.status}
              onChange={(e) => handleStatusChange(e.target.value as Status)}
              className="w-full bg-background border border-shadow rounded-md px-3 py-2 text-sm
                         focus:outline-none focus:border-primary-darker/50 transition-colors appearance-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Work setup control */}
          <div className="bg-white rounded-md border border-shadow  p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">
              Work Setup
            </p>
            <select
              value={app.workSetup}
              onChange={(e) =>
                handleWorkSetupChange(e.target.value as WorkSetup)
              }
              className="w-full bg-background border border-shadow rounded-md px-3 py-2 text-sm
                         focus:outline-none focus:border-primary-darker/50 transition-colors appearance-none"
            >
              {WORK_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {WORK_LABELS[w]}
                </option>
              ))}
            </select>
          </div>

          {/* Applied date */}
          <div className="bg-white rounded-md border border-shadow  p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-1">
              Applied
            </p>
            <p className="text-sm text-foreground font-medium">
              {app.appliedAt ? (
                new Date(app.appliedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              ) : (
                <span className="text-foreground/30 font-normal">Not set</span>
              )}
            </p>
          </div>

          {/* URL */}
          <div className="bg-white rounded-md border border-shadow  p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-1">
              Job Posting
            </p>
            {app.url ? (
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-darker hover:underline font-medium truncate block"
              >
                {app.url.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              <span className="text-sm text-foreground/30">No link saved</span>
            )}
          </div>
        </div>

        {/* ── NOTES ── */}
        <div className="bg-white rounded-md border border-shadow  p-5 mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Notes
            </p>
            {!editNotes ? (
              <button
                onClick={() => setEditNotes(true)}
                className="text-xs text-primary-darker hover:underline font-medium"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditNotes(false);
                    setNotes(app.notes ?? "");
                  }}
                  className="text-xs text-foreground/40 hover:text-foreground/70"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="text-xs text-primary-darker font-semibold hover:underline disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
          {editNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add notes about this application..."
              className="w-full bg-background border border-shadow rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:border-primary-darker/50 transition-colors
                           resize-none leading-relaxed text-foreground"
              autoFocus
            />
          ) : (
            <p
              className={`text-sm leading-relaxed ${
                app.notes ? "text-foreground/70" : "text-foreground/30 italic"
              }`}
            >
              {app.notes ?? "No notes yet. Click Edit to add some."}
            </p>
          )}
        </div>

        {/* ── STATUS HISTORY ── */}
        <div className="bg-white rounded-md border border-shadow  p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-4">
            Status History
          </p>

          {app.statusHistory.length === 0 ? (
            <p className="text-sm text-foreground/30 italic">
              No status changes yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {app.statusHistory.map((h) => {
                const fromCfg = STATUS_STYLES[h.from];
                const toCfg = STATUS_STYLES[h.to];
                return (
                  <div key={h.id} className="flex items-center gap-3">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: fromCfg.bg,
                        color: fromCfg.fg,
                        borderColor: fromCfg.fg,
                      }}
                    >
                      {h.from.charAt(0) + h.from.slice(1).toLowerCase()}
                    </span>
                    <span className="text-foreground/30 text-sm">→</span>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: toCfg.bg,
                        color: toCfg.fg,
                        borderColor: toCfg.fg,
                      }}
                    >
                      {h.to.charAt(0) + h.to.slice(1).toLowerCase()}
                    </span>
                    <span className="ml-auto text-xs text-foreground/30">
                      {new Date(h.changedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
