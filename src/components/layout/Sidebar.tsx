"use client";

import { HubData, SectionId } from "@/lib/types";
import { exportBackup } from "@/lib/storage";

// Section nav config
const NAV_ITEMS: {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  countKey?: keyof HubData | "pipeline";
}[] = [
  {
    id: "pipeline",
    label: "Pipeline",
    countKey: "pipeline",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "suppliers",
    label: "Suppliers",
    countKey: "suppliers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" />
        <rect x="9" y="11" width="14" height="10" rx="2" />
        <circle cx="12" cy="16" r="1" />
        <circle cx="20" cy="16" r="1" />
      </svg>
    ),
  },
  {
    id: "products",
    label: "Products",
    countKey: "products",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: "research",
    label: "Research",
    countKey: "research",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    id: "improvements",
    label: "Improvements",
    countKey: "improvements",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    id: "plans",
    label: "Build Plans",
    countKey: "plans",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "resources",
    label: "Resources",
    countKey: "resources",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
  },
];

function totalRecords(hubData: HubData, dealCount: number): number {
  return (
    hubData.suppliers.length +
    hubData.products.length +
    hubData.research.length +
    hubData.improvements.length +
    hubData.plans.length +
    hubData.resources.length +
    dealCount
  );
}

interface SidebarProps {
  currentSection: SectionId;
  onNavigate: (section: SectionId) => void;
  hubData: HubData;
  dealCount: number;
  salesData?: { deals: { id: string }[] };
  onExport?: () => void;
}

export default function Sidebar({ currentSection, onNavigate, hubData, dealCount, salesData, onExport }: SidebarProps) {
  const counts: Record<string, number> = {
    pipeline: dealCount,
    suppliers: hubData.suppliers.length,
    products: hubData.products.length,
    research: hubData.research.length,
    improvements: hubData.improvements.length,
    plans: hubData.plans.length,
    resources: hubData.resources.length,
  };

  const total = totalRecords(hubData, dealCount);

  return (
    <aside
      className="hidden md:flex flex-col h-full flex-shrink-0"
      style={{
        width: "256px",
        background: "var(--char-850)",
        borderRight: "1px solid var(--line)",
      }}
    >
      {/* Brand mark */}
      <div
        className="flex-shrink-0 px-5 pt-6 pb-5"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div
          style={{
            fontFamily: "var(--display)",
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--cream)",
            textTransform: "uppercase",
          }}
        >
          New Primitive
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.14em",
            color: "var(--orange)",
            textTransform: "uppercase",
            marginTop: "2px",
          }}
        >
          Founder Hub
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map(item => {
          const active = currentSection === item.id;
          const count = counts[item.id] ?? 0;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-all"
              style={{
                background: active
                  ? "linear-gradient(135deg, rgba(232, 90, 35, 0.22) 0%, rgba(189, 106, 54, 0.14) 100%)"
                  : "transparent",
                color: active ? "var(--cream)" : "var(--cream-dim)",
                border: active ? "1px solid rgba(232, 90, 35, 0.20)" : "1px solid transparent",
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = "rgba(244, 237, 226, 0.05)";
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                style={{ color: active ? "var(--orange)" : "var(--cream-dim)", flexShrink: 0 }}
              >
                {item.icon}
              </span>
              <span
                className="flex-1 text-sm"
                style={{
                  fontFamily: "var(--sans)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </span>
              {count > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    background: active ? "rgba(232, 90, 35, 0.25)" : "rgba(244, 237, 226, 0.08)",
                    color: active ? "var(--orange)" : "var(--cream-faint)",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="flex-shrink-0 px-5 py-4"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#3F6B4E", boxShadow: "0 0 6px rgba(63, 107, 78, 0.7)" }}
            />
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                color: "var(--cream-dim)",
              }}
            >
              Live
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--cream-faint)",
            }}
          >
            {total} records
          </span>
        </div>

        <button
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors"
          style={{
            fontFamily: "var(--sans)",
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--cream-dim)",
            background: "rgba(244, 237, 226, 0.06)",
            border: "1px solid var(--line)",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(244, 237, 226, 0.10)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(244, 237, 226, 0.06)")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export backup
        </button>
      </div>
    </aside>
  );
}
