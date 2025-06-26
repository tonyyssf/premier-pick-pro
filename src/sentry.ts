// src/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});