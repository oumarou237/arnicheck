import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { ArrowUpRight, ClipboardPaste, ImageUp, Link2, LockKeyhole, PhoneCall, RotateCcw, ScanLine, Shield, Sparkles, Trophy } from "lucide-react";
import { Link } from "wouter";
import { SectionKicker, UpgradeCard } from "@/components/shell";
import { ShareResult } from "@/components/share-result";
import { NotificationMockup, TipOfTheDay } from "@/components/home-widgets";
import { SignalRow, VerdictBadge, VerdictIcon, verdictContent } from "@/components/ui";
import { useAppState, type Verdict } from "@/lib/app-state";

const exampleMessage = "Votre colis est en attente. Confirmez vos informations de livraison sous 24h : https://livraison-suivi-confirmation.com";
const exampleLink = "https://bit.ly/colissimo-remboursement";

function detectMessage(message: string): { verdict: Verdict; signals: string[] } {
  const normalized = message.toLowerCase();
  const signals: string[] = [];
  if (/https?:\/\/|www\.|bit\.ly|tinyurl/.test(normalized)) signals.push("Un lien vous invite à sortir de votre espace habituel.");
  if (/urgent|immédiat|24 ?h|dernière chance|bloqué|sous peu/.test(normalized)) signals.push("Un délai très court cherche à vous faire agir vite.");
  if (/banque|carte|rib|virement|mot de passe|code|identifiant|sécurité sociale/.test(normalized)) signals.push("Le message évoque des informations personnelles ou bancaires.");
  if (/cadeau|gagné|remboursement|amende|colis|livraison|impayé/.test(normalized)) signals.push("Le prétexte est souvent utilisé dans les messages frauduleux.");
  if (/[A-ZÀ-Ÿ]{5,}/.test(message)) signals.push("Le ton ou la mise en forme semble inhabituel.");
  if (signals.length >= 3) return { verdict: "danger", signals };
  if (signals.length > 0) return { verdict: "caution", signals };
  return { verdict: "safe", signals: ["Aucun lien ou demande sensible n’a été repéré.", "Le ton du message paraît cohérent."] };
}

function detectLink(value: string): { verdict: Verdict; signals: string[]; riskScore: number } {
  const trimmed = value.trim();
  const signals: string[] = [];
  let score = 8;
  let parsed: URL | null = null;
  try { parsed = new URL(trimmed); } catch { signals.push("Cette adresse ne ressemble pas à un lien complet."); score += 38; }
  if (parsed) {
    const host = parsed.hostname.toLowerCase();
    if (parsed.protocol !== "https:") { signals.push("Le lien n’utilise pas une connexion HTTPS sécurisée."); score += 25; }
    if (/bit\.ly|tinyurl|t\.co|cutt\.ly|goo\.gl|is\.gd/.test(host)) { signals.push("Un raccourcisseur masque la destination réelle du lien."); score += 35; }
    if (/[^\u0000-\u007f]|-{2,}|[0-9]{4,}/.test(host) || host.split(".").length > 3) { signals.push("Le nom de domaine contient des caractères ou une structure inhabituels."); score += 25; }
    if (/(colissimo|caf|antai|impots|banque|securite)/.test(host) && !/\.(gouv|fr|com)$/i.test(host)) { signals.push("Le domaine imite un organisme connu sans lui appartenir clairement."); score += 30; }
    if (parsed.username || parsed.password) { signals.push("L’adresse contient une partie cachée avant le domaine."); score += 28; }
  }
  if (!signals.length) signals.push("L’adresse utilise HTTPS et ne présente pas de signal technique évident.");
  const riskScore = Math.min(98, score);
  return { verdict: riskScore >= 55 ? "danger" : riskScore >= 28 ? "caution" : "safe", signals, riskScore };
}

