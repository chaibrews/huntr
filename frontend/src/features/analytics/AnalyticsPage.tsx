import AppShell from "../../components/AppShell";
import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
          <BarChart2 size={28} className="text-primary-darker" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-foreground/50 max-w-xs">
          Track your application funnel, response rates, and interview
          conversion. Coming soon.
        </p>
      </div>
    </AppShell>
  );
}
