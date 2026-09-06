import { Link } from "wouter";
import { ArrowRight, History, SearchCheck, ShieldCheck } from "lucide-react";
import { SectionKicker, UpgradeCard } from "@/components/shell";
import { DateLabel, VerdictBadge } from "@/components/ui";
import { useAppState } from "@/lib/app-state";

function excerpt(message: string) {
  return message.length > 92 ? `${message.slice(0, 92).trim()}…` : message;
}

export default function HistoryPage() {
  const { scans, isPremium } = useAppState();
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
          <div className="list-heading"><span>RÉSULTATS RÉCENTS</span><span>{scans.length} élément{scans.length > 1 ? "s" : ""}</span></div>
          {scans.map((scan) => (
            <article key={scan.id} className={`history-item history-item-${scan.verdict}`} data-testid={`card-history-${scan.id}`}>
              <div className="history-item-marker"><span /></div>
              <div className="history-item-content"><div className="history-item-top"><VerdictBadge verdict={scan.verdict} compact /><DateLabel date={scan.createdAt} /></div><p>{excerpt(scan.message)}</p><span className="history-signal-count">{scan.signals.length} signal{scan.signals.length > 1 ? "s" : ""} relevé{scan.signals.length > 1 ? "s" : ""}</span></div>
              <ArrowRight size={17} className="history-arrow" />
            </article>
          ))}
        </section>
      )}
      {!isPremium && <UpgradeCard />}
    </div>
  );
}