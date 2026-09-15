#!/bin/sh
# Exécuté une seule fois, à la création du volume Postgres, par l'image
# officielle postgres (tout script dans /docker-entrypoint-initdb.d).
# Umami a besoin de sa propre base sur le même serveur Postgres 18
# (voir docs/PLAN.md, "Vue d'ensemble — staging").
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE "${UMAMI_POSTGRES_DB:-umami}";
EOSQL
