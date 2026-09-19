import { ArrowLeft, BellRing, CheckCircle2, CircleAlert, Info, ShieldAlert, Users, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { SectionKicker } from "@/components/shell";
import { useAppState } from "@/lib/app-state";
import { formatDate } from "@/components/ui";

const alerts = [
  { title: "Fausse arnaque Colissimo", icon: CircleAlert, tone: "coral", explanation: "Un SMS annonce souvent un colis bloqué et réclame quelques euros pour une nouvelle livraison.", recognise: "Le lien ne mène pas vers colissimo.fr et le délai imposé est très court." },
  { title: "Faux message CAF", icon: BellRing, tone: "sage", explanation: "Une fausse notification promet un remboursement ou demande de mettre à jour vos coordonnées.", recognise: "La CAF ne demande pas vos codes par SMS : passez par caf.fr, saisi vous-même." },
  { title: "Faux conseiller bancaire", icon: ShieldAlert, tone: "amber", explanation: "Un appel ou SMS se fait passer pour votre banque afin de récupérer un code reçu par téléphone.", recognise: "Un conseiller ne vous demandera jamais de valider une opération urgente pour l’annuler." },
  { title: "Fausse amende ANTAI", icon: CircleAlert, tone: "coral", explanation: "Un e-mail vous presse de régler une amende avec un lien vers une page de paiement copiée.", recognise: "Vérifiez l’adresse du site et consultez vos avis uniquement depuis antai.gouv.fr." },
  { title: "Faux remboursement d’impôts", icon: Info, tone: "sage", explanation: "Un message alléchant vous promet un remboursement et réclame vos informations bancaires.", recognise: "Les impôts ne vous demandent pas votre mot de passe ni vos coordonnées par un lien inattendu." },
  { title: "Fausse alerte compte", icon: ShieldAlert, tone: "amber", explanation: "Une alerte de connexion inconnue vous invite à cliquer immédiatement pour protéger votre compte.", recognise: "Ouvrez l’application officielle séparément : ne suivez pas le lien et ne partagez aucun code." },
];

export default function AlertsPage() {
  const { communityReports, addCommunityReport } = useAppState();
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !detail.trim()) return;
    addCommunityReport({ title: title.trim(), detail: detail.trim() });
    setTitle("");
    setDetail("");
    setSubmitted(true);
    setFormOpen(false);
  };

  return (
    <div className="page-stack alerts-page">
      <div className="page-heading">
        <Link href="/" className="back-link" data-testid="link-back-verify"><ArrowLeft size={15} /> Retour à la vérification</Link>
        <SectionKicker><span className="kicker-dot warm-dot" /> Veille simple et utile</SectionKicker>
        <h1>Alertes <em>du moment.</em></h1>
        <p>Les scénarios qui circulent le plus en ce moment, expliqués sans jargon pour savoir quoi regarder.</p>
      </div>
      <section className="community-report-cta">
        <div><span className="eyebrow">Votre expérience peut aider</span><h2>Vous avez reçu une arnaque ?</h2><p>Partagez-la anonymement pour aider d’autres familles à la reconnaître.</p></div>
        <button type="button" className="button-coral" onClick={() => { setFormOpen((open) => !open); setSubmitted(false); }} data-testid="button-open-community-report">
          {formOpen ? <><X size={16} /> Fermer</> : <><Users size={16} /> Signaler une arnaque que j&apos;ai reçue</>}
        </button>
      </section>
      {formOpen && (
        <form className="community-report-form" onSubmit={submitReport} data-testid="form-community-report">
          <div className="form-heading"><div><span className="eyebrow">Signalement anonyme</span><h2>Racontez-nous ce qui s&apos;est passé.</h2></div><span>2 champs</span></div>
          <label>Titre court<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex. Faux conseiller par téléphone" maxLength={80} data-testid="input-community-title" /></label>
          <label>Description<textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Quel prétexte, quelle demande, quel détail vous a alerté ?" maxLength={500} data-testid="input-community-description" /></label>
          <div className="community-form-footer"><span>Pas de nom, pas de numéro : uniquement les signaux utiles.</span><button type="submit" className="button-primary" disabled={!title.trim() || !detail.trim()} data-testid="button-submit-community-report">Publier le signalement</button></div>
        </form>
      )}
      {submitted && <div className="community-success" role="status" data-testid="status-community-report"><CheckCircle2 size={16} /> Merci. Votre signalement apparaît en tête du fil.</div>}
      <section className="alert-feed" aria-label="Alertes de sécurité">
        {communityReports.map((report, index) => (
          <article className="alert-card alert-card-community" key={report.id} data-testid={`card-community-alert-${index}`}>
            <div className="alert-card-top"><span className="alert-card-icon"><Users size={19} /></span><span className="community-badge">Signalé par la communauté</span></div>
            <h2>{report.title}</h2>
            <p>{report.detail}</p>
            <div className="alert-recognise"><CheckCircle2 size={15} /><span><strong>Partagé pour aider</strong>{formatDate(report.createdAt)}</span></div>
          </article>
        ))}
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