import { useNavigate } from "react-router-dom";
import type { Application, Status } from "../../types";

export default function BoardColumn({
  color,
  label,
  applications,
  onDelete,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2">
      {/* Column Header */}
      <div
        className="flex items-center border gap-2 px-4 py-3 mb-2 bg-white rounded-lg border-b border-shadow"
        style={{
          backgroundColor: color.bg,
          color: color.fg,
          borderColor: color.fg,
        }}
      >
        <div className="text-xs font-semibold tracking-widest uppercase">
          {label}
        </div>
        <div
          className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-white"
          style={{
            color: color.fg,
            borderColor: color.fg,
          }}
        >
          {applications.length}
        </div>
      </div>

      {/* Cards */}
      <div className="">
        {applications.length === 0 && (
          <p className="text-xs text-foreground/25 text-center">
            No applications here yet
          </p>
        )}

        {applications.map((app) => {
          return (
            <div
              key={app.id}
              onClick={() => navigate(`/applications/${app.id}`)}
              className="bg-white rounded-lg p-3 mb-4 cursor-pointer border hover:shadow-md transition-all duration-150 group"
              style={{
                color: color.fg,
                borderColor: color.fg,
              }}
            >
              {/* Card top: company + menu */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs  text-foreground/80 ">{app.company}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete application to ${app.company}?`)) {
                      onDelete(app.id);
                    }
                  }}
                  className="w-5 h-5 rounded-md flex items-center justify-center
                             text-foreground/25 hover:text-foreground/60 hover:bg-background
                             transition-colors text-sm opacity-0 group-hover:opacity-100"
                >
                  ⋯
                </button>
              </div>

              {/* Role */}
              <p className="text-md text-foreground ">{app.role}</p>

              {/* Location */}
              {app.location && (
                <p className="text-xs text-foreground/40 leading-tight">
                  {app.location}
                </p>
              )}

              {/* Tag/Notes */}
              {app.notes && (
                <span
                  className="inline-flex items-center gap-1 text-xs mt-2 px-2.5 py-1 rounded-md border"
                  style={{
                    backgroundColor: color.bg,
                    color: color.fg,
                    borderColor: color.fg,
                  }}
                >
                  {app.notes.slice(0, 24)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AppTag({ app, status }: { app: Application; status: Status }) {}
