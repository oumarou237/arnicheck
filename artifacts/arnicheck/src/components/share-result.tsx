import { Check, Copy, Share2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ShieldMark } from "@/components/brand";
import { VerdictBadge, VerdictIcon, verdictContent } from "@/components/ui";
import type { Verdict } from "@/lib/app-state";

type ShareResultProps = {
  verdict: Verdict;
  signals: string[];
  mode: "message" | "link" | "call";
};

const modeLabels = {
  message: "message",
  link: "lien",
  call: "appel",
} as const;

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

async function createShareImage({ verdict, signals, mode }: ShareResultProps) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 780;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponible");

  const background = verdict === "danger" ? "#fff3ef" : verdict === "caution" ? "#fff8eb" : "#f1faf4";
  const border = verdict === "danger" ? "#f0c4b9" : verdict === "caution" ? "#ecd7ac" : "#c5e2d1";
  const navy = "#172743";
  const coral = "#e97862";
  const muted = "#667085";

  context.fillStyle = "#faf8f1";
  context.fillRect(0, 0, canvas.width, canvas.height);
  roundedRect(context, 48, 48, 1104, 684, 34);
  context.fillStyle = background;
  context.fill();
  context.strokeStyle = border;
  context.lineWidth = 3;
  context.stroke();

  context.fillStyle = navy;
  context.font = "800 42px Manrope, Arial, sans-serif";
  context.fillText("Arni", 92, 122);
  context.fillStyle = coral;
  context.fillText("Check", 184, 122);
  context.fillStyle = muted;
  context.font = "500 22px 'DM Sans', Arial, sans-serif";
  context.fillText(`Vérification d’un ${modeLabels[mode]}`, 92, 163);

  context.fillStyle = navy;
  context.font = "800 46px Manrope, Arial, sans-serif";
  context.fillText(verdictContent[verdict].title, 92, 274);
  context.fillStyle = muted;
  context.font = "500 25px 'DM Sans', Arial, sans-serif";
  context.fillText(verdictContent[verdict].label, 92, 324);

  context.fillStyle = navy;
  context.font = "700 25px 'DM Sans', Arial, sans-serif";
  context.fillText("Les signaux repérés", 92, 411);
  context.font = "500 23px 'DM Sans', Arial, sans-serif";
  signals.slice(0, 3).forEach((signal, index) => {
    context.fillStyle = coral;
    context.beginPath();
    context.arc(105, 466 + index * 56, 7, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = navy;
    context.fillText(signal, 130, 474 + index * 56);
  });

  context.fillStyle = muted;
  context.font = "500 20px 'DM Sans', Arial, sans-serif";
  context.fillText("Un résumé simple à partager, sans le contenu privé.", 92, 680);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Image indisponible");
  return new File([blob], "arnicheck-verdict.png", { type: "image/png" });
}

export function ShareResult({ verdict, signals, mode }: ShareResultProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const content = verdictContent[verdict];
  const shareText = useMemo(
    () =>
      `ArniCheck — ${content.label} pour cet ${modeLabels[mode]}. ${content.title} ${signals
        .slice(0, 2)
        .join(" ")} Vérifié avec ArniCheck.`,
    [content.label, content.title, mode, signals],
  );

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const image = await createShareImage({ verdict, signals, mode });
        if (typeof navigator.canShare === "function" && navigator.canShare({ files: [image] })) {
          await navigator.share({ title: "Mon résultat ArniCheck", text: shareText, files: [image] });
          return;
        }
      } catch {
        // Certains navigateurs refusent la création ou le partage de fichier.
      }
      try {
        await navigator.share({ title: "Mon résultat ArniCheck", text: shareText });
        return;
      } catch {
        // L’utilisateur peut fermer la feuille de partage : le résultat reste disponible ici.
      }
    }
    setPreviewOpen(true);
  };

  const copy = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
        return;
      } catch {
        // Certains navigateurs refusent le presse-papier sans geste explicite.
      }
    }
    setPreviewOpen(true);
  };

  return (
    <div className="share-result">
      <button type="button" className="share-result-button" onClick={share} data-testid="button-share-result">
        <Share2 size={15} /> Partager avec un proche
      </button>
      {previewOpen && (
        <div className={`share-preview share-preview-${verdict}`} data-testid="card-share-preview">
          <div className="share-preview-top">
            <span className="share-brand"><ShieldMark small /> arni<span>check</span></span>
            <button type="button" className="share-close" onClick={() => setPreviewOpen(false)} aria-label="Fermer l’aperçu de partage" data-testid="button-close-share-preview">
              <X size={15} />
            </button>
          </div>
          <div className="share-preview-verdict">
            <span className="share-preview-icon"><VerdictIcon verdict={verdict} size={18} /></span>
            <div><VerdictBadge verdict={verdict} compact /><strong>{content.title}</strong></div>
          </div>
          <p>Vérification d’un {modeLabels[mode]} avec ArniCheck.</p>
          <ul>{signals.slice(0, 2).map((signal) => <li key={signal}>{signal}</li>)}</ul>
          <button type="button" className="button-coral button-small share-copy" onClick={copy} data-testid="button-copy-share">
            {copied ? <><Check size={14} /> Résumé copié</> : <><Copy size={14} /> Copier le résumé</>}
          </button>
          <span className="share-reassurance">Un résumé simple à envoyer, sans le contenu privé.</span>
        </div>
      )}
    </div>
  );
}