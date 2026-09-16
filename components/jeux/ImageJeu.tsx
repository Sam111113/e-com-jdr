// Image d'un jeu en AVIF/WebP, dans plusieurs largeurs produites par l'import
// (lib/games/images.ts). Pas de next/image : son optimiseur relit les images
// par une requête interne, que la protection du staging (proxy.ts) refuserait.
import { srcSet } from "@/lib/games/images";

interface Props {
  chemin: string;
  largeurs: readonly number[];
  alt: string;
  sizes: string;
  prioritaire?: boolean;
}

export function ImageJeu({ chemin, largeurs, alt, sizes, prioritaire = false }: Props) {
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(chemin, largeurs, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(chemin, largeurs, "webp")} sizes={sizes} />
      <img
        src={chemin}
        alt={alt}
        loading={prioritaire ? "eager" : "lazy"}
        fetchPriority={prioritaire ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}