function detectCall(value: string): { verdict: Verdict; signals: string[]; riskScore: number } {
  const normalized = value.toLowerCase();
  const signals: string[] = [];
  let score = 6;
  if (/urgent|urgence|immédiat|tout de suite|maintenant|dans l'heure|sous 24 ?h/.test(normalized)) {
    signals.push("La pression du temps cherche à vous empêcher de réfléchir ou de vérifier.");
    score += 28;
  }
  if (/virement|paiement|payer|carte|rib|code|otp|transfert|argent|rembourser|remboursement/.test(normalized)) {
    signals.push("L’appel évoque de l’argent, un paiement ou un code confidentiel.");
    score += 30;
  }
  if (/banque|conseiller|police|gendarmerie|impôts|caf|assurance|livreur|support|service client|ami|fils|fille/.test(normalized)) {
    signals.push("L’interlocuteur semble se faire passer pour un organisme ou un proche.");
    score += 24;
  }
  if (/ne dites rien|restez en ligne|ne raccrochez pas|confidentiel|sanction|plainte|compte bloqué|problème grave|dernier avertissement/.test(normalized)) {
    signals.push("Le discours joue sur la peur, le secret ou l’isolement pour obtenir une réaction.");
    score += 25;
  }
  if (!signals.length) signals.push("Aucun signal évident n’a été repéré dans votre description.", "Prenez toujours le temps de rappeler l’organisme via son numéro officiel.");
  const riskScore = Math.min(98, score);
  return { verdict: riskScore >= 55 ? "danger" : riskScore >= 28 ? "caution" : "safe", signals, riskScore };
}

