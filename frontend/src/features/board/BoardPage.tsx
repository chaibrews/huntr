import { useAuth } from "../../hooks/useAuth";
import { useApplications } from "../../hooks/useApplications";
import type { Status, Application } from "../../types";
import {
  Calendar,
  ClipboardList,
  Gift,
  MessageSquare,
  PieChart,
  Plus,
  type LucideIcon,
} from "lucide-react";
import BoardColumn from "./BoardColumn";
import { useState } from "react";
import ApplicationForm from "../applications/ApplicationForm";

// The kanban columns in order
const STATUSES: Status[] = ["SAVED", "APPLIED", "INTERVIEW", "OFFER"];

// Display labels for each status
const STATUS_LABELS: Record<Status, string> = {
  SAVED: "saved",
  APPLIED: "applied",
  INTERVIEW: "interview",
  OFFER: "offer",
  REJECTED: "rejected",
  ARCHIVED: "archived",
};

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  SAVED: { bg: "#EBEAF3", fg: "#6a698c" },
  APPLIED: { bg: "#EAEBFC", fg: "#6D83DD" },
  INTERVIEW: { bg: "#F0EBFC", fg: "#806ed3" },
  OFFER: { bg: "#EFF3F2", fg: "#A2C4B2" },
};

const STAT_ICONS: Record<
  string,
  { icon: LucideIcon; bg: string; color: string }
> = {
  applications: { icon: ClipboardList, bg: "#EAEBFC", color: "#6D83DD" },
  interviews: { icon: MessageSquare, bg: "#F0EBFC", color: "#B6A9EF" },
  offers: { icon: Gift, bg: "#EFF3F2", color: "#A2C4B2" },
  rate: { icon: PieChart, bg: "#ffeffe", color: "#fcbff8" },
  week: { icon: Calendar, bg: "#EBEAF3", color: "#AFAEC4" },
};

export default function BoardPage() {
  const { user, logout } = useAuth();
  const { applications, loading, error, changeStatus, remove, create } =
    useApplications();
  const [showForm, setShowForm] = useState(false);

  // Group applications by status — produces an object like:
  // { SAVED: [...], APPLIED: [...], INTERVIEW: [...], ... }
  const grouped = STATUSES.reduce<Record<Status, Application[]>>(
    (acc, status) => {
      acc[status] = applications.filter((a) => a.status === status);
      return acc;
    },
    {} as Record<Status, Application[]>,
  );

  // Stats
  const interviewCount = grouped["INTERVIEW"]?.length ?? 0;
  const offerCount = grouped["OFFER"]?.length ?? 0;
  const appliedCount = applications.filter((a) => a.status !== "SAVED").length;
  const responseRate =
    appliedCount > 0
      ? Math.round(((interviewCount + offerCount) / appliedCount) * 100)
      : 0;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = applications.filter(
    (a) => new Date(a.createdAt) > oneWeekAgo,
  ).length;

  const stats = [
    { key: "applications", label: "Applications", value: appliedCount },
    { key: "interviews", label: "Interviews", value: interviewCount },
    { key: "offers", label: "Offers", value: offerCount },
    { key: "rate", label: "Response Rate", value: `${responseRate}%` },
    { key: "week", label: "This Week", value: `+${thisWeek}` },
  ];

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <header className="sticky flex items-center justify-between px-8 py-4 bg-white/80 border-b border-shadow">
        {/* Left Side Nav */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <img src="/huntr.svg" alt="Logo" className="w-6" />
            <h1 className="text-xl  text-primary-darker">huntR.</h1>
          </div>
          <span className="text-foreground/40">|</span>
          <span className="text-sm text-foreground/70">Dashboard</span>
        </div>
        {/* Right Side Nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="primary-button bg-secondary px-4 flex items-center gap-1"
          >
            <Plus size={16} /> Add Application
          </button>

          <div
            title={user?.email}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold cursor-pointer"
          >
            {user?.email?.[0]?.toUpperCase() ?? "★"}
          </div>

          <button
            onClick={logout}
            className="text-sm  text-foreground/40 hover:text-foreground/70 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* CONTENT PAGE */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-[200px_1fr] gap-6">
          {/* STAT CARDS */}
          <div className="grid grid-rows-5 gap-4 ">
            {stats.map((s, i) => {
              const cfg = STAT_ICONS[s.key];
              return (
                <div
                  key={s.key}
                  className={`flex rounded-lg border border-shadow p-4 gap-2`}
                  style={{
                    color: cfg.color,
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  <div>{<cfg.icon size={32} />}</div>
                  <div className="flex flex-col">
                    <div className="text-xl text-foreground tracking-tight leading-none">
                      {s.value}
                    </div>
                    <div className="text-sm  text-foreground/80">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOARD CARDS */}
          <div>
            {/* Loading State */}
            {loading && (
              <p className="text-sm text-primary text-center">Loading...</p>
            )}
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-4 gap-3">
                {STATUSES.map((status) => (
                  <BoardColumn
                    key={status}
                    color={STATUS_COLORS[status]}
                    label={STATUS_LABELS[status]}
                    applications={grouped[status] ?? []}
                    onStatusChange={changeStatus}
                    onDelete={remove}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ADD FORM MODAL ── */}
      {showForm && (
        <ApplicationForm
          onClose={() => setShowForm(false)}
          onCreate={async (data) => {
            await create(data);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
