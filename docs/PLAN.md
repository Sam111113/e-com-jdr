# Plan technique

> Créé pour T1.2. Section « Audit » créée pour T1.1. À relire par l'équipe avant de démarrer T1.3.

---

## Audit (T1.1)

**Réalisé par :** l'équipe, depuis l'hôte, le 15/09/2026 (l'agent ne peut pas auditer le VPS depuis son conteneur OpenCode — voir AGENTS.md section 8). **Lecture seule, rien n'a été modifié.**

### Système
| Élément | Valeur |
|---|---|
| OS | Ubuntu 24.04.3 LTS |
| CPU | 2 vCPU |
| RAM | 7,8 Go (6,5 Go disponibles) |
| Disque | 96 Go (89 Go libres) |
| Docker | 29.1.3 |
| Docker Compose | 5.0.0 |

### Conteneurs déjà en place
| Conteneur | Port(s) publiés | Rôle |
|---|---|---|
| `n8n-n8n-1` | `127.0.0.1:5678` | n8n (automatisations), local uniquement |
| `n8n-traefik-1` | `0.0.0.0:80`, `0.0.0.0:443` | Reverse proxy pour n8n, occupe les deux ports HTTP(S) standards |
| `opencode` | `127.0.0.1:4096` | Cet agent, local uniquement |

### Traefik (à ne jamais reconfigurer sans validation)
- Provider Docker, `exposedByDefault=false` : un conteneur n'est routé que s'il porte les labels Traefik adéquats.
- Redirection HTTP → HTTPS automatique.
- Résolveur de certificats `mytlschallenge` (TLS-ALPN-01, pas besoin d'exposer un port 80 séparé pour le challenge).
- Réseau Docker `n8n_default`.
- **Conséquence :** un nouveau site peut obtenir un certificat HTTPS valide en se connectant à `n8n_default` et en portant les bons labels, **sans toucher à la configuration de Traefik**. C'est une option, pas une obligation — voir « Options pour le HTTPS » ci-dessous.

### Ports déjà pris sur l'hôte
22 (SSH), 80, 443, 5678 (n8n), 4096 (OpenCode), 8443 (Tailscale).

### DNS
Domaine pas encore choisi (section 0 d'AGENTS.md). Aucune vérification possible tant que le nom de domaine et le registrar/DNS ne sont pas connus.

### Conséquences pour l'architecture
- Notre Postgres, notre app et Umami tourneront dans **notre propre** `docker compose`, sur un réseau dédié, **sans jamais publier de port Postgres sur l'hôte**.
- Nous ne pouvons pas publier de conteneur sur `0.0.0.0:80` ou `:443` : ces ports appartiennent à Traefik/n8n. Le HTTPS de notre site doit donc soit passer par Traefik existant, soit par une autre solution qui ne réclame pas ces ports (voir plus bas).
- Le sous-domaine `staging.[DOMAINE]` n'existe pas encore : bloquant pour T1.3 tant que le domaine n'est pas choisi et le DNS pas configuré.

---

