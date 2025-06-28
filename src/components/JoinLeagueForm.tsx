
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JoinLeagueFormProps {
  inviteCode: string;
  error: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const JoinLeagueForm: React.FC<JoinLeagueFormProps> = ({
  inviteCode,
  error,
  isLoading,
  onInputChange,
  onSubmit,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="inviteCode" className="text-gray-900">Invite Code</Label>
        <Input
          id="inviteCode"
          value={inviteCode}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Enter 6-character code"
          maxLength={6}
          required
          className={`font-mono text-gray-900 placeholder:text-gray-500 ${error ? 'border-red-500' : ''}`}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        <p className="text-sm text-gray-600 mt-1">
          Ask your league creator for the invite code
        </p>
      </div>
      
      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Joining...' : 'Join League'}
        </Button>
      </div>
    </form>
  );
};
