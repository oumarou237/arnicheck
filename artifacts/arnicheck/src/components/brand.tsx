import { Heart, ShieldCheck } from "lucide-react";

export function ShieldMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`shield-mark ${small ? "shield-mark-small" : ""}`} aria-hidden="true">
      <ShieldCheck size={small ? 18 : 23} strokeWidth={2.3} />
      <Heart className="shield-mark-heart" size={small ? 7 : 8} fill="currentColor" strokeWidth={2.5} />
    </span>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5" data-testid="brand-arnicheck">
      <ShieldMark small={compact} />
      {!compact && (
        <span className="brand-wordmark">
          <strong>Arni</strong>Check
        </span>
      )}
    </span>
  );
}