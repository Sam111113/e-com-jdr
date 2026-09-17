"use client";

import { useActionState } from "react";
import { renvoyerLiens, revoquerJetonAdmin } from "./actions";

function BoutonRenvoyer({ orderId }: { orderId: number }) {
  const [etat, action, pendant] = useActionState(
    async () => renvoyerLiens(orderId),
    null as { ok: boolean; message: string } | null,
  );

  if (etat) {
    return <span className="note">{etat.message}</span>;
  }

  return (
    <form action={action}>
      <button type="submit" disabled={pendant} className="btn btn-secondaire btn-petit">
        {pendant ? "Envoi…" : "Renvoyer les liens"}
      </button>
    </form>
  );
}

function BoutonRevoquer({ tokenId }: { tokenId: number }) {
  const [etat, action, pendant] = useActionState(
    async () => revoquerJetonAdmin(tokenId),
    null as { ok: boolean; message: string } | null,
  );

  if (etat) {
    return <span className="note">{etat.message}</span>;
  }

  return (
    <form action={action}>
      <button type="submit" disabled={pendant} className="btn btn-secondaire btn-petit">
        {pendant ? "Révocation…" : "Révoquer"}
      </button>
    </form>
  );
}

export function BoutonsCommande({
  orderId,
  estPayee,
  jetons,
}: {
  orderId: number;
  estPayee: boolean;
  jetons: { id: number; statut: string }[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {estPayee && <BoutonRenvoyer orderId={orderId} />}
      {jetons.map((j) => (
        <span key={j.id} style={{ fontSize: "0.85em" }}>
          Jeton #{j.id} : {j.statut}
          {j.statut === "actif" && <BoutonRevoquer tokenId={j.id} />}
        </span>
      ))}
    </div>
  );
}