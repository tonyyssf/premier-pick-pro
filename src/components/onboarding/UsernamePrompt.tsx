import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserIcon, CheckIcon } from 'lucide-react';

interface UsernamePromptProps {
  onComplete: (username: string) => Promise<boolean>;
  onSkip?: () => void;
}

export const UsernamePrompt: React.FC<UsernamePromptProps> = ({ onComplete, onSkip }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError('');

    const success = await onComplete(username.trim());
    if (!success) {
      setError('Failed to update username. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <UserIcon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Choose Your Username</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick a unique username to identify yourself in leagues and on leaderboards
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading || !username.trim()}
            >
              {loading ? (
                "Setting Username..."
              ) : (
                <>
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Set Username
                </>
              )}
            </Button>
            {onSkip && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onSkip}
                disabled={loading}
              >
                Skip for Now
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};