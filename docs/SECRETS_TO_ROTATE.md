# Secrets that need rotation

The following credentials were committed to git history at some point and
must be rotated before this repository can be considered safe.

## Tracked file removed from git
- `apps/seller-ui/.env.local` — contains `IMAGEKIT_PRIVATE_KEY` and a
  publishable key. Visible in git history.
- `apps/admin-ui/.env.local` — only contains a non-secret public URL, but
  was untracked anyway to keep environment files out of git.

## Credentials currently in working-tree `.env` (untracked, but rotate anyway)
The local `.env` is in `.gitignore` and was not pushed, but the values are
in long-term local memory and inside CI logs / EC2 host envs. Treat as
compromised:

| Service | What to rotate | Where |
|---|---|---|
| MongoDB Atlas | Password for user `pgmsadeep` | Atlas → Database Access |
| Upstash Redis | Database token (`REDIS_PASSWORD`, `UPSTASH_REDIS_REST_TOKEN`) | Upstash console → Database → Reset password |
| Gmail SMTP | App password `bfxr wzmt jalb grxp` | Google Account → Security → App passwords → revoke + regenerate |
| Stripe | `STRIPE_SECRET_KEY` (sk_test_…) | Stripe dashboard → Developers → API keys → Roll key |
| Stripe | `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks → endpoint → Reveal/Roll signing secret |
| ImageKit | `IMAGEKIT_PRIVATE_KEY` | ImageKit dashboard → Developer Options → Reset private key |
| JWT | `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | Generate new random 64-byte secrets, e.g. `openssl rand -hex 64`. Rotating logs out all current sessions. |
| Admin seed | `ADMIN_SEED_PASSWORD` | Pick a new strong value before next deploy |

## After rotation
1. Update local `.env` with new values.
2. Update GitHub Actions secrets (Repository → Settings → Secrets) for any
   keys consumed by CI.
3. Update `/opt/<service>/.env` on each EC2 host (the deploy workflow
   reads from there).
4. Restart all services so they pick up the new secrets.

## Going forward
- Never commit any `.env*` file. The updated `.gitignore` blocks all of
  them except `*.env.example`.
- Use GitHub Secrets for CI and AWS Secrets Manager / SSM Parameter Store
  for runtime values on EC2.
