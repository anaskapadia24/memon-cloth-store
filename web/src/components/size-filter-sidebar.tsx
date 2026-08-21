"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SIZE_ORDER = ["M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

export function SizeFilterSidebar({
  counts,
  selected,
}: {
  counts: Record<string, number>;
  selected: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sizes = SIZE_ORDER.filter((s) => counts[s]);
  if (sizes.length === 0) return null;

  function pushSizes(nextSizes: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextSizes.length > 0) params.set("sizes", nextSizes.join(","));
    else params.delete("sizes");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggle(size: string) {
    const next = new Set(selected);
    if (next.has(size)) next.delete(size);
    else next.add(size);
    pushSizes(Array.from(next));
  }

  return (
    <div className="size-filter-box">
      <h4>Size</h4>
      <div className="size-filter-list">
        {sizes.map((s) => (
          <label key={s} className="size-filter-item">
            <input
              type="checkbox"
              checked={selected.includes(s)}
              onChange={() => toggle(s)}
            />
            <span>{s}</span>
            <span className="size-filter-count">({counts[s]})</span>
          </label>
        ))}
      </div>
      {selected.length > 0 && (
        <button
          type="button"
          className="size-filter-clear"
          onClick={() => pushSizes([])}
        >
          Clear size filter
        </button>
      )}
    </div>
  );
}