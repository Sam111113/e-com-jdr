#!/bin/bash
# Sauvegarde quotidienne (T1.15) : dump Postgres + fichiers privés (kits,
# factures), conservation 14 jours, puis copie hors du VPS (Backblaze B2,
# choisi par l'équipe le 17/09/2026). Lancée par cron sur l'hôte du VPS (voir
# README, section « Sauvegardes »), pas par l'agent ni dans un conteneur —
# ce script attend d'être exécuté là où tourne `docker compose` pour ce
# projet, avec les noms de conteneurs/volumes par défaut de
# `docker/docker-compose.yml` (préfixe `ecomjdr_`/`ecomjdr-`, `name: ecomjdr`).
#
# La copie B2 utilise rclone (https://rclone.org/, installé sur ce VPS) sans
# fichier de configuration séparé : le remote est décrit entièrement par les
# variables d'environnement RCLONE_CONFIG_ECOMJDRB2_* ci-dessous, lues dans
# `.env` par le cron (voir crontab, `set -a && . ./.env`). Tant que
# B2_BUCKET/B2_KEY_ID/B2_APPLICATION_KEY ne sont pas renseignées, cette étape
# est sautée : les sauvegardes locales continuent, mais ne protègent alors
# QUE contre une erreur applicative, pas contre la perte du VPS lui-même.
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

if [[ -n "${B2_BUCKET:-}" && -n "${B2_KEY_ID:-}" && -n "${B2_APPLICATION_KEY:-}" ]]; then
  echo "[$HORODATAGE] Copie hors du VPS vers Backblaze B2 ($B2_BUCKET)..."
  RCLONE_CONFIG_ECOMJDRB2_TYPE=b2 \
  RCLONE_CONFIG_ECOMJDRB2_ACCOUNT="$B2_KEY_ID" \
  RCLONE_CONFIG_ECOMJDRB2_KEY="$B2_APPLICATION_KEY" \
    rclone copy "$DOSSIER_SAUVEGARDES" "ecomjdrb2:$B2_BUCKET" --min-age 1m
else
  echo "[$HORODATAGE] B2_BUCKET/B2_KEY_ID/B2_APPLICATION_KEY absentes : pas de copie hors du VPS (voir docs/A_FAIRE_EQUIPE.md)."
fi

echo "[$HORODATAGE] Sauvegarde terminée : $DOSSIER_SAUVEGARDES/{postgres,prive}-$HORODATAGE.*"
