// Rendu du Markdown des fiches de jeu. react-markdown n'interprète jamais le
// HTML brut : un texte de fiche ne peut pas injecter de script dans la page.
import Markdown from "react-markdown";

export function TexteRiche({ children }: { children: string }) {
  return (
    <div className="texte-riche">
      <Markdown>{children}</Markdown>
    </div>
  );
}
