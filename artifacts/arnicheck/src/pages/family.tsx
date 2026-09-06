import { useState } from "react";
import { Check, HeartHandshake, MessageCircle, Plus, Send, Shield, Trash2, UserRound, X } from "lucide-react";
import { SectionKicker, UpgradeCard } from "@/components/shell";
import { RelativeAvatar, DateLabel } from "@/components/ui";
import { useAppState } from "@/lib/app-state";

const relationOptions = ["Parent", "Grand-parent", "Conjoint·e", "Enfant", "Ami·e"];

export default function FamilyPage() {
  const { relatives, alerts, addRelative, removeRelative, isPremium, addAlert } = useAppState();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState(relationOptions[0]);
  const [selectedRelativeId, setSelectedRelativeId] = useState("");
  const [relaySent, setRelaySent] = useState(false);
  const [error, setError] = useState("");
  const limitReached = !isPremium && relatives.length >= 1;
  const selectedRelative = relatives.find((relative) => relative.id === selectedRelativeId) ?? relatives[0];

  const handleAdd = () => {
    if (!name.trim()) { setError("Ajoutez un prénom pour continuer."); return; }
    if (limitReached) { setError("Le compte gratuit protège déjà un proche."); return; }
    addRelative({ name: name.trim(), relation });
    setName("");
    setRelation(relationOptions[0]);
    setError("");
    setIsAdding(false);
  };

  const handleRelay = () => {
    if (!selectedRelative) return;
    setRelaySent(true);
    addAlert({
      title: `Message relayé à ${selectedRelative.name}`,
      detail: "Une version simple et rassurante lui a été préparée.",
      kind: "relay",
    });
  };

  return (
    <div className="page-stack family-page">
      <div className="page-heading family-heading">
        <div>
          <SectionKicker><span className="kicker-dot warm-dot" /> Pour ceux qu’on aime</SectionKicker>
          <h1>Le <em>Bouclier Famille</em></h1>
          <p>Ajoutez un proche et devenez son point de repère quand un message lui semble étrange.</p>
        </div>
        <div className="family-heart-mark"><HeartHandshake size={30} /><span>La sécurité<br />se partage</span></div>
      </div>

      <section className="family-hero-card">
        <div className="family-hero-orbit orbit-one" />
        <div className="family-hero-orbit orbit-two" />
        <div className="family-hero-copy">
          <span className="eyebrow light-eyebrow">VOTRE CERCLE DE CONFIANCE</span>
          <h2>Un regard attentif,<br /><span>même à distance.</span></h2>
          <p>Quand un proche reçoit un message douteux, vous êtes là pour l’aider à y voir plus clair.</p>
        </div>
        <div className="family-hero-illustration"><HeartHandshake size={72} strokeWidth={1.3} /></div>
      </section>

      <section className="family-section">
        <div className="section-title-row">
          <div><SectionKicker>01 · Vos proches</SectionKicker><h2>Le cercle protégé</h2></div>
          <span className="count-chip">{relatives.length}{isPremium ? "" : "/1"}</span>
        </div>
        {relatives.length === 0 ? (
          <div className="empty-family">
            <div className="empty-family-icon"><UserRound size={23} /></div>
            <div><strong>Votre cercle est encore vide.</strong><p>Commencez par ajouter la personne que vous voulez rassurer.</p></div>
            <button type="button" className="button-coral button-small" onClick={() => setIsAdding(true)} data-testid="button-add-relative-empty"><Plus size={16} /> Ajouter</button>
          </div>
        ) : (
          <div className="relative-list">
            {relatives.map((relative) => (
              <div className="relative-card" key={relative.id} data-testid={`card-relative-${relative.id}`}>
                <RelativeAvatar name={relative.name} />
                <div className="relative-info"><strong>{relative.name}</strong><span>{relative.relation} · <span className="protected-text"><Check size={12} /> Protégé·e</span></span></div>
                <button type="button" className="icon-button subtle-icon-button" onClick={() => removeRelative(relative.id)} aria-label={`Supprimer ${relative.name}`} data-testid={`button-remove-relative-${relative.id}`}><Trash2 size={16} /></button>
              </div>
            ))}
            <button type="button" onClick={() => { setError(""); setIsAdding(true); }} className={`add-relative-row ${limitReached ? "add-relative-disabled" : ""}`} disabled={limitReached} data-testid="button-add-relative">
              <Plus size={16} /><span>{limitReached ? "Passez à Plus pour ajouter un proche" : "Ajouter un autre proche"}</span>
            </button>
          </div>
        )}
        {isAdding && (
          <div className="add-relative-form" data-testid="form-add-relative">
            <div className="form-header"><div><span className="eyebrow">NOUVEAU PROCHE</span><h3>Qui souhaitez-vous protéger ?</h3></div><button type="button" className="icon-button" onClick={() => setIsAdding(false)} aria-label="Fermer"><X size={18} /></button></div>
            <div className="form-fields">
              <label><span>Prénom ou nom</span><input value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="Ex. Madeleine" data-testid="input-relative-name" autoFocus /></label>
              <label><span>Relation</span><select value={relation} onChange={(event) => setRelation(event.target.value)} data-testid="select-relative-relation">{relationOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="button" onClick={handleAdd} className="button-primary full-button" data-testid="button-save-relative"><Plus size={17} /> Ajouter au Bouclier</button>
          </div>
        )}
        {relatives.length === 0 && !isAdding && <button type="button" className="understated-add" onClick={() => setIsAdding(true)} data-testid="button-add-relative"><Plus size={16} /> Ajouter un proche</button>}
      </section>

      <section className="family-section relay-section">
        <div className="section-title-row"><div><SectionKicker>02 · Relais simplifié</SectionKicker><h2>Faire passer le bon message</h2></div><MessageCircle size={22} className="section-icon" /></div>
        <div className="relay-demo">
          <div className="relay-demo-top"><span className="relay-sender"><span className="sender-dot" /> Message reçu</span><span className="relay-time">il y a 4 min</span></div>
          <p>« Votre compte sera suspendu. Cliquez ici pour le réactiver immédiatement. »</p>
          <div className="relay-demo-bottom">
            <div className="relay-recipient">
              <RelativeAvatar name={selectedRelative?.name ?? "Proche"} />
              <div><span>À rassurer</span><strong>{selectedRelative?.name ?? "Ajoutez un proche d’abord"}</strong></div>
            </div>
            <button type="button" onClick={handleRelay} className="relay-button" disabled={!selectedRelative || relaySent} data-testid="button-relay-message">
              {relaySent ? <><Check size={16} /> Relais envoyé</> : <><Send size={15} /> Relayer</>}
            </button>
          </div>
          {relaySent && <div className="relay-success"><Check size={15} /> Un message clair a été préparé pour {selectedRelative?.name}.</div>}
        </div>
        <p className="relay-note"><MessageCircle size={14} /> Le relais explique le risque sans reprendre le lien suspect. Simple, calme, utile.</p>
      </section>

      {alerts.length > 0 && (
        <section className="family-section alerts-section">
          <div className="section-title-row"><div><SectionKicker>03 · Veille familiale</SectionKicker><h2>Les dernières alertes</h2></div></div>
          <div className="alert-list">{alerts.slice(0, 4).map((alert) => <div className="alert-row" key={alert.id}><span className={`alert-icon ${alert.kind === "relay" ? "alert-icon-warm" : ""}`}>{alert.kind === "relay" ? <Send size={15} /> : <Shield size={15} />}</span><div><strong>{alert.title}</strong><p>{alert.detail}</p></div><DateLabel date={alert.createdAt} /></div>)}</div>
        </section>
      )}

      {!isPremium && <UpgradeCard />}
      {isPremium && <div className="family-badge"><Check size={14} /> Protégé par ArniCheck <span>·</span> votre cercle est en mode Plus</div>}
    </div>
  );
}