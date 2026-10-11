import { coachPickGroups } from "@/lib/coach-picks";

export function CoachPicksList({
  kind,
  picks,
  compact = false,
}: {
  kind: string;
  picks: unknown;
  compact?: boolean;
}) {
  const groups = coachPickGroups(kind, picks);
  if (groups.length === 0) return null;

  if (compact) {
    return (
      <p className="mt-2 line-clamp-3 text-sm font-medium text-ink">
        {groups
          .map((group) => `${group.heading}: ${group.items.join("; ")}`)
          .join(" ")}
      </p>
    );
  }

  return (
    <div className="rounded-md bg-mist px-3 py-3">
      {groups.map((group) => (
        <div key={group.heading} className="mt-3 first:mt-0">
          <p className="text-xs font-semibold tracking-wide text-ink/55 uppercase">
            {group.heading}
          </p>
          <ul className="mt-1 space-y-1">
            {group.items.map((item) => (
              <li key={item} className="font-semibold text-ink">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
