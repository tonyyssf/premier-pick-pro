import { useState, useCallback } from 'react';
import { validateSecureInput, setCSRFToken, verifyCSRFToken } from '@/utils/enhancedSecurityUtils';
import { securityLogger } from '@/utils/securityLogger';
import { useToast } from '@/hooks/use-toast';

interface SecureFormConfig {
  maxLength?: number;
  requireCSRF?: boolean;
  sanitizeHtml?: boolean;
}

interface SecureFormState {
  data: Record<string, any>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  csrfToken?: string;
}

export const useSecureForm = (config: SecureFormConfig = {}) => {
  const { toast } = useToast();
  const [formState, setFormState] = useState<SecureFormState>({
    data: {},
    errors: {},
    isSubmitting: false,
    csrfToken: config.requireCSRF ? setCSRFToken() : undefined
  });

  const setValue = useCallback((field: string, value: any) => {
    try {
      // Validate and sanitize input if it's a string
      let sanitizedValue = value;
      if (typeof value === 'string' && value.length > 0) {
        sanitizedValue = validateSecureInput(value, config.maxLength);
      }

      setFormState(prev => ({
        ...prev,
        data: { ...prev.data, [field]: sanitizedValue },
        errors: { ...prev.errors, [field]: '' } // Clear error when user types
      }));
    } catch (error: any) {
      securityLogger.log({
        type: 'invalid_input',
        details: {
          operation: 'form_validation_failed',
          field,
          error: error.message,
          valueLength: typeof value === 'string' ? value.length : 0
        }
      });

      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: error.message }
      }));

      toast({
        title: "Invalid Input",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [config.maxLength, toast]);

  const setError = useCallback((field: string, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      errors: {}
    }));
  }, []);

  const validateForm = useCallback((requiredFields: string[] = []): boolean => {
    const errors: Record<string, string> = {};

    // Check required fields
    for (const field of requiredFields) {
      if (!formState.data[field] || (typeof formState.data[field] === 'string' && formState.data[field].trim() === '')) {
        errors[field] = `${field.replace('_', ' ')} is required`;
      }
    }

    // Verify CSRF token if required
    if (config.requireCSRF && formState.csrfToken && !verifyCSRFToken(formState.csrfToken)) {
      errors.csrf = 'Security token invalid. Please refresh and try again.';
      securityLogger.log({
        type: 'suspicious_activity',
        details: {
          operation: 'csrf_validation_failed',
          hasToken: !!formState.csrfToken
        }
      });
    }

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [formState.data, formState.csrfToken, config.requireCSRF]);

  const submitForm = useCallback(async (
    submitFn: (data: Record<string, any>) => Promise<void>,
    requiredFields: string[] = []
  ) => {
    if (formState.isSubmitting) return;

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      if (!validateForm(requiredFields)) {
        return;
      }

      // Log form submission attempt
      securityLogger.log({
        type: 'suspicious_activity',
        details: {
          operation: 'secure_form_submission',
          fieldCount: Object.keys(formState.data).length,
          hasCSRF: !!formState.csrfToken
        }
      });

      await submitFn(formState.data);

      // Reset form on successful submission
      setFormState(prev => ({
        ...prev,
        data: {},
        errors: {},
        csrfToken: config.requireCSRF ? setCSRFToken() : undefined
      }));

    } catch (error: any) {
      securityLogger.log({
        type: 'invalid_input',
        details: {
          operation: 'form_submission_failed',
          error: error.message
        }
      });

      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.data, formState.csrfToken, formState.isSubmitting, config.requireCSRF, validateForm, toast]);

  const resetForm = useCallback(() => {
    setFormState({
      data: {},
      errors: {},
      isSubmitting: false,
      csrfToken: config.requireCSRF ? setCSRFToken() : undefined
    });
  }, [config.requireCSRF]);

  return {
    data: formState.data,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    csrfToken: formState.csrfToken,
    setValue,
    setError,
    clearErrors,
    validateForm,
    submitForm,
    resetForm
  };
};