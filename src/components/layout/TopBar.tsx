"use client";

import { SectionId } from "@/lib/types";
import { SECTIONS } from "@/lib/constants";

interface TopBarProps {
  section: SectionId;
  onAdd?: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
}

const ADD_LABELS: Record<SectionId, string> = {
  pipeline: "Add deal",
  suppliers: "Add supplier",
  products: "Add product",
  research: "Add finding",
  improvements: "Add improvement",
  plans: "Add plan set",
  resources: "Add resource",
  campaigns: "Add campaign",
  events: "Add event",
  content: "Add content",
  testimonials: "Add testimonial",
  webPresence: "Add platform",
  projects: "Add project",
  customers: "Add customer",
  finance: "Add entry",
};

export default function TopBar({ section, onAdd, searchQuery, onSearch }: TopBarProps) {
  const sectionDef = SECTIONS.find(s => s.id === section);

  const title =
    section === "pipeline"
      ? "Sales Pipeline"
      : sectionDef?.title ?? section;

  const desc = sectionDef?.lede ?? sectionDef?.desc ?? "";

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-6 py-4 gap-4"
      style={{
        background: "var(--char-850)",
        borderBottom: "1px solid var(--line)",
        minHeight: "72px",
      }}
    >
      {/* Title + description */}
      <div className="min-w-0">
        <h1
          className="truncate"
          style={{
            fontFamily: "var(--display)",
            fontSize: "17px",
            fontWeight: 700,
            color: "var(--cream)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h1>
        {desc && (
          <p
            className="truncate mt-0.5"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "12px",
              color: "var(--cream-dim)",
            }}
          >
            {desc}
          </p>
        )}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Search */}
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--cream-faint)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "13px",
              background: "var(--char-800)",
              border: "1px solid var(--line)",
              color: "var(--cream)",
              width: "200px",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(232, 90, 35, 0.40)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--line)")}
          />
        </div>

        {/* Add button */}
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              fontFamily: "var(--sans)",
              fontWeight: 600,
              fontSize: "13px",
              background: "var(--orange)",
              color: "#fff",
              border: "none",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--orange-2)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--orange)")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {ADD_LABELS[section]}
          </button>
        )}
      </div>
    </header>
  );
}
