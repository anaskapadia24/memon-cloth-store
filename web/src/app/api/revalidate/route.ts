import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// Called by the Express backend (backend/routes/products.js, backend/routes/categories.js)
// right after a product/category is created, updated, or deleted, so pages refetch
// instead of serving stale data until an ISR timer happens to fire.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (
    !process.env.REVALIDATE_SECRET ||
    secret !== process.env.REVALIDATE_SECRET
  ) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const tags: string[] = Array.isArray(body.tags) ? body.tags : [];

  if (tags.length === 0) {
    return NextResponse.json({ error: "No tags provided" }, { status: 400 });
  }

  // { expire: 0 } forces immediate expiration - the documented pattern for webhooks/
  // third-party callers, vs "max" which only marks data stale for the *next* visitor.
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: tags });
}
