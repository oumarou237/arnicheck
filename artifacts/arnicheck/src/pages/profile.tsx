import { BadgeCheck, Flame, LockKeyhole, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { SectionKicker, UpgradeCard } from "@/components/shell";
import { useAppState } from "@/lib/app-state";

function confidenceFor(total: number, streak: number) {
  if (total >= 10 || streak >= 7) return { label: "Expert", progress: 100, next: "Vous avez installé de solides réflexes." };
  if (total >= 3 || streak >= 3) return { label: "Attentif", progress: 62, next: "Encore quelques vérifications pour ancrer vos habitudes." };
  return { label: "Débutant", progress: Math.max(18, total * 12 + streak * 5), next: "Chaque vérification vous aide à gagner en confiance." };
}

export default function ProfilePage() {
  const { scans, streak, badges, isPremium, togglePremium } = useAppState();
  const confidence = confidenceFor(scans.length, streak);
  const unlocked = badges.filter((badge) => badge.unlocked).length;

  return (
    <div className="page-stack profile-page">
      <div className="page-heading">
        <SectionKicker><span className="kicker-dot" /> Votre espace de confiance</SectionKicker>
        <h1>Votre vigilance,<br /><em>pas à pas.</em></h1>
        <p>Retrouvez ici vos progrès locaux et les réflexes que vous construisez au fil de vos vérifications.</p>
      </div>

      <section className="confidence-card" data-testid="card-confidence">
        <div className="confidence-heading">
          <div className="profile-avatar"><ShieldCheck size={24} /></div>
          <div><span className="eyebrow">Niveau de confiance</span><h2>{confidence.label}</h2></div>
          <span className="confidence-badge"><BadgeCheck size={15} /> Local</span>
        </div>
        <div className="confidence-progress-row"><span>Votre progression</span><strong>{confidence.progress}%</strong></div>
        <div className="confidence-progress" aria-label={`Progression ${confidence.progress}%`}><span style={{ width: `${confidence.progress}%` }} /></div>
        <p className="confidence-explanation">{confidence.next} ArniCheck ne juge pas vos choix : il vous donne un moment pour les faire sereinement.</p>
      </section>

      <section className="profile-stats" data-testid="section-profile-stats">
        <div className="profile-stat"><span className="profile-stat-icon"><ShieldCheck size={17} /></span><strong>{scans.length}</strong><small>analyse{scans.length > 1 ? "s" : ""}</small></div>
        <div className="profile-stat"><span className="profile-stat-icon profile-stat-warm"><Flame size={17} /></span><strong>{streak}</strong><small>jour{streak > 1 ? "s" : ""} de série</small></div>
        <div className="profile-stat"><span className="profile-stat-icon profile-stat-sage"><Trophy size={17} /></span><strong>{unlocked}/{badges.length}</strong><small>badge{badges.length > 1 ? "s" : ""}</small></div>
      </section>

      <section className="badges-panel" data-testid="section-profile-badges">
        <div className="profile-section-heading"><div><span className="eyebrow">Vos repères</span><h2>Les badges qui racontent vos bons réflexes</h2></div><Trophy size={19} /></div>
        <div className="profile-badges-list">
          {badges.map((badge) => (
            <div key={badge.id} className={`profile-badge ${badge.unlocked ? "is-unlocked" : ""}`}>
              <div className="profile-badge-icon">{badge.unlocked ? <BadgeCheck size={18} /> : <LockKeyhole size={16} />}</div>
              <div><strong>{badge.label}</strong><p>{badge.unlocked ? badge.detail : "Encore un petit réflexe pour le débloquer."}</p></div>
            </div>
          ))}
        </div>
      </section>

      {isPremium ? (
        <section className="profile-plus-active" data-testid="status-profile-premium">
          <div className="profile-plus-icon"><Sparkles size={20} /></div>
          <div><span className="eyebrow">ArniCheck Plus</span><h2>Votre Bouclier Plus est actif.</h2><p>Votre suivi, vos proches et vos analyses sont ouverts sans limite.</p></div>
          <button type="button" className="button-quiet" onClick={togglePremium} data-testid="button-disable-profile-premium">Désactiver</button>
        </section>
      ) : (
        <UpgradeCard />
      )}
    </div>
  );
}