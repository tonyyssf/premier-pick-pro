import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimize build output
    target: 'es2015',
    minify: 'esbuild', // Use esbuild instead of terser for faster builds
    // Remove terserOptions since we're using esbuild
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge'],
          
          // Feature chunks
          'admin': [
            './src/pages/Admin',
            './src/components/AdminDataTable',
            './src/components/SystemMonitoringDashboard',
          ],
          'analytics': [
            './src/pages/Insights',
            './src/components/AnalyticsDashboard',
          ],
          'leaderboards': [
            './src/pages/OptimizedLeaderboards',
            './src/components/StandingsTable',
            './src/components/RealtimeStandingsTable',
          ],
          'picks': [
            './src/components/WeeklyPicks',
            './src/components/PickConfirmationCard',
            './src/components/WeeklyPicksFixtureList',
          ],
        },
        
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Source maps for debugging
    sourcemap: false, // Disable in production for smaller bundles
    
    // Optimize CSS
    cssCodeSplit: true,
    
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'date-fns',
      'clsx',
      'tailwind-merge',
    ],
    exclude: [
      // Exclude heavy dependencies that should be lazy loaded
      'html2canvas',
      'recharts',
      'framer-motion',
    ],
  },
  
  // Development server optimization
  server: {
    port: 8080,
    host: true,
    // Enable HMR optimization
    hmr: {
      overlay: false, // Disable error overlay for better performance
    },
  },
  
  // Preview server optimization
  preview: {
    port: 4173,
    host: true,
  },
  
  // Environment variables
  define: {
    // Optimize for production
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  
  // CSS optimization
  css: {
    // Enable CSS modules for better tree shaking
    modules: {
      localsConvention: 'camelCase',
    },
    // PostCSS optimization handled by Vite automatically
  },
  
  // Experimental features for better performance
  experimental: {
    // Enable renderBuiltUrl for better asset handling
    renderBuiltUrl: (filename, { hostType }) => {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    },
  },
});
