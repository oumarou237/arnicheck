import { BellRing, Clock3, Shield, Sparkles, SearchCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAppState } from "@/lib/app-state";
import { Brand } from "@/components/brand";

const navigation = [
  { href: "/", label: "Vérifier", icon: SearchCheck },
  { href: "/bouclier", label: "Bouclier Famille", icon: Shield },
  { href: "/historique", label: "Historique", icon: Clock3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { isPremium, togglePremium, monthlyCount } = useAppState();

  return (
    <div className="app-frame">
      <header className="topbar">
        <Link href="/" className="topbar-brand" data-testid="link-home">
          <Brand />
        </Link>
        <div className="topbar-right">
          <div className="usage-pill" data-testid="status-usage">
            <span className="usage-dot" />
            {isPremium ? "ArniCheck Plus" : `${monthlyCount}/5 analyses`}
          </div>
          <button
            type="button"
            onClick={togglePremium}
            className={`premium-toggle ${isPremium ? "premium-active" : ""}`}
            data-testid="button-toggle-premium"
            aria-label={isPremium ? "Désactiver ArniCheck Plus" : "Activer ArniCheck Plus"}
          >
            <Sparkles size={15} />
            <span className="hidden sm:inline">{isPremium ? "Plus activé" : "Passer à Plus"}</span>
          </button>
        </div>
      </header>

      <div className="desktop-layout">
        <aside className="side-rail" aria-label="Navigation principale">
          <div className="side-rail-note">
            <BellRing size={16} />
            <span>Un doute ?<br /><strong>On regarde ensemble.</strong></span>
          </div>
          <nav className="side-nav">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`side-nav-link ${location === href ? "side-nav-link-active" : ""}`}
                data-testid={`link-nav-${label.toLowerCase().replaceAll(" ", "-")}`}
              >
                <Icon size={19} strokeWidth={location === href ? 2.4 : 1.8} />
                <span>{label}</span>
                {href === "/bouclier" && <span className="nav-new-dot" />}
              </Link>
            ))}
          </nav>
          <div className="side-footer">
            <Shield size={16} />
            <span>Vos vérifications restent<br /><strong>sur cet appareil.</strong></span>
          </div>
        </aside>
        <main className="main-content">{children}</main>
      </div>

      <nav className="bottom-nav" aria-label="Navigation mobile">
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`bottom-nav-link ${location === href ? "bottom-nav-link-active" : ""}`}
            data-testid={`link-mobile-${label.toLowerCase().replaceAll(" ", "-")}`}
          >
            <Icon size={20} strokeWidth={location === href ? 2.4 : 1.8} />
            <span>{label === "Bouclier Famille" ? "Bouclier" : label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function SectionKicker({ children }: { children: ReactNode }) {
  return <p className="section-kicker">{children}</p>;
}

export function UpgradeCard() {
  const { isPremium, togglePremium } = useAppState();
  if (isPremium) {
    return (
      <div className="plus-confirmation" data-testid="status-premium-active">
        <div className="plus-confirmation-icon"><Sparkles size={17} /></div>
        <div><strong>Votre Bouclier Plus est actif</strong><span>Tout est ouvert, pour vous et vos proches.</span></div>
      </div>
    );
  }
  return (
    <section className="upgrade-card" data-testid="card-upgrade">
      <div className="upgrade-spark"><Sparkles size={20} /></div>
      <div className="upgrade-copy">
        <span className="eyebrow">ArniCheck Plus</span>
        <h3>Un peu plus de calme, chaque mois.</h3>
        <p>Analyses illimitées, proches sans limite et alertes en temps réel.</p>
      </div>
      <button type="button" onClick={togglePremium} className="button-coral button-small" data-testid="button-upgrade">
        Activer Plus
      </button>
    </section>
  );
}