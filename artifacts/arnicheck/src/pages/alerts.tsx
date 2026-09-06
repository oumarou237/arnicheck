import { ArrowLeft, BellRing, CheckCircle2, CircleAlert, Info, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { SectionKicker } from "@/components/shell";

const alerts = [
  { title: "Fausse arnaque Colissimo", icon: CircleAlert, tone: "coral", explanation: "Un SMS annonce souvent un colis bloqué et réclame quelques euros pour une nouvelle livraison.", recognise: "Le lien ne mène pas vers colissimo.fr et le délai imposé est très court." },
  { title: "Faux message CAF", icon: BellRing, tone: "sage", explanation: "Une fausse notification promet un remboursement ou demande de mettre à jour vos coordonnées.", recognise: "La CAF ne demande pas vos codes par SMS : passez par caf.fr, saisi vous-même." },
  { title: "Faux conseiller bancaire", icon: ShieldAlert, tone: "amber", explanation: "Un appel ou SMS se fait passer pour votre banque afin de récupérer un code reçu par téléphone.", recognise: "Un conseiller ne vous demandera jamais de valider une opération urgente pour l’annuler." },
  { title: "Fausse amende ANTAI", icon: CircleAlert, tone: "coral", explanation: "Un e-mail vous presse de régler une amende avec un lien vers une page de paiement copiée.", recognise: "Vérifiez l’adresse du site et consultez vos avis uniquement depuis antai.gouv.fr." },
  { title: "Faux remboursement d’impôts", icon: Info, tone: "sage", explanation: "Un message alléchant vous promet un remboursement et réclame vos informations bancaires.", recognise: "Les impôts ne vous demandent pas votre mot de passe ni vos coordonnées par un lien inattendu." },
  { title: "Fausse alerte compte", icon: ShieldAlert, tone: "amber", explanation: "Une alerte de connexion inconnue vous invite à cliquer immédiatement pour protéger votre compte.", recognise: "Ouvrez l’application officielle séparément : ne suivez pas le lien et ne partagez aucun code." },
];

export default function AlertsPage() {
  return (
    <div className="page-stack alerts-page">
      <div className="page-heading">
        <Link href="/" className="back-link" data-testid="link-back-verify"><ArrowLeft size={15} /> Retour à la vérification</Link>
        <SectionKicker><span className="kicker-dot warm-dot" /> Veille simple et utile</SectionKicker>
        <h1>Alertes <em>du moment.</em></h1>
        <p>Les scénarios qui circulent le plus en ce moment, expliqués sans jargon pour savoir quoi regarder.</p>
      </div>
      <section className="alert-feed" aria-label="Alertes de sécurité">
        {alerts.map(({ title, icon: Icon, tone, explanation, recognise }, index) => (
          <article className={`alert-card alert-card-${tone}`} key={title} data-testid={`card-alert-${index}`}>
            <div className="alert-card-top"><span className="alert-card-icon"><Icon size={19} /></span><span className="alert-card-index">0{index + 1}</span></div>
            <h2>{title}</h2>
            <p>{explanation}</p>
            <div className="alert-recognise"><CheckCircle2 size={15} /><span><strong>À reconnaître</strong>{recognise}</span></div>
          </article>
        ))}
      </section>
      <div className="alerts-footer-note"><Info size={16} /> Un doute sur un message précis ? <Link href="/">Vérifiez-le avec ArniCheck</Link>.</div>
    </div>
  );
}