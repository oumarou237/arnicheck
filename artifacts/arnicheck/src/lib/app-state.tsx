import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Verdict = "danger" | "caution" | "safe";

export type Scan = {
  id: string;
  message: string;
  verdict: Verdict;
  signals: string[];
  createdAt: string;
};

export type Relative = {
  id: string;
  name: string;
  relation: string;
  createdAt: string;
};

export type FamilyAlert = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  kind: "relay" | "scan";
};

type AppStateValue = {
  scans: Scan[];
  relatives: Relative[];
  alerts: FamilyAlert[];
  isPremium: boolean;
  monthlyCount: number;
  addScan: (scan: Omit<Scan, "id" | "createdAt">) => void;
  addRelative: (relative: Omit<Relative, "id" | "createdAt">) => void;
  removeRelative: (id: string) => void;
  togglePremium: () => void;
  addAlert: (alert: Omit<FamilyAlert, "id" | "createdAt">) => void;
};

const StateContext = createContext<AppStateValue | null>(null);

const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private browsing can deny storage; the in-memory state still works.
    }
  },
};

function currentMonth(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [scans, setScans] = useState<Scan[]>(() => storage.get("arnicheck-scans", []));
  const [relatives, setRelatives] = useState<Relative[]>(() => storage.get("arnicheck-relatives", []));
  const [alerts, setAlerts] = useState<FamilyAlert[]>(() => storage.get("arnicheck-alerts", []));
  const [isPremium, setIsPremium] = useState<boolean>(() => storage.get("arnicheck-premium", false));

  useEffect(() => storage.set("arnicheck-scans", scans), [scans]);
  useEffect(() => storage.set("arnicheck-relatives", relatives), [relatives]);
  useEffect(() => storage.set("arnicheck-alerts", alerts), [alerts]);
  useEffect(() => storage.set("arnicheck-premium", isPremium), [isPremium]);

  const monthlyCount = useMemo(
    () => scans.filter((scan) => currentMonth(new Date(scan.createdAt)) === currentMonth()).length,
    [scans],
  );

  const value = useMemo<AppStateValue>(
    () => ({
      scans,
      relatives,
      alerts,
      isPremium,
      monthlyCount,
      addScan: (scan) =>
        setScans((current) => [{ ...scan, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current]),
      addRelative: (relative) =>
        setRelatives((current) => [
          ...current,
          { ...relative, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
        ]),
      removeRelative: (id) => setRelatives((current) => current.filter((relative) => relative.id !== id)),
      togglePremium: () => setIsPremium((current) => !current),
      addAlert: (alert) =>
        setAlerts((current) => [{ ...alert, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current]),
    }),
    [alerts, isPremium, monthlyCount, relatives, scans],
  );

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) throw new Error("useAppState doit être utilisé dans AppStateProvider");
  return context;
}