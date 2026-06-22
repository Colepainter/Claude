"use client";

import { useState } from "react";
import { SECTIONS, INCLUDE_KEYS, RES_TYPES } from "@/lib/constants";
import { FieldDef, ResourceLink } from "@/lib/types";
import { genId } from "@/lib/helpers";

interface HubFormProps {
  sectionId: string;
  initialData?: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

// Short keys that render in 2-column layout
const SHORT_KEYS = new Set([
  "status", "role", "supplyType", "rev", "version", "date", "priceBand",
  "dimensions", "jurisdiction", "owner", "product", "type", "leadTime",
  "email", "phone", "website", "contactName",
]);

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  border: "1px solid var(--line-2)",
  borderRadius: 8,
  background: "var(--char-900)",
  color: "var(--cream)",
  fontSize: 14,
  fontFamily: "var(--sans)",
  outline: "none",
  transition: "border-color 0.15s",
};

const monoStyle: React.CSSProperties = {
  ...inputStyle,
  fontFamily: "var(--mono)",
  fontSize: 13,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 600,
  color: "var(--cream-dim)",
  marginBottom: 5,
  letterSpacing: "0.01em",
};

function Field({ field, value, onChange }: {
  field: FieldDef;
  value: unknown;
  onChange: (key: string, val: unknown) => void;
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = focused ? "var(--orange)" : "var(--line-2)";

  if (field.type === "textarea") {
    return (
      <div>
        <label style={labelStyle}>
          {field.label}{field.req ? " *" : ""}
        </label>
        <textarea
          value={(value as string) ?? ""}
          placeholder={field.ph}
          onChange={e => onChange(field.key, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={3}
          style={{
            ...(field.mono ? monoStyle : inputStyle),
            borderColor,
            resize: "vertical",
            minHeight: 64,
            lineHeight: 1.5,
          }}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <label style={labelStyle}>
          {field.label}{field.req ? " *" : ""}
        </label>
        <select
          value={(value as string) ?? ""}
          onChange={e => onChange(field.key, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...inputStyle, borderColor }}
        >
          {(field.opts ?? []).map(opt => (
            <option key={opt} value={opt} style={{ background: "#1b1814", color: "#f4ede2" }}>
              {opt || "—"}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "includes") {
    const val = (value as Record<string, boolean>) ?? {};
    return (
      <div>
        <label style={labelStyle}>{field.label}</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {INCLUDE_KEYS.map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2"
              style={{
                fontSize: 13,
                border: "1px solid var(--line-2)",
                background: "var(--char-900)",
                color: "var(--cream)",
              }}
            >
              <input
                type="checkbox"
                checked={!!val[key]}
                onChange={e => onChange(field.key, { ...val, [key]: e.target.checked })}
                style={{ accentColor: "var(--orange)" }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "reslist") {
    const arr = (value as ResourceLink[]) ?? [];
    const update = (newArr: ResourceLink[]) => onChange(field.key, newArr);
    return (
      <div>
        <label style={labelStyle}>{field.label}</label>
        <div className="flex flex-col gap-2 mb-2">
          {arr.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 110px 1.3fr auto", gap: 6, alignItems: "center" }}>
              <input
                value={r.label ?? ""}
                placeholder="Label"
                onChange={e => {
                  const next = [...arr];
                  next[i] = { ...next[i], label: e.target.value };
                  update(next);
                }}
                style={{ ...inputStyle, padding: "7px 9px", fontSize: 12.5 }}
              />
              <select
                value={r.type ?? RES_TYPES[0]}
                onChange={e => {
                  const next = [...arr];
                  next[i] = { ...next[i], type: e.target.value };
                  update(next);
                }}
                style={{ ...inputStyle, padding: "7px 9px", fontSize: 12.5 }}
              >
                {RES_TYPES.map(t => (
                  <option key={t} value={t} style={{ background: "#1b1814", color: "#f4ede2" }}>{t}</option>
                ))}
              </select>
              <input
                value={r.url ?? ""}
                placeholder="https://…"
                onChange={e => {
                  const next = [...arr];
                  next[i] = { ...next[i], url: e.target.value };
                  update(next);
                }}
                style={{ ...monoStyle, padding: "7px 9px", fontSize: 12.5 }}
              />
              <button
                type="button"
                onClick={() => update(arr.filter((_, j) => j !== i))}
                title="Remove"
                className="flex items-center justify-center rounded-lg transition-colors"
                style={{
                  width: 30,
                  height: 30,
                  border: "1px solid var(--line-2)",
                  color: "var(--cream-faint)",
                  fontSize: 18,
                  lineHeight: 1,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update([...arr, { label: "", type: RES_TYPES[0], url: "" }])}
          className="text-xs font-semibold rounded-lg px-3 py-2 transition-colors"
          style={{
            color: "var(--ember)",
            border: "1px dashed var(--ember)",
            background: "var(--ember-tint)",
            cursor: "pointer",
          }}
        >
          + Add {field.addLabel || "resource"}
        </button>
      </div>
    );
  }

  // Default: text input
  return (
    <div>
      <label style={labelStyle}>
        {field.label}{field.req ? " *" : ""}
      </label>
      <input
        type="text"
        value={(value as string) ?? ""}
        placeholder={field.ph}
        onChange={e => onChange(field.key, e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...(field.mono ? monoStyle : inputStyle),
          borderColor,
        }}
      />
    </div>
  );
}

export default function HubForm({ sectionId, initialData, onSave, onCancel }: HubFormProps) {
  const section = SECTIONS.find(s => s.id === sectionId);
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData ?? {});

  if (!section) return null;

  const handleChange = (key: string, val: unknown) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    const titleVal = formData[section.titleField];
    if (!titleVal || String(titleVal).trim() === "") return;
    onSave({ ...formData, id: formData.id ?? genId(), _u: Date.now() });
  };

  // Build field groups: SHORT keys go in pairs (2-col), others get full width
  const groups: Array<{ wide: false; fields: FieldDef[] } | { wide: true; field: FieldDef }> = [];
  let buf: FieldDef[] = [];

  for (const f of section.fields) {
    const short = (f.type === "text" || f.type === "select") && SHORT_KEYS.has(f.key);
    if (short) {
      buf.push(f);
      if (buf.length === 2) {
        groups.push({ wide: false, fields: [...buf] });
        buf = [];
      }
    } else {
      if (buf.length) {
        groups.push({ wide: false, fields: [...buf] });
        buf = [];
      }
      groups.push({ wide: true, field: f });
    }
  }
  if (buf.length) groups.push({ wide: false, fields: [...buf] });

  return (
    <div>
      <div className="flex flex-col gap-3.5 px-6 py-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
        {groups.map((g, gi) => {
          if (!g.wide) {
            return (
              <div key={gi} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {g.fields.map(f => (
                  <Field key={f.key} field={f} value={formData[f.key]} onChange={handleChange} />
                ))}
              </div>
            );
          }
          return (
            <Field key={g.field.key} field={g.field} value={formData[g.field.key]} onChange={handleChange} />
          );
        })}
      </div>
      <div
        className="flex items-center gap-2.5 px-6 py-4"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ color: "var(--cream-dim)", border: "1px solid var(--line-2)", background: "transparent" }}
        >
          Cancel
        </button>
        <span className="flex-1" />
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: "var(--orange)", color: "#fff" }}
        >
          Save entry
        </button>
      </div>
    </div>
  );
}
