import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ClipboardPaste, LockKeyhole, RotateCcw, ScanLine, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { SectionKicker, UpgradeCard } from "@/components/shell";
import { SignalRow, VerdictBadge, VerdictIcon, verdictContent } from "@/components/ui";
import { useAppState, type Verdict } from "@/lib/app-state";

const exampleMessage = "Votre colis est en attente. Confirmez vos informations de livraison sous 24h : https://livraison-suivi-confirmation.com";

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

export default function VerifyPage() {
  const { addScan, addAlert, isPremium, monthlyCount } = useAppState();
  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<{ verdict: Verdict; signals: string[]; message: string } | null>(null);

  const scanSteps = ["Lecture du message", "Repérage des signaux", "Préparation de votre réponse"];
  const canAnalyze = isPremium || monthlyCount < 5;
  const characterCount = message.length;

  useEffect(() => {
    if (!isScanning) return;
    const timer = window.setInterval(() => setScanStep((step) => Math.min(step + 1, 2)), 470);
    return () => window.clearInterval(timer);
  }, [isScanning]);

  const analysisHint = useMemo(() => {
    if (!message.trim()) return "Collez ici un SMS, un e-mail ou un message reçu.";
    return `${characterCount} caractères · votre message reste sur cet appareil`;
  }, [characterCount, message]);

  const handleAnalyze = () => {
    if (!message.trim() || isScanning || !canAnalyze) return;
    setIsScanning(true);
    setScanStep(0);
    setResult(null);
    window.setTimeout(() => {
      const detected = detectMessage(message);
      addScan({ message: message.trim(), verdict: detected.verdict, signals: detected.signals });
      if (detected.verdict === "danger") {
        addAlert({
          title: "Un message à risque a été repéré",
          detail: "Une vérification est disponible dans votre Historique.",
          kind: "scan",
        });
      }
      setResult({ ...detected, message: message.trim() });
      setIsScanning(false);
    }, 1450);
  };

  return (
    <div className="page-stack">
      <div className="page-heading verify-heading">
        <div>
          <SectionKicker><span className="kicker-dot" /> Vérification confidentielle</SectionKicker>
          <h1>On regarde ce message <em>ensemble.</em></h1>
          <p>Collez ce qui vous paraît bizarre. ArniCheck vous explique les signaux, sans vous faire peur.</p>
        </div>
        <div className="trust-note"><LockKeyhole size={15} /> Rien ne quitte cet appareil</div>
      </div>

      <section className={`checker-card ${isScanning ? "checker-scanning" : ""} ${result ? "checker-has-result" : ""}`}>
        <div className="checker-card-top">
          <div className="checker-label"><span className="field-number">01</span><span>Le message reçu</span></div>
          <button type="button" className="paste-button" onClick={() => setMessage(exampleMessage)} data-testid="button-fill-example">
            <ClipboardPaste size={15} /> Exemple
          </button>
        </div>
        <textarea
          value={message}
          onChange={(event) => { setMessage(event.target.value); setResult(null); }}
          placeholder="Collez votre SMS, e-mail ou message ici…"
          className="message-textarea"
          data-testid="input-suspicious-message"
          aria-label="Message à vérifier"
          disabled={isScanning}
        />
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
            disabled={!message.trim() || !canAnalyze}
            data-testid="button-analyze"
          >
            <span>{canAnalyze ? "Vérifier ce message" : "Limite mensuelle atteinte"}</span>
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
          {result.verdict === "danger" && <div className="advice-strip"><strong>Le bon réflexe :</strong> fermez le message, puis contactez l’organisme via son numéro officiel.</div>}
          {result.verdict === "safe" && <div className="advice-strip safe-advice"><strong>Un rappel doux :</strong> même un message fiable ne vous demandera jamais votre code secret par retour.</div>}
          <button type="button" className="button-quiet" onClick={() => { setResult(null); setMessage(""); }} data-testid="button-new-analysis"><RotateCcw size={15} /> Vérifier un autre message</button>
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
          <UpgradeCard />
          <p className="fine-print">ArniCheck est un compagnon pédagogique. En cas de doute persistant, contactez directement l’organisme concerné via un canal officiel.</p>
        </div>
      )}
    </div>
  );
}