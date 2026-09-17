import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (projectToken) {
  posthog.init(projectToken, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-06-25",
    // PostHog's server-hash mode avoids cookies, local storage, and session
    // storage. It must also be enabled in Project Settings > Web analytics.
    cookieless_mode: "always",
    person_profiles: "never",
    respect_dnt: true,
    // Rankings and factors may contain user-provided text. Keep those out of
    // autocaptured DOM events and recordings.
    autocapture: false,
    disable_session_recording: true,
  });
}
