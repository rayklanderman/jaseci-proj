# Security Guidelines

This repository is intentionally public so mentors and evaluators can review the project. To keep the deployment safe while still sharing the code, please follow the practices below.

## 🔑 Secret Management

- **Never commit real secrets**. Keep `.env` files local and use the environment-variable managers provided by Vercel, Railway, or your preferred host.
- Regenerate API keys (for example `GEMINI_API_KEY`) if they are ever exposed in logs, screenshots, or pull requests.
- When opening issues or PRs, redact hostnames, database URLs, and tokens.

## 🧰 Recommended Tooling

- Install [`git-secrets`](https://github.com/awslabs/git-secrets) or [`gitleaks`](https://github.com/gitleaks/gitleaks) and run them before every push.
- CI suggestion: add a secrets scan step (e.g. `gitleaks detect --source .`) so automated checks block risky commits.

## 🌐 Deployment Hardening

- **Vercel**: manage secrets with `vercel env`, enable preview protection (password or login), and prune unused deployments.
- **Railway**: configure environment variables in the dashboard, prefer managed PostgreSQL credentials, and consider adding UptimeRobot or similar monitors so the free tier stays warm and observable.
- Restrict CORS in production to your live domain (`https://ai-task-manager-rho.vercel.app/`) or an explicit regex via `FRONTEND_ORIGIN_REGEX`.

## 🔁 Rotation & Monitoring

- Rotate credentials on a schedule (quarterly is a good baseline) or immediately after any suspected leak.
- Review access logs in Vercel/Railway for unusual traffic and ensure GitHub has two-factor authentication enabled.

## 🛠️ Dependency Hygiene

- Run `yarn audit` / `npm audit` and `pip list --outdated` periodically. Keep `requirements.txt` and `package.json` patched to avoid known CVEs.
- Consider using GitHub Dependabot alerts to get notified about vulnerable dependencies.

## 📣 Responsible Disclosure

If you discover a security issue, please email the maintainer directly instead of opening a public issue. Provide:

1. A description of the vulnerability.
2. Steps to reproduce.
3. Suggested remediation ideas if available.

The maintainer will acknowledge within 48 hours and coordinate a fix. Thank you for helping keep the project safe!
