import { Check, ChevronRight, CircleAlert, Clock3, Info, ShieldCheck } from "lucide-react";
import type { Verdict } from "@/lib/app-state";

export const verdictContent: Record<Verdict, { label: string; title: string; description: string }> = {
  danger: {
    label: "Message à risque",
    title: "Mieux vaut ne pas cliquer.",
    description: "Plusieurs signaux ressemblent à une tentative d’arnaque. Prenez votre temps : ne répondez pas et ne transmettez aucune information.",
  },
  caution: {
    label: "Message à vérifier",
    title: "Un petit doute est bienvenu.",
    description: "Ce message contient des éléments inhabituels. Vérifiez son origine par un autre moyen avant d’agir.",
  },
  safe: {
    label: "Rien d’alarmant",
    title: "Ce message semble fiable.",
    description: "Nous n’avons pas repéré de signal inquiétant. Gardez tout de même vos bonnes habitudes en ligne.",
  },
};

export function VerdictIcon({ verdict, size = 24 }: { verdict: Verdict; size?: number }) {
  if (verdict === "safe") return <ShieldCheck size={size} />;
  if (verdict === "caution") return <Info size={size} />;
  return <CircleAlert size={size} />;
}

export function VerdictBadge({ verdict, compact = false }: { verdict: Verdict; compact?: boolean }) {
  return (
    <span className={`verdict-badge verdict-${verdict} ${compact ? "verdict-badge-compact" : ""}`} data-testid={`status-verdict-${verdict}`}>
      <VerdictIcon verdict={verdict} size={compact ? 13 : 15} />
      {verdictContent[verdict].label}
    </span>
  );
}

export function SignalRow({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <div className="signal-row" style={{ animationDelay: `${index * 80}ms` }} data-testid={`signal-row-${index}`}>
      <span className="signal-check"><Check size={13} strokeWidth={3} /></span>
      <span>{children}</span>
      <ChevronRight size={15} className="signal-chevron" />
    </div>
  );
}

export function RelativeAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <span className="relative-avatar" aria-hidden="true">{initials || "?"}</span>;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    .format(new Date(date))
    .replace(":", "h");
}

export function DateLabel({ date }: { date: string }) {
  return <span className="date-label"><Clock3 size={13} /> {formatDate(date)}</span>;
}