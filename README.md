<p align="center">
  <img src="public/foglight.svg" alt="Foglight" width="72" />
</p>

# Custom Relevance

A ranking playground. Type a list of things and a few plain-language factors, and Jev scores every pair live into a weighted ranking.

[jev.foglight.co](https://jev.foglight.co)

## Analytics

PostHog is enabled when `NEXT_PUBLIC_POSTHOG_KEY` is present at build time. The
browser client uses PostHog's cookieless server-hash mode, with person profiles,
autocapture, and session recording disabled so ranking text is not collected.
Requests are proxied through `/ingest` to the US PostHog region.

For Railway's Dockerfile builder, add `NEXT_PUBLIC_POSTHOG_KEY` to the service's
Variables and redeploy. The value is a public project token and is compiled into
the browser bundle during `pnpm build`.

In PostHog, enable **Project Settings > Web analytics > Cookieless server hash
mode**. PostHog ignores cookieless events until this project setting is enabled.