export default function VerifyPage() {
  const { addScan, addAlert, isPremium, monthlyCount, streak, badges, scans } = useAppState();
  const [mode, setMode] = useState<"message" | "link" | "call">("message");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [call, setCall] = useState("");
  const [isOcrReading, setIsOcrReading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<{ verdict: Verdict; signals: string[]; message: string; mode: "message" | "link" | "call"; riskScore?: number } | null>(null);

  const scanSteps = mode === "message"
    ? ["Lecture du message", "Repérage des signaux", "Préparation de votre réponse"]
    : mode === "link"
      ? ["Lecture du lien", "Repérage des signaux", "Préparation de votre réponse"]
      : ["Écoute de votre description", "Repérage des signaux", "Préparation de votre réponse"];
  const canAnalyze = isPremium || monthlyCount < 5;
  const currentValue = mode === "message" ? message : mode === "link" ? link : call;
  const characterCount = currentValue.length;

  useEffect(() => {
    if (!isScanning) return;
    const timer = window.setInterval(() => setScanStep((step) => Math.min(step + 1, 2)), 470);
    return () => window.clearInterval(timer);
  }, [isScanning]);

  const analysisHint = useMemo(() => {
    if (!currentValue.trim()) return mode === "message" ? "Collez ici un SMS, un e-mail ou un message reçu." : mode === "link" ? "Collez une adresse web complète à analyser." : "Décrivez ce que l’interlocuteur vous a demandé.";
    return `${characterCount} caractères · votre message reste sur cet appareil`;
  }, [characterCount, currentValue, mode]);

  const handleOcr = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    setIsOcrReading(true);
    setResult(null);
    window.setTimeout(() => {
      setMessage("Votre compte sera suspendu dans 24h. Confirmez immédiatement vos informations sur https://espace-securise-verification.com pour éviter la fermeture.");
      setMode("message");
      setIsOcrReading(false);
      event.target.value = "";
    }, 1100);
  };

  const handleAnalyze = () => {
    if (!currentValue.trim() || isScanning || isOcrReading || !canAnalyze) return;
    setIsScanning(true);
    setScanStep(0);
    setResult(null);
    window.setTimeout(() => {
      const detected = mode === "message" ? detectMessage(message) : mode === "link" ? detectLink(link) : detectCall(call);
      const scanMessage = mode === "message" ? message.trim() : mode === "link" ? `Lien vérifié : ${link.trim()}` : `Appel reçu : ${call.trim()}`;
      const riskScore: number | undefined = mode === "message" ? undefined : mode === "link" ? detectLink(link).riskScore : detectCall(call).riskScore;
      addScan({ message: scanMessage, mode, riskScore, verdict: detected.verdict, signals: detected.signals });
      if (detected.verdict === "danger") {
        addAlert({
          title: "Un message à risque a été repéré",
          detail: "Une vérification est disponible dans votre Historique.",
          kind: "scan",
        });
      }
      setResult({ ...detected, message: scanMessage, mode });
      setIsScanning(false);
    }, 1450);
  };

  return (
    <div className="page-stack">
      <div className="page-heading verify-heading">
        <div>
          <SectionKicker><span className="kicker-dot" /> Vérification confidentielle</SectionKicker>
          <h1>On regarde cet {mode === "message" ? "message" : mode === "link" ? "lien" : "appel"} <em>ensemble.</em></h1>
          <p>{mode === "message" ? "Collez ce qui vous paraît bizarre." : mode === "link" ? "Collez une adresse qui vous semble étrange." : "Décrivez ce que l’on vous a demandé."} ArniCheck vous explique les signaux, sans vous faire peur.</p>
        </div>
        <div className="trust-note"><LockKeyhole size={15} /> Rien ne quitte cet appareil</div>
      </div>

      <div className="mode-tabs" role="tablist" aria-label="Type de vérification">
        <button type="button" className={mode === "message" ? "mode-tab active" : "mode-tab"} onClick={() => { setMode("message"); setResult(null); }} role="tab" aria-selected={mode === "message"} data-testid="tab-verify-message"><ClipboardPaste size={15} /> Vérifier un message</button>
        <button type="button" className={mode === "link" ? "mode-tab active" : "mode-tab"} onClick={() => { setMode("link"); setResult(null); }} role="tab" aria-selected={mode === "link"} data-testid="tab-verify-link"><Link2 size={15} /> Vérifier un lien</button>
         <button type="button" className={mode === "call" ? "mode-tab active" : "mode-tab"} onClick={() => { setMode("call"); setResult(null); }} role="tab" aria-selected={mode === "call"} data-testid="tab-verify-call"><PhoneCall size={15} /> Appel reçu</button>
      </div>

      <section className={`checker-card ${isScanning ? "checker-scanning" : ""} ${result ? "checker-has-result" : ""}`}>
        <div className="checker-card-top">
          <div className="checker-label"><span className="field-number">01</span><span>{mode === "message" ? "Le message reçu" : mode === "link" ? "L’adresse à vérifier" : "Ce que l’on vous a dit"}</span></div>
          {mode === "message" ? (
            <div className="checker-actions">
              <button type="button" className="paste-button" onClick={() => setMessage(exampleMessage)} data-testid="button-fill-example"><ClipboardPaste size={15} /> Exemple</button>
              <button type="button" className="paste-button" onClick={() => fileInputRef.current?.click()} disabled={isOcrReading} data-testid="button-import-screenshot"><ImageUp size={15} /> Capture d’écran</button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleOcr} hidden data-testid="input-screenshot" />
            </div>
          ) : mode === "link" ? <button type="button" className="paste-button" onClick={() => setLink(exampleLink)} data-testid="button-fill-link-example"><Link2 size={15} /> Exemple</button> : <button type="button" className="paste-button" onClick={() => setCall("Un conseiller bancaire m’a appelé en urgence : il disait vouloir annuler un virement et demandait le code reçu par SMS.")} data-testid="button-fill-call-example"><PhoneCall size={15} /> Exemple</button>}
        </div>
        {mode === "message" ? (
          <textarea value={message} onChange={(event) => { setMessage(event.target.value); setResult(null); }} placeholder="Collez votre SMS, e-mail ou message ici…" className="message-textarea" data-testid="input-suspicious-message" aria-label="Message à vérifier" disabled={isScanning || isOcrReading} />
        ) : mode === "link" ? (
          <input value={link} onChange={(event) => { setLink(event.target.value); setResult(null); }} placeholder="https://exemple.fr/ma-page" className="link-input" data-testid="input-suspicious-link" aria-label="Lien à vérifier" disabled={isScanning} inputMode="url" />
        ) : (
          <textarea value={call} onChange={(event) => { setCall(event.target.value); setResult(null); }} placeholder="Ex. Un faux conseiller m’a demandé de valider un virement…" className="message-textarea call-textarea" data-testid="input-suspicious-call" aria-label="Description de l’appel à vérifier" disabled={isScanning} />
        )}
        {isOcrReading && <div className="ocr-note"><ImageUp size={15} className="scan-pulse" /> Lecture du message en cours... <span>OCR réel sera branché ensuite.</span></div>}
        <div className="checker-card-bottom">
          <span className="textarea-hint">{analysisHint}</span>
          <span className="character-count">{characterCount}/2 000</span>
        </div>
        {isScanning ? (
          <div className="scan-progress" data-testid="status-scanning">
            <div className="scan-progress-line"><span style={{ width: `${35 + scanStep * 31}%` }} /></div>
            <div className="scan-progress-copy"><ScanLine size={17} className="scan-pulse" /><span>{scanSteps[scanStep]}</span><span>{scanStep + 1}/3</span></div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAnalyze}
            className="button-primary analyze-button"
             disabled={!currentValue.trim() || !canAnalyze || isOcrReading}
            data-testid="button-analyze"
          >
             <span>{canAnalyze ? (mode === "message" ? "Vérifier ce message" : mode === "link" ? "Analyser ce lien" : "Analyser cet appel") : "Limite mensuelle atteinte"}</span>
            <ArrowUpRight size={18} />
          </button>
        )}
      </section>

      {!canAnalyze && (
        <div className="limit-notice" data-testid="status-analysis-limit">
          <Sparkles size={17} /><span>Vous avez utilisé vos 5 analyses gratuites ce mois-ci.</span><button type="button" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>Voir Plus</button>
        </div>
      )}

      {result && (
        <section className={`result-card result-${result.verdict}`} data-testid="card-analysis-result">
          <div className="result-main">
            <div className="result-icon"><VerdictIcon verdict={result.verdict} size={27} /></div>
            <div>
              <VerdictBadge verdict={result.verdict} />
              <h2>{verdictContent[result.verdict].title}</h2>
              <p>{verdictContent[result.verdict].description}</p>
            </div>
          </div>
          <div className="result-divider" />
          <div className="signals-heading"><span>Ce qui a attiré notre attention</span><span>{result.signals.length} signal{result.signals.length > 1 ? "s" : ""}</span></div>
          <div className="signals-list">
            {result.signals.map((signal, index) => <SignalRow key={signal} index={index}>{signal}</SignalRow>)}
          </div>
           {result.riskScore !== undefined && <div className="risk-score"><span>Niveau de risque indicatif</span><strong>{result.riskScore}/100</strong></div>}
          {result.verdict === "danger" && <div className="advice-strip"><strong>Le bon réflexe :</strong> fermez le message, puis contactez l’organisme via son numéro officiel.</div>}
          {result.verdict === "safe" && <div className="advice-strip safe-advice"><strong>Un rappel doux :</strong> même un message fiable ne vous demandera jamais votre code secret par retour.</div>}
           <DeepAnalysis isPremium={isPremium} verdict={result.verdict} riskScore={result.riskScore ?? (result.verdict === "danger" ? 78 : result.verdict === "caution" ? 46 : 14)} mode={result.mode} />
           <ShareResult verdict={result.verdict} signals={result.signals} mode={result.mode} />
           <button type="button" className="button-quiet" onClick={() => { setResult(null); setMessage(""); setLink(""); setCall(""); }} data-testid="button-new-analysis"><RotateCcw size={15} /> Vérifier un autre contenu</button>
        </section>
      )}

      {!result && !isScanning && (
        <div className="below-checker">
          <div className="how-it-works">
            <span className="how-label">EN 3 ÉTAPES</span>
            <div className="how-step"><span>1</span><p><strong>Collez</strong><br />le message</p></div>
            <div className="how-line" />
            <div className="how-step"><span>2</span><p><strong>On repère</strong><br />les signaux</p></div>
            <div className="how-line" />
            <div className="how-step"><span>3</span><p><strong>Vous décidez</strong><br />sans pression</p></div>
          </div>
          <TipOfTheDay />
          <NotificationMockup />
          <UpgradeCard />
           <WeeklyReport scans={scans} isPremium={isPremium} />
           <Link href="/alertes" className="alerts-home-link" data-testid="link-alertes-home"><Sparkles size={15} /> Voir les alertes du moment <ArrowUpRight size={15} /></Link>
           <VigilanceCard streak={streak} badges={badges} />
          <p className="fine-print">ArniCheck est un compagnon pédagogique. En cas de doute persistant, contactez directement l’organisme concerné via un canal officiel.</p>
        </div>
      )}
    </div>
  );
}

