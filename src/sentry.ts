// src/sentry.ts  – v8-compatible
import * as Sentry from '@sentry/react';
import { browserTracingIntegration } from '@sentry/react';

console.log('Sentry DSN at runtime →', import.meta.env.VITE_SENTRY_DSN);
console.log('Environment mode →', import.meta.env.MODE);

// Only initialize Sentry if DSN is available and we're not in development
if (import.meta.env.VITE_SENTRY_DSN && import.meta.env.MODE !== 'development') {
  try {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [browserTracingIntegration()],
      tracesSampleRate: 1.0,
      debug: import.meta.env.MODE === 'development',
    });
    console.log('Sentry initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Sentry:', error);
  }
} else {
  console.log('Sentry initialization skipped for development');
}
