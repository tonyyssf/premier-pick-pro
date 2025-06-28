
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useCreateLeague } from '@/hooks/useCreateLeague';
import { useLeagueValidation } from '@/hooks/useLeagueValidation';
import { CreateLeagueDialogTrigger } from '@/components/CreateLeagueDialogTrigger';
import { CreateLeagueDialogContent } from '@/components/CreateLeagueDialogContent';

interface CreateLeagueDialogProps {
  onLeagueCreated?: () => void;
}

export const CreateLeagueDialog: React.FC<CreateLeagueDialogProps> = ({ onLeagueCreated }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    maxMembers: 50
  });

  const {
    isLoading,
    createdLeague,
    userLeagueCount,
    checkingLimit,
    canCreateLeague,
    maxLeagues,
    checkUserLeagueCount,
    createLeague,
    resetCreatedLeague
  } = useCreateLeague(onLeagueCreated);

  const { errors, validateForm, clearError, clearAllErrors } = useLeagueValidation();

  useEffect(() => {
    if (open) {
      checkUserLeagueCount();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    await createLeague(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    clearError(field);
  };

  const handleClose = () => {
    setOpen(false);
    resetCreatedLeague();
    clearAllErrors();
    setFormData({
      name: '',
      description: '',
      isPublic: false,
      maxMembers: 50
    });
  };

  return (
    <Dialog open={open} onOpenChange={open ? handleClose : setOpen}>
      <DialogTrigger asChild>
        <CreateLeagueDialogTrigger canCreateLeague={canCreateLeague} />
      </DialogTrigger>
      <CreateLeagueDialogContent
        createdLeague={createdLeague}
        checkingLimit={checkingLimit}
        canCreateLeague={canCreateLeague}
        formData={formData}
        errors={errors}
        isLoading={isLoading}
        userLeagueCount={userLeagueCount}
        maxLeagues={maxLeagues}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={() => setOpen(false)}
        onClose={handleClose}
      />
    </Dialog>
  );
};
