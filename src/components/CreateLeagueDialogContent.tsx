
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateLeagueForm } from '@/components/CreateLeagueForm';
import { LeagueSuccessDialog } from '@/components/LeagueSuccessDialog';
import { LeagueLimitWarning } from '@/components/LeagueLimitWarning';

interface FormData {
  name: string;
  description: string;
  isPublic: boolean;
  maxMembers: number;
}

interface CreatedLeague {
  id: string;
  name: string;
  invite_code: string;
}

interface CreateLeagueDialogContentProps {
  createdLeague: CreatedLeague | null;
  checkingLimit: boolean;
  canCreateLeague: boolean;
  formData: FormData;
  errors: Record<string, string>;
  isLoading: boolean;
  userLeagueCount: number;
  maxLeagues: number;
  onInputChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onClose: () => void;
}

export const CreateLeagueDialogContent: React.FC<CreateLeagueDialogContentProps> = ({
  createdLeague,
  checkingLimit,
  canCreateLeague,
  formData,
  errors,
  isLoading,
  userLeagueCount,
  maxLeagues,
  onInputChange,
  onSubmit,
  onCancel,
  onClose
}) => {
  if (createdLeague) {
    return (
      <LeagueSuccessDialog
        createdLeague={createdLeague}
        onClose={onClose}
      />
    );
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-gray-900">Create New League</DialogTitle>
      </DialogHeader>

      {checkingLimit ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plpe-purple mr-3"></div>
          <span className="text-gray-600">Checking league limit...</span>
        </div>
      ) : !canCreateLeague ? (
        <LeagueLimitWarning
          maxLeagues={maxLeagues}
          onClose={onCancel}
        />
      ) : (
        <CreateLeagueForm
          formData={formData}
          errors={errors}
          isLoading={isLoading}
          userLeagueCount={userLeagueCount}
          maxLeagues={maxLeagues}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    </DialogContent>
  );
};
