import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Crown } from 'lucide-react';
import { useAdminUpgrade } from '@/hooks/useAdminUpgrade';

export const AdminUpgradeUser = () => {
  const [email, setEmail] = useState('anthonyyoussef22@gmail.com');
  const { upgradeUser, isLoading } = useAdminUpgrade();

  const handleUpgrade = async () => {
    if (!email.trim()) return;
    await upgradeUser(email.trim());
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Admin: Upgrade User to Premium
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">User Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>
        
        <Button 
          onClick={handleUpgrade}
          disabled={isLoading || !email.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Upgrading...
            </>
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};