import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "var(--color-bg-base)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            maxWidth: "400px",
          }}
        >
          <h1
            style={{
              fontSize: "var(--text-4xl)",
              fontWeight: 700,
              letterSpacing: "-0.035em",
              marginBottom: "12px",
              color: "var(--color-text-primary)",
            }}
          >
            Page not found
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "var(--text-base)",
              lineHeight: 1.6,
              marginBottom: "32px",
              maxWidth: "56ch",
              margin: "0 auto 32px",
            }}
          >
            This page doesn't exist or has been moved. Use the navigation to get back to your dashboard.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              backgroundColor: "var(--color-accent)",
              color: "#ffffff",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              textDecoration: "none",
              borderRadius: "var(--radius-sm)",
              transition: "background-color var(--duration-normal) var(--ease-out)",
            }}
          >
            Return to Overview
          </Link>
        </div>
      </body>
    </html>
  );
}
