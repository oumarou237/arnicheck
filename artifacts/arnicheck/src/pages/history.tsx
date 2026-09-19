import { Link } from "wouter";
import { ArrowRight, History, Search, SearchCheck, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionKicker, UpgradeCard } from "@/components/shell";
import { DateLabel, VerdictBadge } from "@/components/ui";
import { useAppState } from "@/lib/app-state";

function excerpt(message: string) {
  return message.length > 92 ? `${message.slice(0, 92).trim()}…` : message;
}

function modeLabel(mode?: "message" | "link" | "call") {
  if (mode === "link") return "Lien";
  if (mode === "call") return "Appel";
  return "Message";
}

export default function HistoryPage() {
  const { scans, isPremium } = useAppState();
  const [query, setQuery] = useState("");
  const filteredScans = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    if (!normalized) return scans;
    return scans.filter((scan) => `${scan.message} ${modeLabel(scan.mode)}`.toLocaleLowerCase("fr").includes(normalized));
  }, [query, scans]);
  return (
    <div className="page-stack history-page">
      <div className="page-heading">
        <SectionKicker><span className="kicker-dot" /> Votre mémoire locale</SectionKicker>
        <h1>Vos vérifications,<br /><em>au même endroit.</em></h1>
        <p>Un petit historique pour retrouver un résultat et en reparler avec vos proches.</p>
      </div>
      <div className="history-summary">
        <div className="summary-icon"><History size={20} /></div>
        <div><strong>{scans.length} vérification{scans.length > 1 ? "s" : ""}</strong><span>conservée{scans.length > 1 ? "s" : ""} sur cet appareil</span></div>
        <div className="summary-lock"><ShieldCheck size={16} /> Privé</div>
      </div>
      {scans.length === 0 ? (
        <div className="history-empty" data-testid="empty-history">
          <div className="history-empty-mark"><SearchCheck size={28} /></div>
          <h2>Votre historique est tranquille.</h2>
          <p>Les messages que vous vérifierez apparaîtront ici. C’est pratique pour suivre un doute ou rassurer quelqu’un.</p>
          <Link href="/" className="button-primary empty-action" data-testid="link-start-analysis"><SearchCheck size={17} /> Vérifier un message</Link>
        </div>
      ) : (
        <section className="history-list" data-testid="list-scan-history">
          <label className="history-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Rechercher dans l’historique</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un message ou un mode…" aria-label="Rechercher dans l’historique" data-testid="input-history-search" />
            {query && <button type="button" className="history-search-clear" onClick={() => setQuery("")} aria-label="Effacer la recherche" data-testid="button-clear-history-search">Effacer</button>}
          </label>
          <div className="list-heading"><span>RÉSULTATS RÉCENTS</span><span>{filteredScans.length} élément{filteredScans.length > 1 ? "s" : ""}</span></div>
          {filteredScans.length === 0 ? (
            <div className="history-no-match" data-testid="empty-history-search">
              <div className="history-empty-mark"><Search size={24} /></div>
              <h2>Aucun résultat pour cette recherche.</h2>
              <p>Essayez un autre mot, comme « lien », « appel » ou un terme du message.</p>
              <button type="button" className="button-quiet" onClick={() => setQuery("")} data-testid="button-reset-history-search">Voir tout l’historique</button>
            </div>
          ) : filteredScans.map((scan) => (
            <article key={scan.id} className={`history-item history-item-${scan.verdict}`} data-testid={`card-history-${scan.id}`}>
              <div className="history-item-marker"><span /></div>
              <div className="history-item-content"><div className="history-item-top"><VerdictBadge verdict={scan.verdict} compact /><span className="history-mode-label">{modeLabel(scan.mode)}</span><DateLabel date={scan.createdAt} /></div><p>{excerpt(scan.message)}</p><span className="history-signal-count">{scan.signals.length} signal{scan.signals.length > 1 ? "s" : ""} relevé{scan.signals.length > 1 ? "s" : ""}</span></div>
              <ArrowRight size={17} className="history-arrow" />
            </article>
          ))}
        </section>
      )}
      {!isPremium && <UpgradeCard />}
    </div>
  );
}