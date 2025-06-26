// src/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/react';

console.log('Sentry DSN at runtime →', import.meta.env.VITE_SENTRY_DSN);   // <-- add this

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  debug: true,                       // <-- makes SDK log to console
});
