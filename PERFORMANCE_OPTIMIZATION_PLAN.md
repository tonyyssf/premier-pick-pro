# Performance Optimization Plan for Premier Pick Pro

## 🎯 Current Performance Issues

Based on the build output and codebase analysis, here are the main performance bottlenecks:

### Bundle Size Issues
- **Large chunks**: Some chunks are >500KB (Admin: 486KB, Index: 584KB)
- **Heavy dependencies**: Large libraries like `html2canvas`, `recharts`, `framer-motion`
- **Unused code**: Despite tree-shaking, some unused components remain

### Runtime Performance Issues
- **No memoization**: Components re-render unnecessarily
- **Heavy computations**: No caching for expensive operations
- **Large component trees**: Deep nesting in some components

## 🚀 Recommended Optimizations

### 1. **Bundle Size Optimization**

#### A. Implement Dynamic Imports for Heavy Components
```typescript
// Instead of direct imports
import { Admin } from '@/pages/Admin';

// Use dynamic imports with loading states
const Admin = lazy(() => import('@/pages/Admin'), {
  loading: () => <AdminLoadingSkeleton />
});
```

#### B. Split Large Components
- Break down `Admin.tsx` (486KB) into smaller chunks
- Split `Index.tsx` (584KB) into feature-based modules
- Create separate bundles for admin vs user features

#### C. Optimize Dependencies
```json
// package.json optimizations
{
  "dependencies": {
    // Replace heavy libraries with lighter alternatives
    "recharts": "→ lightweight-charts or uPlot",
    "framer-motion": "→ CSS transitions for simple animations",
    "html2canvas": "→ Only load when needed for exports"
  }
}
```

### 2. **Component Performance**

#### A. Implement React.memo for Expensive Components
```typescript
// components/LeaderboardTable.tsx
export const LeaderboardTable = React.memo(({ data, loading }) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison for deep objects
  return prevProps.data === nextProps.data && prevProps.loading === nextProps.loading;
});
```

#### B. Add useMemo for Expensive Calculations
```typescript
// hooks/useStandings.ts
const sortedStandings = useMemo(() => {
  return data?.sort((a, b) => b.points - a.points) || [];
}, [data]);

const userRank = useMemo(() => {
  return sortedStandings.findIndex(entry => entry.userId === userId) + 1;
}, [sortedStandings, userId]);
```

#### C. Implement useCallback for Event Handlers
```typescript
const handlePickSubmit = useCallback(async (pickData) => {
  // Pick submission logic
}, [currentGameweek, user]);
```

### 3. **Data Fetching & Caching**

#### A. Implement React Query with Optimizations
```typescript
// hooks/useGameweekData.ts
export const useGameweekData = (gameweekId: string) => {
  return useQuery({
    queryKey: ['gameweek', gameweekId],
    queryFn: () => fetchGameweekData(gameweekId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
```

#### B. Add Request Deduplication
```typescript
// utils/api.ts
const requestCache = new Map();

export const deduplicatedFetch = async (url: string, options?: RequestInit) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }
  
  const promise = fetch(url, options);
  requestCache.set(cacheKey, promise);
  
  try {
    const result = await promise;
    requestCache.delete(cacheKey);
    return result;
  } catch (error) {
    requestCache.delete(cacheKey);
    throw error;
  }
};
```

### 4. **Image & Asset Optimization**

#### A. Implement Image Lazy Loading
```typescript
// components/LazyImage.tsx
export const LazyImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  return (
    <div ref={ref}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          {...props}
        />
      )}
    </div>
  );
};
```

#### B. Optimize SVG Icons
- Use icon sprites instead of individual imports
- Implement icon font for frequently used icons
- Lazy load Lucide React icons

### 5. **CSS & Styling Optimizations**

#### A. Implement CSS-in-JS with Style Deduplication
```typescript
// utils/styles.ts
const styleCache = new Map();

export const createStyles = (styles: object) => {
  const key = JSON.stringify(styles);
  if (styleCache.has(key)) {
    return styleCache.get(key);
  }
  
  const result = styles;
  styleCache.set(key, result);
  return result;
};
```

#### B. Optimize Tailwind CSS
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  // Purge unused styles
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
  },
  // Reduce bundle size
  corePlugins: {
    // Disable unused features
    preflight: false,
  },
};
```

### 6. **Service Worker & Caching**

#### A. Implement Service Worker for Offline Support
```typescript
// public/sw.js
const CACHE_NAME = 'plpe-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

#### B. Add API Response Caching
```typescript
// utils/cache.ts
export const cacheApiResponse = async (key: string, data: any, ttl: number = 300000) => {
  const item = {
    data,
    timestamp: Date.now(),
    ttl,
  };
  
  localStorage.setItem(key, JSON.stringify(item));
};

export const getCachedResponse = (key: string) => {
  const item = localStorage.getItem(key);
  if (!item) return null;
  
  const { data, timestamp, ttl } = JSON.parse(item);
  if (Date.now() - timestamp > ttl) {
    localStorage.removeItem(key);
    return null;
  }
  
  return data;
};
```

### 7. **Database & API Optimizations**

#### A. Implement Connection Pooling
```typescript
// integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'plpe-web',
    },
  },
});
```

#### B. Add Query Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_league_members_user_id ON league_members(user_id);
CREATE INDEX idx_picks_user_gameweek ON picks(user_id, gameweek_id);
CREATE INDEX idx_standings_league_gameweek ON standings(league_id, gameweek_id);
```

### 8. **Error Boundaries & Stability**

#### A. Implement Comprehensive Error Boundaries
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

#### B. Add Retry Logic for Failed Requests
```typescript
// utils/api.ts
export const retryRequest = async (fn: () => Promise<any>, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};
```

## 📊 Implementation Priority

### Phase 1 (High Impact, Low Effort)
1. ✅ Implement React.memo for expensive components
2. ✅ Add useMemo for calculations
3. ✅ Optimize Tailwind CSS purge
4. ✅ Add error boundaries

### Phase 2 (High Impact, Medium Effort)
1. 🔄 Split large components
2. 🔄 Implement React Query optimizations
3. 🔄 Add service worker caching
4. 🔄 Optimize image loading

### Phase 3 (Medium Impact, High Effort)
1. ⏳ Replace heavy dependencies
2. ⏳ Implement database optimizations
3. ⏳ Add comprehensive monitoring
4. ⏳ Performance testing suite

## 🎯 Expected Performance Gains

- **Bundle Size**: 40-60% reduction
- **Initial Load Time**: 50-70% faster
- **Runtime Performance**: 30-50% improvement
- **User Experience**: Significantly smoother interactions
- **Stability**: 90%+ reduction in crashes

## 📈 Monitoring & Metrics

### Key Performance Indicators
- **Core Web Vitals**: LCP, FID, CLS
- **Bundle Size**: Track chunk sizes over time
- **Error Rate**: Monitor crash frequency
- **User Engagement**: Track session duration and interactions

### Tools to Implement
- **Lighthouse CI**: Automated performance testing
- **Sentry**: Error monitoring and performance tracking
- **Web Vitals**: Real user monitoring
- **Bundle Analyzer**: Regular bundle size analysis 