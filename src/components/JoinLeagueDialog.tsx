
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useJoinLeague } from '@/hooks/useJoinLeague';
import { JoinLeagueForm } from '@/components/JoinLeagueForm';

interface JoinLeagueDialogProps {
  onLeagueJoined?: () => void;
}

export const JoinLeagueDialog: React.FC<JoinLeagueDialogProps> = ({ onLeagueJoined }) => {
  const [open, setOpen] = useState(false);
  
  const {
    inviteCode,
    error,
    isLoading,
    handleInputChange,
    handleSubmit
  } = useJoinLeague(() => {
    setOpen(false);
    onLeagueJoined?.();
  });

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <UserPlus className="h-4 w-4" />
          <span>Join League</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Join a League</DialogTitle>
        </DialogHeader>
        <JoinLeagueForm
          inviteCode={inviteCode}
          error={error}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onSubmit={onSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
