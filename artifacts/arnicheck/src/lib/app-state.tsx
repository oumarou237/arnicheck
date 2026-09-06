import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Verdict = "danger" | "caution" | "safe";

export type Scan = {
  id: string;
  message: string;
  mode?: "message" | "link";
  riskScore?: number;
  verdict: Verdict;
  signals: string[];
  createdAt: string;
};

export type Badge = {
  id: "premier-scan" | "protecteur-famille" | "arnaques-evitees";
  label: string;
  detail: string;
  unlocked: boolean;
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
  streak: number;
  badges: Badge[];
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

function localDay(date = new Date()) {
  return new Intl.DateTimeFormat("fr-CA").format(date);
}

function dayDifference(from: string, to: string) {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [scans, setScans] = useState<Scan[]>(() => storage.get("arnicheck-scans", []));
  const [relatives, setRelatives] = useState<Relative[]>(() => storage.get("arnicheck-relatives", []));
  const [alerts, setAlerts] = useState<FamilyAlert[]>(() => storage.get("arnicheck-alerts", []));
  const [isPremium, setIsPremium] = useState<boolean>(() => storage.get("arnicheck-premium", false));
  const [streakData, setStreakData] = useState<{ count: number; lastDay: string | null }>(() =>
    storage.get("arnicheck-streak", { count: 0, lastDay: null }),
  );

  useEffect(() => storage.set("arnicheck-scans", scans), [scans]);
  useEffect(() => storage.set("arnicheck-relatives", relatives), [relatives]);
  useEffect(() => storage.set("arnicheck-alerts", alerts), [alerts]);
  useEffect(() => storage.set("arnicheck-premium", isPremium), [isPremium]);
  useEffect(() => storage.set("arnicheck-streak", streakData), [streakData]);

  const monthlyCount = useMemo(
    () => scans.filter((scan) => currentMonth(new Date(scan.createdAt)) === currentMonth()).length,
    [scans],
  );

  const badges = useMemo<Badge[]>(() => [
    { id: "premier-scan", label: "Premier scan", detail: "Vous avez pris le temps de vérifier.", unlocked: scans.length >= 1 },
    { id: "protecteur-famille", label: "Protecteur de la famille", detail: "Votre cercle de confiance est ouvert.", unlocked: relatives.length >= 1 },
    { id: "arnaques-evitees", label: "10 arnaques évitées", detail: "Dix messages à risque repérés ensemble.", unlocked: scans.filter((scan) => scan.verdict === "danger").length >= 10 },
  ], [relatives.length, scans]);

  const value = useMemo<AppStateValue>(
    () => ({
      scans,
      relatives,
      alerts,
      isPremium,
      monthlyCount,
      streak: streakData.count,
      badges,
      addScan: (scan) => {
        const now = new Date();
        const today = localDay(now);
        setStreakData((currentStreak) => {
          if (currentStreak.lastDay === today) return currentStreak;
          const nextCount = currentStreak.lastDay && dayDifference(currentStreak.lastDay, today) === 1
            ? currentStreak.count + 1
            : 1;
          return { count: nextCount, lastDay: today };
        });
        setScans((current) => [{ ...scan, id: crypto.randomUUID(), createdAt: now.toISOString() }, ...current]);
      },
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
    [alerts, badges, isPremium, monthlyCount, relatives, scans, streakData.count],
  );

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) throw new Error("useAppState doit être utilisé dans AppStateProvider");
  return context;
}