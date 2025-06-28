
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CreateLeagueDialogTriggerProps {
  canCreateLeague: boolean;
}

export const CreateLeagueDialogTrigger: React.FC<CreateLeagueDialogTriggerProps> = ({ 
  canCreateLeague 
}) => {
  return (
    <Button className="flex items-center space-x-2" disabled={!canCreateLeague}>
      <Plus className="h-4 w-4" />
      <span>Create League</span>
    </Button>
  );
};
