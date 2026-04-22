import AppShell from "../../components/AppShell";
import { UserCircle } from "lucide-react";

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
          <UserCircle size={28} className="text-primary-darker" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-foreground/50 max-w-xs">
          Set your target role, salary range, and work preferences to get
          personalized recommendations. Coming soon.
        </p>
      </div>
    </AppShell>
  );
}
