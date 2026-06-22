"use client";

import { useState, useMemo } from "react";
import { SECTIONS } from "@/lib/constants";
import HubCard from "./HubCard";
import HubForm from "./HubForm";

interface HubSectionProps {
  sectionId: Exclude<import("@/lib/types").SectionId, "pipeline">;
  items: Record<string, unknown>[];
  searchQuery: string;
  onUpdate: (items: Record<string, unknown>[]) => void;
  onToast: (msg: string) => void;
}

// Icon paths per section (from the reference HTML)
const SECTION_ICONS: Record<string, string> = {
  suppliers: '<path d="M3 7h11v8H3z"/><path d="M14 10h4l3 3v2h-7z"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/>',
  products: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
  research: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3"/>',
  improvements: '<path d="M3 17l5-5 4 4 8-9"/><path d="M15 7h5v5"/>',
  plans: '<path d="M5 3h9l5 5v13H5z"/><path d="M14 3v5h5"/><path d="M8 13h7M8 17h7M8 9h2"/>',
  resources: '<path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
  campaigns: '<path d="M3 11l19-9-9 19-2-8z"/>',
  events: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  content: '<path d="M12 19l7-7 3 3-7 7H12v-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18"/>',
  testimonials: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.7-2-2-2H6c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h2c1.25 0 2-.5 2-2"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.7-2-2-2h-2c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h2c1.25 0 2-.5 2-2"/>',
  webPresence: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>',
  projects: '<path d="M2 20a2 2 0 002 2h16a2 2 0 002-2V8l-7 5V8l-7 5V4a2 2 0 00-2-2H4a2 2 0 00-2 2z"/>',
  customers: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
  finance: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
};

function SectionIcon({ sectionId }: { sectionId: string }) {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      style={{ color: "var(--cream-faint)" }}
      dangerouslySetInnerHTML={{ __html: SECTION_ICONS[sectionId] ?? "" }}
    />
  );
}

interface ModalProps {
  title: string;
  kicker: string;
  children: React.ReactNode;
  onClose: () => void;
}

function Modal({ title, kicker, children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{ background: "rgba(22,20,15,0.72)", backdropFilter: "blur(2px)", padding: "40px 20px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full flex flex-col rounded-2xl overflow-hidden"
        style={{
          maxWidth: 560,
          maxHeight: "calc(100vh - 80px)",
          background: "var(--char-850)",
          border: "1px solid var(--line-2)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--line)" }}
        >
          <div>
            <span
              style={{
                display: "block",
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--ember)",
                marginBottom: 2,
              }}
            >
              {kicker}
            </span>
            <h2 style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 18, color: "var(--cream)" }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--cream-dim)" }}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function HubSection({ sectionId, items, searchQuery, onUpdate, onToast }: HubSectionProps) {
  const [editId, setEditId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const section = SECTIONS.find(s => s.id === sectionId);
  if (!section) return null;

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      Object.values(item).some(v => {
        if (typeof v === "string") return v.toLowerCase().includes(q);
        if (typeof v === "object" && v !== null) return JSON.stringify(v).toLowerCase().includes(q);
        return false;
      })
    );
  }, [items, searchQuery]);

  const editItem = editId ? items.find(i => i.id === editId) : undefined;

  const handleSave = (data: Record<string, unknown>) => {
    if (editId) {
      onUpdate(items.map(i => (i.id === editId ? { ...i, ...data } : i)));
      onToast("Updated");
    } else {
      onUpdate([data, ...items]);
      onToast("Added");
    }
    setEditId(null);
    setAddOpen(false);
  };

  const handleDelete = (id: string) => {
    const item = items.find(i => i.id === id);
    const name = item ? String(item[section.titleField] ?? "this entry") : "this entry";
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    onUpdate(items.filter(i => i.id !== id));
    onToast("Deleted");
  };

  const handleEdit = (id: string) => {
    setEditId(id);
    setAddOpen(false);
  };

  const openAdd = () => {
    setEditId(null);
    setAddOpen(true);
  };

  const closeModal = () => {
    setEditId(null);
    setAddOpen(false);
  };

  const isModalOpen = addOpen || !!editId;

  return (
    <div>
      {/* Section lede */}
      <div className="mb-4">
        <p style={{ fontSize: 13, color: "var(--cream-dim)", maxWidth: "64ch" }}>
          {section.lede}
        </p>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 px-5" style={{ color: "var(--cream-dim)" }}>
          <div className="flex justify-center mb-4">
            <SectionIcon sectionId={sectionId} />
          </div>
          <h3
            style={{
              fontFamily: "var(--display)",
              fontWeight: 600,
              fontSize: 18,
              color: "var(--cream)",
              marginBottom: 6,
            }}
          >
            {searchQuery ? "No matches" : "Nothing here yet"}
          </h3>
          <p style={{ fontSize: 13.5, maxWidth: "40ch", margin: "0 auto 18px" }}>
            {searchQuery ? "Try a different search term." : section.lede}
          </p>
          {!searchQuery && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: "var(--orange)", color: "#fff" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add the first one
            </button>
          )}
        </div>
      )}

      {/* Card grid */}
      {filtered.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map(item => (
            <HubCard
              key={item.id as string}
              item={item}
              sectionId={sectionId}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <Modal
          kicker={section.title}
          title={editId ? "Edit entry" : "New entry"}
          onClose={closeModal}
        >
          <HubForm
            sectionId={sectionId}
            initialData={editItem}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}
