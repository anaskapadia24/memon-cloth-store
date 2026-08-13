// Tells the Next.js storefront (web/) to drop its cached product/category data
// right away, instead of waiting for a timed ISR refresh. Best-effort - a failure
// here should never block the product/category write that triggered it.
async function revalidate(tags) {
  const url = process.env.NEXTJS_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return;

  try {
    await fetch(`${url.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ tags }),
    });
  } catch (err) {
    console.error("Revalidation webhook failed (non-fatal):", err.message);
  }
}

module.exports = { revalidate };
