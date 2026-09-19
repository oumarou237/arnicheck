import { ArrowRight, CheckCircle2, MessageCircleWarning, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";

type OnboardingProps = {
  onComplete: () => void;
};

const screens = [
  {
    eyebrow: "Bienvenue dans votre espace sûr",
    title: "Les arnaques vont vite. Vous n’avez pas à leur répondre dans la précipitation.",
    copy: "Les messages frauduleux sont de plus en plus convaincants. ArniCheck vous aide à faire une pause, à comprendre les signaux et à décider sereinement.",
    icon: ShieldCheck,
    tone: "coral",
  },
  {
    eyebrow: "Deux réflexes, un même calme",
    title: "Vérifier ce qui vous semble étrange. Protéger ceux qui comptent.",
    copy: "Collez un message, un lien ou décrivez un appel dans Vérifier. Avec Bouclier Famille, partagez les bons réflexes avec votre cercle de confiance.",
    icon: MessageCircleWarning,
    tone: "sage",
    features: [
      { icon: MessageCircleWarning, label: "Vérifier", detail: "des signaux expliqués sans jargon" },
      { icon: UsersRound, label: "Bouclier Famille", detail: "un espace pour vos proches" },
    ],
  },
  {
    eyebrow: "Ici, vous pouvez prendre votre temps",
    title: "On regarde ensemble.",
    copy: "Commencez avec un message qui vous laisse un doute. Vos vérifications restent sur cet appareil, et vous gardez toujours le dernier mot.",
    icon: Sparkles,
    tone: "amber",
  },
];

function hasCompletedOnboarding() {
  try {
    return window.localStorage.getItem("arnicheck-onboarding-complete") === "true";
  } catch {
    return false;
  }
}

export function FirstLaunchOnboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const screen = screens[step];
  const Icon = screen.icon;

  useEffect(() => {
    try {
      const isDark = window.localStorage.getItem("arnicheck-theme") === "dark";
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
    } catch {
      // The regular shell will take over theme persistence after onboarding.
    }
  }, []);

  const finish = () => {
    try {
      window.localStorage.setItem("arnicheck-onboarding-complete", "true");
    } catch {
      // L’expérience continue même si le navigateur refuse le stockage.
    }
    onComplete();
  };

  return (
    <main className="onboarding-page" aria-label="Introduction à ArniCheck">
      <div className="onboarding-orbit onboarding-orbit-one" />
      <div className="onboarding-orbit onboarding-orbit-two" />
      <section className={`onboarding-card onboarding-tone-${screen.tone}`}>
        <div className="onboarding-topline">
          <span className="onboarding-brand"><span className="onboarding-brand-mark"><ShieldCheck size={15} /></span> ArniCheck</span>
          <button type="button" className="onboarding-skip" onClick={finish} data-testid="button-skip-onboarding">Passer</button>
        </div>

        <div className="onboarding-visual" aria-hidden="true">
          <div className="onboarding-visual-halo" />
          <div className="onboarding-visual-icon"><Icon size={42} strokeWidth={1.7} /></div>
          <span className="onboarding-spark onboarding-spark-a"><CheckCircle2 size={16} /></span>
          <span className="onboarding-spark onboarding-spark-b"><Sparkles size={16} /></span>
        </div>

        <div className="onboarding-copy">
          <p className="onboarding-eyebrow">{screen.eyebrow}</p>
          <h1>{screen.title}</h1>
          <p className="onboarding-description">{screen.copy}</p>
        </div>

        {screen.features && (
          <div className="onboarding-features">
            {screen.features.map(({ icon: FeatureIcon, label, detail }) => (
              <div className="onboarding-feature" key={label}>
                <span className="onboarding-feature-icon"><FeatureIcon size={17} /></span>
                <span><strong>{label}</strong><small>{detail}</small></span>
              </div>
            ))}
          </div>
        )}

        <div className="onboarding-footer">
          <div className="onboarding-dots" aria-label={`Écran ${step + 1} sur ${screens.length}`}>
            {screens.map((item, index) => (
              <button
                type="button"
                key={item.eyebrow}
                className={`onboarding-dot ${index === step ? "active" : ""}`}
                onClick={() => setStep(index)}
                aria-label={`Aller à l’écran ${index + 1}`}
                data-testid={`button-onboarding-step-${index + 1}`}
              />
            ))}
          </div>
          <button type="button" className="onboarding-next" onClick={step === screens.length - 1 ? finish : () => setStep((current) => current + 1)} data-testid={step === screens.length - 1 ? "button-start-arnicheck" : "button-next-onboarding"}>
            {step === screens.length - 1 ? "C’est parti" : "Continuer"} <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}

export function shouldShowOnboarding() {
  return !hasCompletedOnboarding();
}