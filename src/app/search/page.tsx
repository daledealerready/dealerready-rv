import { Suspense } from "react";
import { ExactUnitResults } from "@/components/ExactUnitResults";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-paper text-ink/60">
          Searching participating dealers...
        </div>
      }
    >
      <ExactUnitResults />
    </Suspense>
  );
}
