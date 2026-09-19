import { BellRing, Clock3, Moon, Shield, Sparkles, SearchCheck, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAppState } from "@/lib/app-state";
import { Brand } from "@/components/brand";

const navigation = [
  { href: "/", label: "Vérifier", icon: SearchCheck },
  { href: "/bouclier", label: "Bouclier Famille", icon: Shield },
  { href: "/historique", label: "Historique", icon: Clock3 },
];

const secondaryNavigation = { href: "/alertes", label: "Alertes du moment", icon: BellRing };

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { isPremium, togglePremium, monthlyCount } = useAppState();
  const [isDark, setIsDark] = useState(() => {
    try { return window.localStorage.getItem("arnicheck-theme") === "dark"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    try { window.localStorage.setItem("arnicheck-theme", isDark ? "dark" : "light"); } catch { /* memory fallback */ }
  }, [isDark]);

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
          <button type="button" className="theme-toggle" onClick={() => setIsDark((value) => !value)} aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"} data-testid="button-toggle-theme">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
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
            <Link
              href={secondaryNavigation.href}
              className={`side-nav-link ${location === secondaryNavigation.href ? "side-nav-link-active" : ""}`}
              data-testid="link-nav-alertes"
            >
              <secondaryNavigation.icon size={19} strokeWidth={location === secondaryNavigation.href ? 2.4 : 1.8} />
              <span>{secondaryNavigation.label}</span>
              <span className="nav-new-dot" />
            </Link>
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