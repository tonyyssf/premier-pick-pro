// src/sentry.ts  – v8-compatible
import * as Sentry from '@sentry/react';
import { browserTracingIntegration } from '@sentry/react';   // ✅ this replaces BrowserTracing

console.log('Sentry DSN at runtime →', import.meta.env.VITE_SENTRY_DSN);

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [browserTracingIntegration()],               // ✅ call the function
  tracesSampleRate: 1.0,
  debug: true,
});
