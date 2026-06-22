"use client";

import { INCLUDE_KEYS, STATUS_COLORS, ROLE_COLORS } from "@/lib/constants";
import { ResourceLink } from "@/lib/types";

interface HubCardProps {
  item: Record<string, unknown>;
  sectionId: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function s(v: unknown): string {
  return v == null ? "" : String(v);
}

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  ok: { bg: "rgba(63,107,78,0.15)", text: "#3F6B4E" },
  warn: { bg: "rgba(154,110,31,0.15)", text: "#9A6E1F" },
  ember: { bg: "rgba(189,106,54,0.15)", text: "#BD6A36" },
  mute: { bg: "rgba(124,116,107,0.15)", text: "#7C746B" },
};

function Chip({ label, colorKey }: { label: string; colorKey?: string }) {
  const colors = colorKey ? (COLOR_MAP[colorKey] ?? COLOR_MAP.mute) : COLOR_MAP.mute;
  return (
    <span
      className="chip"
      style={{ background: colors.bg, color: colors.text }}
    >
      {label}
    </span>
  );
}

function SpecRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-xs">
      <span className="flex-none min-w-[80px]" style={{ color: "var(--cream-faint)", paddingTop: 1, fontSize: 11 }}>
        {label}
      </span>
      <span
        className={mono ? "font-mono" : ""}
        style={{ color: "var(--cream)", fontWeight: 500, fontSize: 12.5 }}
      >
        {value}
      </span>
    </div>
  );
}

function NoteBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div
      className="text-xs leading-relaxed"
      style={{
        color: "var(--cream-dim)",
        borderTop: "1px dashed var(--line-2)",
        paddingTop: 9,
        fontSize: 12.5,
      }}
    >
      {label && (
        <span
          className="block mb-1"
          style={{
            fontFamily: "var(--mono)",
            fontSize: 9.5,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--cream-faint)",
          }}
        >
          {label}
        </span>
      )}
      {value}
    </div>
  );
}

function CardActions({ id, onEdit, onDelete }: { id: string; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="card-actions flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEdit(id)}
        title="Edit"
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
        style={{ color: "var(--cream-dim)" }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--char-750)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M14 5l4 4" />
        </svg>
      </button>
      <button
        onClick={() => onDelete(id)}
        title="Delete"
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
        style={{ color: "var(--cream-dim)" }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(162,61,43,0.18)";
          e.currentTarget.style.color = "#e05a45";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--cream-dim)";
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
        </svg>
      </button>
    </div>
  );
}

