import { BellRing, Lightbulb } from "lucide-react";
import { useMemo } from "react";

const tips = [
  "Un organisme sérieux ne vous demandera jamais un code reçu par SMS.",
  "Prenez le temps de raccrocher avant de rappeler un numéro officiel.",
  "Un lien reçu par message n’est pas un raccourci vers votre banque.",
  "L’urgence est souvent un levier : une vraie facture peut attendre quelques minutes.",
  "Ne laissez pas un moteur de recherche choisir le premier résultat pour vous.",
  "Une adresse avec une faute ou un tiret inhabituel mérite une vérification.",
  "N’envoyez jamais une photo de votre carte bancaire, même à un proche.",
  "Un remboursement inattendu ne nécessite pas de confirmer vos codes secrets.",
  "En cas de doute, ouvrez l’application officielle séparément du message reçu.",
  "Les fraudeurs peuvent usurper un numéro : le numéro affiché ne suffit pas.",
  "Ne partagez pas votre écran avec un prétendu conseiller qui vous appelle.",
  "Demandez un second avis avant de cliquer, payer ou transmettre une information.",
];

function todayKey() {
  return new Intl.DateTimeFormat("fr-CA").format(new Date());
}

function tipForToday(day: string) {
  const number = day.replaceAll("-", "").split("").reduce((sum, digit) => sum + Number(digit), 0);
  return tips[number % tips.length];
}

export function TipOfTheDay() {
  const day = useMemo(todayKey, []);
  const tip = useMemo(() => tipForToday(day), [day]);
  return (
    <section className="tip-card" data-testid="card-tip-of-day" aria-label="Conseil anti-arnaque du jour">
      <div className="tip-icon"><Lightbulb size={19} /></div>
      <div className="tip-copy">
        <span className="eyebrow">Le bon réflexe du jour</span>
        <p>{tip}</p>
      </div>
      <span className="tip-day">{day.split("-").reverse().join(".")}</span>
    </section>
  );
}

export function NotificationMockup() {
  return (
    <aside className="notification-mockup" data-testid="card-notification-demo" aria-label="Démonstration d’alerte ArniCheck">
      <div className="notification-icon"><BellRing size={18} /></div>
      <div className="notification-copy">
        <span className="notification-label">Démonstration d’alerte</span>
        <strong>Nouvelle arnaque signalée près de chez vous</strong>
        <p>Un exemple d’information utile, pas une notification système.</p>
      </div>
      <span className="notification-pulse" aria-hidden="true" />
    </aside>
  );
}