function WeeklyReport({ scans, isPremium }: { scans: ReturnType<typeof useAppState>["scans"]; isPremium: boolean }) {
  const { togglePremium } = useAppState();
  const weekStart = Date.now() - 7 * 86400000;
  const recent = scans.filter((scan) => new Date(scan.createdAt).getTime() >= weekStart);
  const dangerAvoided = recent.filter((scan) => scan.verdict === "danger").length;
  const saved = dangerAvoided * 87.5 + recent.filter((scan) => scan.verdict === "caution").length * 12.5;
  return (
    <section className={`weekly-report ${!isPremium ? "weekly-report-locked" : ""}`} data-testid="card-weekly-report">
      <div className="weekly-report-heading">
        <div><span className="eyebrow">ArniCheck Plus</span><h2>Ton bilan de la semaine</h2></div>
        <Sparkles size={18} />
      </div>
      <div className="weekly-report-body">
        <div><strong>{recent.length}</strong><span>analyse{recent.length > 1 ? "s" : ""} ces 7 derniers jours</span></div>
        <div><strong>{dangerAvoided}</strong><span>danger{dangerAvoided > 1 ? "s" : ""} évité{dangerAvoided > 1 ? "s" : ""}</span></div>
        <div><strong>{saved.toFixed(2).replace(".", ",")} €</strong><span>économie estimée</span></div>
      </div>
      {!isPremium && (
        <div className="weekly-report-overlay">
          <LockKeyhole size={18} />
          <strong>Votre semaine, en un coup d’œil</strong>
          <span>Un suivi privé pour voir vos bons réflexes progresser.</span>
          <button type="button" className="button-coral button-small" onClick={togglePremium} data-testid="button-upgrade-weekly-report">Débloquer avec Premium</button>
        </div>
      )}
    </section>
  );
}

