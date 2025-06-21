
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone } from 'lucide-react';

interface UserSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserSettingsDialog: React.FC<UserSettingsDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone_number: '',
    country_code: '+1',
    sms_reminders_enabled: false
  });

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username, name, phone_number, country_code, sms_reminders_enabled')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setFormData({
          username: profile?.username || '',
          name: profile?.name || '',
          email: user?.email || '',
          phone_number: profile?.phone_number || '',
          country_code: profile?.country_code || '+1',
          sms_reminders_enabled: profile?.sms_reminders_enabled || false
        });
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    if (open && user) {
      loadProfile();
    }
  }, [open, user, toast]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          name: formData.name,
          phone_number: formData.phone_number
        }
      });

      if (authError) throw authError;

      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          name: formData.name,
          phone_number: formData.phone_number,
          country_code: formData.country_code,
          sms_reminders_enabled: formData.sms_reminders_enabled
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Settings updated",
        description: "Your profile has been updated successfully.",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loadingProfile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Settings</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2">
              <Input
                value={formData.country_code}
                onChange={(e) => handleInputChange('country_code', e.target.value)}
                className="w-20"
                placeholder="+1"
              />
              <Input
                id="phone"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="(555) 123-4567"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500">Used for SMS reminders about upcoming deadlines</p>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <Label htmlFor="sms-reminders" className="font-medium">SMS Reminders</Label>
                <p className="text-xs text-gray-500">Get notified before pick deadlines</p>
              </div>
            </div>
            <Switch
              id="sms-reminders"
              checked={formData.sms_reminders_enabled}
              onCheckedChange={(checked) => handleInputChange('sms_reminders_enabled', checked)}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
