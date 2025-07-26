import { track } from '@vercel/analytics';

// Custom analytics tracking for PLPE app
export const analytics = {
  // Track user registration
  trackSignUp: (method: 'email' | 'google') => {
    track('user_signup', { method });
  },

  // Track user login
  trackSignIn: (method: 'email' | 'google') => {
    track('user_signin', { method });
  },

  // Track pick submission
  trackPickSubmission: (gameweekNumber: number, teamName: string) => {
    track('pick_submitted', {
      gameweek: gameweekNumber,
      team: teamName
    });
  },

  // Track league creation
  trackLeagueCreation: (leagueType: 'public' | 'private') => {
    track('league_created', { type: leagueType });
  },

  // Track league joining
  trackLeagueJoin: (leagueId: string) => {
    track('league_joined', { leagueId });
  },

  // Track admin actions
  trackAdminAction: (action: string) => {
    track('admin_action', { action });
  },

  // Track page views (custom)
  trackPageView: (page: string) => {
    track('page_view', { page });
  },

  // Track feature usage
  trackFeatureUsage: (feature: string) => {
    track('feature_used', { feature });
  },

  // Track errors
  trackError: (error: string, context?: string) => {
    track('error_occurred', { error, context });
  },

  // Track performance metrics
  trackPerformance: (metric: string, value: number) => {
    track('performance_metric', { metric, value });
  },

  // NEW: Track insights analytics
  trackInsightsView: (isPremium: boolean) => {
    track('insights_viewed', {
      isPremium,
      timestamp: new Date().toISOString()
    });
  },

  trackInsightsChartInteraction: (chartType: 'heatmap' | 'efficiency' | 'projections', action: 'view' | 'hover' | 'click') => {
    track('insights_chart_interaction', {
      chartType,
      action,
      timestamp: new Date().toISOString()
    });
  },

  trackInsightsExport: (format: 'csv' | 'json' | 'pdf') => {
    track('insights_export', {
      format,
      timestamp: new Date().toISOString()
    });
  },

  // NEW: Track premium upgrade flow
  trackPremiumUpgradeStarted: (source: 'insights_banner' | 'chart_overlay' | 'export_button') => {
    track('premium_upgrade_started', {
      source,
      timestamp: new Date().toISOString()
    });
  },

  trackPremiumUpgradeCompleted: (paymentMethod: string, amount: number) => {
    track('premium_upgrade_completed', {
      paymentMethod,
      amount,
      timestamp: new Date().toISOString()
    });
  },

  trackPremiumUpgradeCancelled: (source: string) => {
    track('premium_upgrade_cancelled', {
      source,
      timestamp: new Date().toISOString()
    });
  },

  trackPremiumUpgradeFailed: (error: string, step: string) => {
    track('premium_upgrade_failed', {
      error,
      step,
      timestamp: new Date().toISOString()
    });
  },

  // NEW: Track user engagement with premium features
  trackPremiumFeatureUsage: (feature: 'projections' | 'full_charts' | 'csv_export' | 'advanced_analytics') => {
    track('premium_feature_used', {
      feature,
      timestamp: new Date().toISOString()
    });
  },

  // NEW: Track insights performance
  trackInsightsLoadTime: (loadTime: number, chartType?: string) => {
    track('insights_load_time', {
      loadTime,
      chartType,
      timestamp: new Date().toISOString()
    });
  },

  // NEW: Track user retention signals
  trackUserEngagement: (action: 'insights_view' | 'chart_interaction' | 'export_data' | 'premium_upgrade') => {
    track('user_engagement', {
      action,
      timestamp: new Date().toISOString()
    });
  }
};

// Hook for easy analytics usage in components
export const useAnalytics = () => {
  return {
    track: (event: string, properties?: Record<string, any>) => {
      track(event, properties);
    },
    ...analytics
  };
}; 