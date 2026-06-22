"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ open, onClose, title, kicker, children, footer }: ModalProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(22, 20, 15, 0.72)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Drawer panel — slides in from right */}
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full flex flex-col"
        style={{
          width: "min(560px, 100vw)",
          background: "var(--char-850)",
          borderLeft: "1px solid var(--line-2)",
          boxShadow: "-24px 0 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 flex items-start justify-between px-6 pt-6 pb-5"
          style={{ borderBottom: "1px solid var(--line)" }}
        >
          <div>
            {kicker && (
              <p
                className="mb-1"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--orange)",
                }}
              >
                {kicker}
              </p>
            )}
            <h2
              style={{
                fontFamily: "var(--display)",
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--cream)",
              }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              color: "var(--cream-dim)",
              background: "transparent",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--char-800)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Optional footer */}
        {footer && (
          <div
            className="flex-shrink-0 px-6 py-4"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
