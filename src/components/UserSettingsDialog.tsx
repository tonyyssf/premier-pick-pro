
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserSettingsLoading } from './UserSettingsLoading';
import { UserSettingsForm } from './UserSettingsForm';
import { useUserSettings } from '@/hooks/useUserSettings';

interface UserSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserSettingsDialog: React.FC<UserSettingsDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const {
    formData,
    errors,
    loading,
    loadingProfile,
    handleSave,
    handleInputChange
  } = useUserSettings(open);

  const handleSaveAndClose = async () => {
    const success = await handleSave();
    if (success) {
      onOpenChange(false);
    }
  };

  if (loadingProfile) {
    return <UserSettingsLoading open={open} onOpenChange={onOpenChange} />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>
        
        <UserSettingsForm
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={handleInputChange}
          onSave={handleSaveAndClose}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
