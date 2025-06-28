
import { useState } from 'react';
import { z } from 'zod';
import { validateAndSanitizeLeague } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  name: string;
  description: string;
  isPublic: boolean;
  maxMembers: number;
}

export const useLeagueValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = (formData: FormData) => {
    try {
      validateAndSanitizeLeague(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      toast({
        title: "Validation Error",
        description: "Please correct the errors below.",
        variant: "destructive",
      });
      return false;
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateForm,
    clearError,
    clearAllErrors
  };
};
