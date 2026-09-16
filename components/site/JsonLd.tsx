// Données structurées JSON-LD (T1.12). `JSON.stringify` peut produire la
// séquence `</script>` (par ex. dans un pitch ou une histoire de jeu) qui
// terminerait prématurément la balise ; `<` est échappé en `<` pour
// l'empêcher, une pratique standard pour ce genre d'injection JSON.
export function serialiserJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiserJsonLd(data) }} />;
}
