import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Wifi, Database, Server } from 'lucide-react';

interface UserFriendlyErrorProps {
  error?: Error | string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  variant?: 'network' | 'data' | 'server' | 'general';
}

export const UserFriendlyError: React.FC<UserFriendlyErrorProps> = ({
  error,
  title,
  description,
  onRetry,
  variant = 'general'
}) => {
  // Determine error type and provide appropriate messaging
  const getErrorInfo = () => {
    const errorMessage = typeof error === 'string' ? error : error?.message || '';
    
    // Network-related errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
      return {
        icon: <Wifi className="h-5 w-5" />,
        title: title || "Connection Issue",
        description: description || "It looks like you're having trouble connecting to our servers. This might be a temporary network issue.",
        action: "Check your internet connection and try again."
      };
    }
    
    // Database/data errors
    if (errorMessage.includes('database') || errorMessage.includes('data') || errorMessage.includes('query')) {
      return {
        icon: <Database className="h-5 w-5" />,
        title: title || "Data Loading Issue",
        description: description || "We're having trouble loading your data right now. This might be a temporary issue with our database.",
        action: "Try refreshing the page in a few moments."
      };
    }
    
    // Server errors
    if (errorMessage.includes('500') || errorMessage.includes('server') || errorMessage.includes('internal')) {
      return {
        icon: <Server className="h-5 w-5" />,
        title: title || "Server Issue",
        description: description || "Our servers are experiencing some issues right now. We're working to fix this as quickly as possible.",
        action: "Please try again in a few minutes."
      };
    }
    
    // Default/general errors
    return {
      icon: <AlertCircle className="h-5 w-5" />,
      title: title || "Something went wrong",
      description: description || "We encountered an unexpected error. This might be a temporary issue.",
      action: "Try refreshing the page or contact support if the problem persists."
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          {errorInfo.icon}
          {errorInfo.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {errorInfo.description}
        </p>
        
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          <strong>What you can do:</strong> {errorInfo.action}
        </div>

        <div className="flex gap-2">
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>

        {/* Show technical details in development */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
              Technical Details (Development)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {typeof error === 'string' ? error : error.message}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

// Specialized error components for common scenarios
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <UserFriendlyError 
    variant="network"
    onRetry={onRetry}
  />
);

export const DataError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <UserFriendlyError 
    variant="data"
    onRetry={onRetry}
  />
);

export const ServerError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <UserFriendlyError 
    variant="server"
    onRetry={onRetry}
  />
); 