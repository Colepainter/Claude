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
  const id = s(item.id);
  const name = s(item.name);
  const category = s(item.category);
  const role = s(item.role);
  const status = s(item.status);
  const supplyType = s(item.supplyType);
  const leadTime = s(item.leadTime);
  const contactName = s(item.contactName);
  const supplies = s(item.supplies);
  const notes = s(item.notes);
  const email = s(item.email);
  const phone = s(item.phone);
  const website = s(item.website);
  const roleColor = ROLE_COLORS[role] ?? "mute";
  const statusColor = STATUS_COLORS[status] ?? "mute";

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
            {category || role || "Supplier"}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: "var(--cream)" }}>
            {name}
          </div>
        </div>
        <CardActions id={id} onEdit={onEdit} onDelete={onDelete} />
      </div>
      {/* Body */}
      <div className="flex flex-col gap-2.5 px-4 py-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {role && <Chip label={role} colorKey={roleColor} />}
          {status && <Chip label={status} colorKey={statusColor} />}
          {supplyType && (
            <span
              className="chip"
              style={{ background: "transparent", color: "var(--cream-dim)", border: "1px solid var(--line-2)" }}
            >
              {supplyType}
            </span>
          )}
        </div>
        <SpecRow label="Lead time" value={leadTime} mono />
        {contactName && <SpecRow label="Contact" value={contactName} />}
        {supplies && <NoteBlock label="Details" value={supplies} />}
        {notes && <NoteBlock label="Notes" value={notes} />}
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
  const id = s(item.id);
  const name = s(item.name);
  const rev = s(item.rev);
  const status = s(item.status);
  const dimensions = s(item.dimensions);
  const priceBand = s(item.priceBand);
  const leadTime = s(item.leadTime);
  const finishes = s(item.finishes);
  const specs = s(item.specs);
  const brochures = (item.brochures as ResourceLink[]) || [];
  const statusColor = STATUS_COLORS[status] ?? "mute";

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
            {rev || "Product"}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: "var(--cream)" }}>
            {name}
          </div>
        </div>
        <CardActions id={id} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {status && <Chip label={status} colorKey={statusColor} />}
        </div>
        <SpecRow label="Dimensions" value={dimensions} mono />
        <SpecRow label="Price band" value={priceBand} mono />
        <SpecRow label="Lead time" value={leadTime} mono />
        <SpecRow label="Finishes" value={finishes} />
        {specs && <NoteBlock label="Key specs" value={specs} />}
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
  const id = s(item.id);
  const title = s(item.title);
  const type = s(item.type);
  const jurisdiction = s(item.jurisdiction);
  const summary = s(item.summary);
  const owner = s(item.owner);
  const date = s(item.date);
  const link = s(item.link);

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
            {type || "Research"}{jurisdiction ? ` · ${jurisdiction}` : ""}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: "var(--cream)" }}>
            {title}
          </div>
        </div>
        <CardActions id={id} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3 flex-1">
        {summary && <NoteBlock label="Finding" value={summary} />}
        <SpecRow label="Owner" value={owner || "—"} />
        <SpecRow label="Date" value={date} mono />
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
  const id = s(item.id);
  const title = s(item.title);
  const product = s(item.product);
  const status = s(item.status);
  const impact = s(item.impact);
  const owner = s(item.owner);
  const date = s(item.date);
  const statusColor = STATUS_COLORS[status] ?? "mute";

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
            {product || "Improvement"}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: "var(--cream)" }}>
            {title}
          </div>
        </div>
        <CardActions id={id} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {status && <Chip label={status} colorKey={statusColor} />}
        </div>
        {impact && <NoteBlock label="Impact" value={impact} />}
        <SpecRow label="Owner" value={owner || "—"} />
        <SpecRow label="Logged" value={date} mono />
      </div>
    </div>
  );
}

function PlanCard({ item, onEdit, onDelete }: { item: Record<string, unknown>; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const id = s(item.id);
  const name = s(item.name);
  const product = s(item.product);
  const version = s(item.version);
  const date = s(item.date);
  const status = s(item.status);
  const specs = s(item.specs);
  const cuts = s(item.cuts);
  const notes = s(item.notes);
  const includes = (item.includes as Record<string, boolean>) || {};
  const statusColor = STATUS_COLORS[status] ?? "mute";

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
            {product || "Plan set"}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: "var(--cream)" }}>
            {name}
          </div>
        </div>
        <CardActions id={id} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {status && <Chip label={status} colorKey={statusColor} />}
          {version && (
            <span className="chip" style={{ background: COLOR_MAP.ember.bg, color: COLOR_MAP.ember.text }}>
              {version}
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
        {specs && <NoteBlock label="Build specs" value={specs} />}
        {cuts && (
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
              {cuts}
            </div>
          </div>
        )}
        {notes && <NoteBlock label="Field note" value={notes} />}
      </div>
      {/* Footer */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ borderTop: "1px solid var(--line)", background: "var(--char-900)", fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--cream-faint)" }}
      >
        <span>{date}</span>
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
  const id = s(item.id);
  const label = s(item.label);
  const type = s(item.type);
  const url = s(item.url);
  const note = s(item.note);

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
            {type || "Resource"}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: "var(--cream)" }}>
            {label}
          </div>
        </div>
        <CardActions id={id} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3 flex-1">
        {note && <NoteBlock label="" value={note} />}
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
