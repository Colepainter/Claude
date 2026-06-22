"use client";

import { useState, useEffect, useCallback } from "react";
import { SectionId, HubData, SalesData, Deal } from "@/lib/types";
import { loadHubData, saveHubData, loadSalesData, saveSalesData, exportBackup } from "@/lib/storage";
import { SEED_HUB, SEED_DEALS } from "@/lib/seed";
import { genId, todayISO } from "@/lib/helpers";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import Toast from "@/components/ui/Toast";
import Pipeline from "@/components/pipeline/Pipeline";
import HubSection from "@/components/hub/HubSection";

const EMPTY_HUB: HubData = {
  suppliers: [],
  products: [],
  research: [],
  improvements: [],
  plans: [],
  resources: [],
  campaigns: [],
  events: [],
  content: [],
  testimonials: [],
  webPresence: [],
  projects: [],
  customers: [],
  finance: [],
};

const EMPTY_SALES: SalesData = {
  deals: [],
  lastSync: null,
};

export default function FounderHub() {
  const [currentSection, setCurrentSection] = useState<SectionId>("pipeline");
  const [hubData, setHubData] = useState<HubData>(EMPTY_HUB);
  const [salesData, setSalesData] = useState<SalesData>(EMPTY_SALES);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const hub = loadHubData();
    const sales = loadSalesData();

    if (hub) {
      setHubData(hub);
    } else {
      // Seed initial data
      setHubData(SEED_HUB);
    }

    if (sales) {
      setSalesData(sales);
    } else {
      setSalesData({ deals: SEED_DEALS, lastSync: null });
    }

    setMounted(true);
  }, []);

  // Persist hubData on change (after mount)
  useEffect(() => {
    if (mounted) {
      saveHubData(hubData);
    }
  }, [hubData, mounted]);

  // Persist salesData on change (after mount)
  useEffect(() => {
    if (mounted) {
      saveSalesData(salesData);
    }
  }, [salesData, mounted]);

  // Toast helper
  const ping = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  // Generic hub section updater
  const updateHubSection = useCallback((sectionId: keyof HubData, items: HubData[keyof HubData]) => {
    setHubData(prev => ({
      ...prev,
      [sectionId]: items,
    }));
  }, []);

  // Deals updater
  const updateDeals = useCallback((deals: Deal[]) => {
    setSalesData(prev => ({ ...prev, deals }));
  }, []);

  const handleUpdateDeal = useCallback((id: string, patch: Partial<Deal>) => {
    setSalesData(prev => ({
      ...prev,
      deals: prev.deals.map(d => d.id === id ? { ...d, ...patch } : d),
    }));
  }, []);

  const handleAddDeal = useCallback((deal: Omit<Deal, 'id'>) => {
    setSalesData(prev => ({
      ...prev,
      deals: [{ ...deal, id: genId() } as Deal, ...prev.deals],
    }));
  }, []);

  const handleDeleteDeal = useCallback((id: string) => {
    setSalesData(prev => ({
      ...prev,
      deals: prev.deals.filter(d => d.id !== id),
    }));
  }, []);

  const handleAdd = useCallback(() => {
    // Pipeline has its own add button; hub sections handle add internally
  }, []);

  // Handle export
  const handleExport = useCallback(() => {
    exportBackup(hubData, salesData);
    ping("Backup exported.");
  }, [hubData, salesData, ping]);

  // Clear search on section change
  const handleNavigate = useCallback((section: SectionId) => {
    setCurrentSection(section);
    setSearchQuery("");
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--char-900)", color: "var(--cream)" }}
    >
      <Sidebar
        currentSection={currentSection}
        onNavigate={handleNavigate}
        hubData={hubData}
        dealCount={salesData.deals.length}
        onExport={handleExport}
      />

      {/* Mobile nav — shown only on small screens */}
      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden z-30 flex items-center justify-around px-2 py-2"
        style={{
          background: "var(--char-850)",
          borderTop: "1px solid var(--line)",
        }}
      >
        {(["pipeline", "suppliers", "projects", "campaigns", "finance"] as SectionId[]).map(id => (
          <button
            key={id}
            onClick={() => handleNavigate(id)}
            className="flex flex-col items-center gap-0.5 px-2 py-1"
            style={{ color: currentSection === id ? "var(--orange)" : "var(--cream-dim)" }}
          >
            <span
              className="text-xs capitalize"
              style={{ fontFamily: "var(--mono)", fontSize: "10px", fontWeight: 500 }}
            >
              {id === "campaigns" ? "Mktg" : id.charAt(0).toUpperCase() + id.slice(1)}
            </span>
          </button>
        ))}
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          section={currentSection}
          onAdd={handleAdd}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto">
          {currentSection === "pipeline" ? (
            <Pipeline
              deals={salesData.deals}
              onUpdateDeal={handleUpdateDeal}
              onAddDeal={handleAddDeal}
              onDeleteDeal={handleDeleteDeal}
              onToast={ping}
            />
          ) : (
            <div className="p-6">
              <HubSection
                sectionId={currentSection as Exclude<SectionId, 'pipeline'>}
                items={hubData[currentSection as keyof HubData] as unknown as Record<string, unknown>[]}
                searchQuery={searchQuery}
                onUpdate={(items) => updateHubSection(currentSection as keyof HubData, items as unknown as HubData[keyof HubData])}
                onToast={ping}
              />
            </div>
          )}
        </div>
      </main>

      {toast && <Toast message={toast} />}
    </div>
  );
}
