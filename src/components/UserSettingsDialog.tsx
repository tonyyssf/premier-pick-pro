
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
import { PhoneNumberInput } from './PhoneNumberInput';
import { validateAndSanitizeUser } from '@/utils/validation';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      // Validate using our validation utility
      validateAndSanitizeUser({
        username: formData.username,
        name: formData.name
      });
    } catch (error: any) {
      if (error.issues) {
        error.issues.forEach((issue: any) => {
          newErrors[issue.path[0]] = issue.message;
        });
      } else {
        newErrors.general = error.message;
      }
    }

    // Additional phone number validation
    if (formData.phone_number && formData.phone_number.length < 10) {
      newErrors.phone_number = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user) return;

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Saving profile data:', formData);

      // Update profile table with sanitized data
      const sanitizedData = validateAndSanitizeUser({
        username: formData.username,
        name: formData.name
      });

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: sanitizedData.username,
          name: sanitizedData.name,
          phone_number: formData.phone_number || null,
          country_code: formData.country_code,
          sms_reminders_enabled: formData.sms_reminders_enabled
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      console.log('Profile updated successfully');

      toast({
        title: "Settings updated",
        description: "Your profile has been updated successfully.",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error updating settings",
        description: error.message || 'An unexpected error occurred',
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
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
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
            <Label htmlFor="username">
              Username
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="name">
              Name
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <PhoneNumberInput
            value={formData.phone_number}
            onChange={(value) => handleInputChange('phone_number', value)}
            countryCode={formData.country_code}
            onCountryCodeChange={(code) => handleInputChange('country_code', code)}
            label="Phone Number (Optional)"
            placeholder="(555) 123-4567"
          />
          {errors.phone_number && (
            <p className="text-xs text-red-500">{errors.phone_number}</p>
          )}

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
