#!/bin/bash
# Sauvegarde quotidienne (T1.15) : dump Postgres + fichiers privés (kits,
# factures), conservation 14 jours. Lancée par cron sur l'hôte du VPS (voir
# README, section « Sauvegardes »), pas par l'agent ni dans un conteneur —
# ce script attend d'être exécuté là où tourne `docker compose` pour ce
# projet, avec les noms de conteneurs/volumes par défaut de
# `docker/docker-compose.yml` (préfixe `ecomjdr_`/`ecomjdr-`, `name: ecomjdr`).
#
# ÉTAPE MANQUANTE, volontairement : la copie hors du VPS. En attente de la
# destination choisie par l'équipe (docs/A_FAIRE_EQUIPE.md). Une fois
# décidée, ajouter par exemple (avec rclone, https://rclone.org/) :
#   rclone copy "$DOSSIER_SAUVEGARDES" mon-remote:ecomjdr-sauvegardes
# juste avant la ligne "Sauvegarde terminée" plus bas. Tant que ce n'est
# pas fait, les sauvegardes ne protègent QUE contre une erreur applicative
# ou une corruption de données, pas contre la perte du VPS lui-même.
set -euo pipefail

DOSSIER_SAUVEGARDES="${SAUVEGARDE_DOSSIER:-/root/sauvegardes-ecomjdr}"
RETENTION_JOURS=14
HORODATAGE=$(date +%Y-%m-%d_%H%M%S)
POSTGRES_USER="${POSTGRES_USER:-ecomjdr}"
POSTGRES_DB="${POSTGRES_DB:-ecomjdr}"

mkdir -p "$DOSSIER_SAUVEGARDES"

echo "[$HORODATAGE] Dump Postgres (base $POSTGRES_DB)..."
# Format personnalisé (-Fc) : compressé, restaurable sélectivement avec
# pg_restore. Connexion par socket local dans le conteneur, sans mot de
# passe à passer ici (voir README pour le détail de l'authentification).
docker exec ecomjdr-postgres-1 pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB" \
  > "$DOSSIER_SAUVEGARDES/postgres-$HORODATAGE.dump"

echo "[$HORODATAGE] Archive des fichiers privés..."
# Volume nommé Docker : ses données vivent sous
# /var/lib/docker/volumes/<nom>/_data sur l'hôte, lisible par root, sans
# avoir besoin de passer par un conteneur.
tar czf "$DOSSIER_SAUVEGARDES/prive-$HORODATAGE.tar.gz" \
  -C /var/lib/docker/volumes/ecomjdr_private_storage/_data .

echo "[$HORODATAGE] Purge des sauvegardes de plus de $RETENTION_JOURS jours..."
find "$DOSSIER_SAUVEGARDES" -maxdepth 1 -type f -mtime "+$RETENTION_JOURS" -delete

echo "[$HORODATAGE] Sauvegarde terminée : $DOSSIER_SAUVEGARDES/{postgres,prive}-$HORODATAGE.*"
