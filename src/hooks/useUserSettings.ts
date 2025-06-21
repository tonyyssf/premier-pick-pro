
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateAndSanitizeUser } from '@/utils/validation';

interface FormData {
  username: string;
  name: string;
  email: string;
  phone_number: string;
  country_code: string;
  sms_reminders_enabled: boolean;
}

export const useUserSettings = (open: boolean) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [formData, setFormData] = useState<FormData>({
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

      return true;
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error updating settings",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return {
    formData,
    errors,
    loading,
    loadingProfile,
    handleSave,
    handleInputChange
  };
};
