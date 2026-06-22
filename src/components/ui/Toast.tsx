"use client";

interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl"
      style={{
        background: "var(--char-800)",
        border: "1px solid var(--line-2)",
        color: "var(--cream)",
        fontFamily: "var(--sans)",
        fontSize: "14px",
        fontWeight: 500,
        minWidth: "240px",
        maxWidth: "480px",
      }}
    >
      <span
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: "var(--ok)", color: "#fff" }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>{message}</span>
    </div>
  );
}