function SupplierCard({ item, onEdit, onDelete }: { item: Record<string, unknown>; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const id = item.id as string;
  const roleColor = ROLE_COLORS[item.role as string] ?? "mute";
  const statusColor = STATUS_COLORS[item.status as string] ?? "mute";
  const email = item.email as string;
  const phone = item.phone as string;
  const website = item.website as string;

  return (
    <div
      className="group rounded-xl overflow-hidden flex flex-col transition-colors"
      style={{ background: "var(--char-850)", border: "1px solid var(--line)" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--line-2)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--line)")}
    >
      {/* Top */}
      <div
        className="flex items-start gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div className="min-w-0 flex-1">
          <div
            className="mb-1"
            style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cream-faint)" }}
          >
            {(item.category as string) || (item.role as string) || "Supplier"}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: "var(--cream)" }}>
            {item.name as string}
          </div>
        </div>
        <CardActions id={id} onEdit={onEdit} onDelete={onDelete} />
      </div>
      {/* Body */}
      <div className="flex flex-col gap-2.5 px-4 py-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {!!item.role && <Chip label={item.role as string} colorKey={roleColor} />}
          {!!item.status && <Chip label={item.status as string} colorKey={statusColor} />}
          {!!item.supplyType && (
            <span
              className="chip"
              style={{ background: "transparent", color: "var(--cream-dim)", border: "1px solid var(--line-2)" }}
            >
              {item.supplyType as string}
            </span>
          )}
        </div>
        <SpecRow label="Lead time" value={item.leadTime as string} mono />
        {!!item.contactName && <SpecRow label="Contact" value={item.contactName as string} />}
        {!!item.supplies && <NoteBlock label="Details" value={item.supplies as string} />}
        {!!item.notes && <NoteBlock label="Notes" value={item.notes as string} />}
        {(email || (phone && /[0-9]/.test(phone)) || website) && (
          <div
            className="flex flex-wrap gap-1.5 mt-auto"
            style={{ borderTop: "1px dashed var(--line-2)", paddingTop: 11 }}
          >
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-2.5 py-1.5 transition-colors"
                style={{ color: "var(--cream)", background: "var(--char-800)", border: "1px solid var(--line-2)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 6h18v12H3z" /><path d="M3 7l9 6 9-6" />
                </svg>
                Email
              </a>
            )}
            {phone && /[0-9]/.test(phone) && (
              <a
                href={`tel:${phone.replace(/[^+0-9]/g, "")}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-2.5 py-1.5 transition-colors"
                style={{ color: "var(--cream)", background: "var(--char-800)", border: "1px solid var(--line-2)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 4h4l2 5-3 2a12 12 0 005 5l2-3 5 2v4a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2z" />
                </svg>
                Call
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-2.5 py-1.5 transition-colors"
                style={{ color: "var(--cream)", background: "var(--char-800)", border: "1px solid var(--line-2)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 000 18M12 3a14 14 0 010 18" />
                </svg>
                Site
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ item, onEdit, onDelete }: { item: Record<string, unknown>; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const id = item.id as string;
  const statusColor = STATUS_COLORS[item.status as string] ?? "mute";
  const brochures = (item.brochures as ResourceLink[]) || [];

  return (
    <div
      className="group rounded-xl overflow-hidden flex flex-col transition-colors"
      style={{ background: "var(--char-850)", border: "1px solid var(--line)" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--line-2)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--line)")}
    >
      <div className="flex items-start gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="min-w-0 flex-1">
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cream-faint)", marginBottom: 4 }}>
            {(item.rev as string) || "Product"}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: "var(--cream)" }}>
            {item.name as string}
          </div>
        </div>
        <CardActions id={id} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {!!item.status && <Chip label={item.status as string} colorKey={statusColor} />}
        </div>
        <SpecRow label="Dimensions" value={item.dimensions as string} mono />
        <SpecRow label="Price band" value={item.priceBand as string} mono />
        <SpecRow label="Lead time" value={item.leadTime as string} mono />
        <SpecRow label="Finishes" value={item.finishes as string} />
        {!!item.specs && <NoteBlock label="Key specs" value={item.specs as string} />}
        {brochures.length > 0 && (
          <div className="flex flex-wrap gap-1.5" style={{ borderTop: "1px dashed var(--line-2)", paddingTop: 10 }}>
            {brochures.map((r, i) => (
              <a
                key={i}
                href={r.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-1.5 transition-colors"
                style={{ background: "var(--ember-tint)", color: "var(--ember)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M6 2h8l4 4v16H6z" /><path d="M14 2v4h4M9 13h6M9 17h6" />
                </svg>
                {r.label || r.type || "Resource"}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResearchCard({ item, onEdit, onDelete }: { item: Record<string, unknown>; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const id = item.id as string;
  const jurisdiction = item.jurisdiction as string;
  const link = item.link as string;

  return (
    <div
      className="group rounded-xl overflow-hidden flex flex-col transition-colors"
      style={{ background: "var(--char-850)", border: "1px solid var(--line)" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--line-2)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--line)")}
    >
      <div className="flex items-start gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="min-w-0 flex-1">
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cream-faint)", marginBottom: 4 }}>
            {(item.type as string) || "Research"}{jurisdiction ? ` · ${jurisdiction}` : ""}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: "var(--cream)" }}>
            {item.title as string}
          </div>
        </div>
        <CardActions id={id} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3 flex-1">
        {!!item.summary && <NoteBlock label="Finding" value={item.summary as string} />}
        <SpecRow label="Owner" value={(item.owner as string) || "—"} />
        <SpecRow label="Date" value={item.date as string} mono />
        {link && (
          <div className="flex gap-2 text-xs">
            <span className="flex-none min-w-[80px]" style={{ color: "var(--cream-faint)", fontSize: 11 }}>Source</span>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-xs"
              style={{ color: "var(--orange)" }}
            >
              Open ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ImprovementCard({ item, onEdit, onDelete }: { item: Record<string, unknown>; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const id = item.id as string;
  const statusColor = STATUS_COLORS[item.status as string] ?? "mute";

  return (
    <div
      className="group rounded-xl overflow-hidden flex flex-col transition-colors"
      style={{ background: "var(--char-850)", border: "1px solid var(--line)" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--line-2)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--line)")}
    >
      <div className="flex items-start gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="min-w-0 flex-1">
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cream-faint)", marginBottom: 4 }}>
            {(item.product as string) || "Improvement"}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: "var(--cream)" }}>
            {item.title as string}
          </div>
        </div>
        <CardActions id={id} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {!!item.status && <Chip label={item.status as string} colorKey={statusColor} />}
        </div>
        {!!item.impact && <NoteBlock label="Impact" value={item.impact as string} />}
        <SpecRow label="Owner" value={(item.owner as string) || "—"} />
        <SpecRow label="Logged" value={item.date as string} mono />
      </div>
    </div>
  );
}

function PlanCard({ item, onEdit, onDelete }: { item: Record<string, unknown>; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const id = item.id as string;
  const statusColor = STATUS_COLORS[item.status as string] ?? "mute";
  const includes = (item.includes as Record<string, boolean>) || {};

  return (
    <div
      className="group rounded-xl overflow-hidden flex flex-col transition-colors"
      style={{ background: "var(--char-850)", border: "1px solid var(--line)" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--line-2)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--line)")}
    >
      <div className="flex items-start gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="min-w-0 flex-1">
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cream-faint)", marginBottom: 4 }}>
            {(item.product as string) || "Plan set"}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: "var(--cream)" }}>
            {item.name as string}
          </div>
        </div>
        <CardActions id={id} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {!!item.status && <Chip label={item.status as string} colorKey={statusColor} />}
          {!!item.version && (
            <span className="chip" style={{ background: COLOR_MAP.ember.bg, color: COLOR_MAP.ember.text }}>
              {item.version as string}
            </span>
          )}
        </div>
        {/* Includes checklist */}
        <div className="flex flex-wrap gap-1.5">
          {INCLUDE_KEYS.map(([key, label]) => {
            const checked = !!includes[key];
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 text-xs"
                style={{ color: checked ? "var(--ok)" : "var(--cream-faint)", opacity: checked ? 1 : 0.6, textDecoration: checked ? "none" : "line-through" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {checked
                    ? <path d="M20 6L9 17l-5-5" />
                    : <path d="M6 6l12 12M18 6L6 18" />}
                </svg>
                {label}
              </span>
            );
          })}
        </div>
        {!!item.specs && <NoteBlock label="Build specs" value={item.specs as string} />}
        {!!item.cuts && (
          <div>
            <span
              className="block mb-1"
              style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cream-faint)" }}
            >
              Cut list
            </span>
            <div
              className="text-xs leading-relaxed whitespace-pre-wrap overflow-auto"
              style={{
                fontFamily: "var(--mono)",
                background: "var(--char-900)",
                border: "1px solid var(--line)",
                borderRadius: 7,
                padding: "9px 11px",
                maxHeight: 118,
                color: "var(--cream)",
                fontSize: 11.5,
              }}
            >
              {item.cuts as string}
            </div>
          </div>
        )}
        {!!item.notes && <NoteBlock label="Field note" value={item.notes as string} />}
      </div>
      {/* Footer */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ borderTop: "1px solid var(--line)", background: "var(--char-900)", fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--cream-faint)" }}
      >
        <span>{item.date as string}</span>
        <span className="flex-1" />
        <button
          className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-2.5 py-1.5 transition-colors"
          style={{ color: "var(--ember)", background: "transparent", border: "1px solid var(--line-2)", fontFamily: "var(--sans)" }}
          onClick={() => window.print()}
          title="Print build sheet"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2h8l4 4v16H6z" /><path d="M14 2v4h4M9 13h6M9 17h6" />
          </svg>
          Build sheet
        </button>
      </div>
    </div>
  );
}

function ResourceCard({ item, onEdit, onDelete }: { item: Record<string, unknown>; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const id = item.id as string;
  const url = item.url as string;

  return (
    <div
      className="group rounded-xl overflow-hidden flex flex-col transition-colors"
      style={{ background: "var(--char-850)", border: "1px solid var(--line)" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--line-2)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--line)")}
    >
      <div className="flex items-start gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="min-w-0 flex-1">
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cream-faint)", marginBottom: 4 }}>
            {(item.type as string) || "Resource"}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: "var(--cream)" }}>
            {item.label as string}
          </div>
        </div>
        <CardActions id={id} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3 flex-1">
        {!!item.note && <NoteBlock label="" value={item.note as string} />}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-start text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors"
            style={{ background: "var(--orange)", color: "#fff" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Open ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default function HubCard({ item, sectionId, onEdit, onDelete }: HubCardProps) {
  switch (sectionId) {
    case "suppliers":
      return <SupplierCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    case "products":
      return <ProductCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    case "research":
      return <ResearchCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    case "improvements":
      return <ImprovementCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    case "plans":
      return <PlanCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    case "resources":
      return <ResourceCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    default:
      return null;
  }
}
