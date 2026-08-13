"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export function SearchBox({ initialValue }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue || "");
  const router = useRouter();
  const pathname = usePathname();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    router.push(
      params.toString() ? `${pathname}?${params.toString()}` : pathname,
    );
  }

  return (
    <form className="search-box" onSubmit={handleSubmit}>
      <i className="fas fa-search" />
      <input
        type="text"
        placeholder="Search products..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
