import { Suspense } from "react";
import { ProfileWizard } from "@/components/profile/ProfileWizard";

export default function ProfileStartPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-paper text-ink/60">
          Loading your buyer profile...
        </div>
      }
    >
      <ProfileWizard />
    </Suspense>
  );
}
