"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: "20px",
          fontFamily: "sans-serif",
        }}
      >
        <h1 style={{ marginBottom: "8px" }}>Something went wrong</h1>
        <p style={{ marginBottom: "24px", color: "#666" }}>
          Please try again, or come back in a moment.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "10px 24px",
            border: "none",
            borderRadius: "6px",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