function VigilanceCard({ streak, badges }: { streak: number; badges: ReturnType<typeof useAppState>["badges"] }) {
  const tier = streak >= 10 ? "gold" : streak >= 5 ? "silver" : "bronze";
  return (
    <section className={`vigilance-card vigilance-${tier}`} data-testid="card-vigilance">
      <div className="vigilance-main"><div className="vigilance-shield"><Shield size={22} /></div><div><span className="eyebrow">Votre vigilance</span><h3>{streak} jour{streak > 1 ? "s" : ""} consécutif{streak > 1 ? "s" : ""} sans interaction dangereuse</h3><p>Chaque vérification compte : prendre une pause est déjà un bon réflexe.</p></div></div>
      <div className="badge-row">{badges.map((badge) => <span key={badge.id} className={`vigilance-badge ${badge.unlocked ? "unlocked" : ""}`} title={badge.detail}><Trophy size={13} /> {badge.label}</span>)}</div>
    </section>
  );
}

function DeepAnalysis({ isPremium, verdict, riskScore, mode }: { isPremium: boolean; verdict: Verdict; riskScore: number; mode: "message" | "link" | "call" }) {
  const { togglePremium } = useAppState();
  const copy = verdict === "danger"
    ? { context: mode === "link" ? "Le domaine semble chercher à détourner votre attention vers une fausse destination." : mode === "call" ? "L’appel combine urgence, autorité et demande d’action : une mécanique fréquente des fraudes au faux conseiller." : "Le message combine urgence et demande d’informations, une mécanique fréquente des campagnes ciblées.", sophistication: "La présentation est assez crédible pour passer un premier regard, mais les signaux se recoupent.", next: "Ne répondez pas. Signalez-le, puis ouvrez le site officiel en le tapant vous-même." }
    : verdict === "caution"
      ? { context: "Certains éléments peuvent avoir une explication légitime, mais le contexte manque pour agir sereinement.", sophistication: "Le scénario reste ambigu : c’est précisément le moment de vérifier par un second canal.", next: "Prenez une pause et demandez confirmation à l’organisme avec un contact trouvé indépendamment." }
      : { context: "Le contenu observé ressemble à une communication habituelle et ne pousse pas à transmettre un secret.", sophistication: "Aucune combinaison de signaux techniques ou émotionnels marqués n’a été relevée.", next: "Gardez vos habitudes : application officielle, mot de passe unique et aucun code partagé." };
  return (
    <section className={`deep-analysis ${!isPremium ? "deep-analysis-locked" : ""}`} data-testid="card-deep-analysis">
      <div className="deep-analysis-heading"><div><span className="eyebrow"><Sparkles size={13} /> Analyse approfondie IA</span><h3>Un peu plus de contexte, pour décider calmement.</h3></div>{!isPremium && <span className="locked-label"><LockKeyhole size={13} /> Plus</span>}</div>
      <div className="deep-analysis-body"><div><strong>Le contexte</strong><p>{copy.context}</p></div><div><strong>La sophistication</strong><p>{copy.sophistication}</p></div><div><strong>Votre prochaine étape</strong><p>{copy.next}</p></div></div>
      {!isPremium && <div className="deep-analysis-overlay"><LockKeyhole size={19} /><strong>Débloquez l’analyse personnalisée</strong><span>Comprenez le scénario et les gestes adaptés à votre situation.</span><button type="button" className="button-coral button-small" onClick={togglePremium} data-testid="button-upgrade-deep-analysis">Activer Plus</button></div>}
      <span className="deep-score">Indice indicatif : {riskScore}/100</span>
    </section>
  );
}