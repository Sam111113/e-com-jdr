#!/bin/bash
# Restauration de la base Postgres depuis un dump de docker/sauvegarde.sh
# (T1.15). Voir README, section « Sauvegardes », pour la restauration des
# fichiers privés (un simple tar) et pour la procédure complète testée.
#
# Usage : docker/restauration.sh <dump.dump> [base-cible]
# base-cible : par défaut la base réelle (POSTGRES_DB ou "ecomjdr") — pour
# tester une restauration sans toucher aux données en production, créer une
# base à part et la passer ici (voir README).
set -euo pipefail

DUMP="$1"
BASE_CIBLE="${2:-${POSTGRES_DB:-ecomjdr}}"
POSTGRES_USER="${POSTGRES_USER:-ecomjdr}"

if [ ! -f "$DUMP" ]; then
  echo "Fichier de dump introuvable : $DUMP" >&2
  exit 1
fi

echo "Restauration de '$BASE_CIBLE' depuis $DUMP..."
# --clean --if-exists : repart d'une base vide sans échouer si des objets
# n'existent pas encore (première restauration). --no-owner : le rôle
# propriétaire au moment du dump peut différer de celui de l'environnement
# cible.
docker exec -i ecomjdr-postgres-1 pg_restore --clean --if-exists --no-owner \
  -U "$POSTGRES_USER" -d "$BASE_CIBLE" < "$DUMP"

echo "Base '$BASE_CIBLE' restaurée."
