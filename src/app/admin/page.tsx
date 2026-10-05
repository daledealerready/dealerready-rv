import { AdminBuyersPanel } from "@/components/admin/AdminBuyersPanel";

export default function AdminPage() {
  return (
    <div className="min-h-full bg-paper">
      <header className="border-b border-fog bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-ink">
            DealerReady <span className="text-signal">RV</span>
          </p>
          <p className="text-sm font-medium text-ink/55">Admin</p>
        </div>
      </header>
      <AdminBuyersPanel />
    </div>
  );
}
