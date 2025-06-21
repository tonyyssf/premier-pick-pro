
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateAndSanitizeLeague } from '@/utils/validation';
import { leagueCreateLimiter, checkRateLimit } from '@/utils/rateLimiter';
import { z } from 'zod';
import { CreateLeagueForm } from '@/components/CreateLeagueForm';
import { LeagueSuccessDialog } from '@/components/LeagueSuccessDialog';
import { LeagueLimitWarning } from '@/components/LeagueLimitWarning';

interface CreateLeagueDialogProps {
  onLeagueCreated?: () => void;
}

interface CreatedLeague {
  id: string;
  name: string;
  invite_code: string;
}

const MAX_LEAGUES_PER_USER = 10;

export const CreateLeagueDialog: React.FC<CreateLeagueDialogProps> = ({ onLeagueCreated }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createdLeague, setCreatedLeague] = useState<CreatedLeague | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userLeagueCount, setUserLeagueCount] = useState<number>(0);
  const [checkingLimit, setCheckingLimit] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    maxMembers: 50
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const checkUserLeagueCount = async () => {
    if (!user) return;
    
    setCheckingLimit(true);
    try {
      const { count, error } = await supabase
        .from('leagues')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);

      if (error) throw error;
      setUserLeagueCount(count || 0);
    } catch (error: any) {
      console.error('Error checking league count:', error);
      toast({
        title: "Error",
        description: "Could not check your league limit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckingLimit(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      checkUserLeagueCount();
    }
  }, [open, user]);

  const validateForm = () => {
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
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a league.",
        variant: "destructive",
      });
      return;
    }

    // Check league limit
    if (userLeagueCount >= MAX_LEAGUES_PER_USER) {
      toast({
        title: "League Limit Reached",
        description: `You can only create up to ${MAX_LEAGUES_PER_USER} leagues. Please delete an existing league to create a new one.`,
        variant: "destructive",
      });
      return;
    }

    // Check rate limiting
    const { allowed, timeUntilReset } = checkRateLimit(leagueCreateLimiter, user.id);
    if (!allowed) {
      const minutes = Math.ceil(timeUntilReset / 60000);
      toast({
        title: "Too Many Requests",
        description: `Please wait ${minutes} minutes before creating another league.`,
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors below.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedData = validateAndSanitizeLeague(formData);
      
      const { data, error } = await supabase
        .from('leagues')
        .insert({
          name: sanitizedData.name,
          description: sanitizedData.description || null,
          creator_id: user.id,
          is_public: sanitizedData.isPublic,
          max_members: sanitizedData.maxMembers
        })
        .select('id, name, invite_code')
        .single();

      if (error) throw error;

      setCreatedLeague(data);
      setUserLeagueCount(prev => prev + 1);
      
      toast({
        title: "League Created!",
        description: `Your league "${sanitizedData.name}" has been created successfully.`,
      });

      onLeagueCreated?.();
    } catch (error: any) {
      console.error('League creation error:', error);
      toast({
        title: "Error Creating League",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedLeague(null);
    setErrors({});
    setFormData({
      name: '',
      description: '',
      isPublic: false,
      maxMembers: 50
    });
  };

  const canCreateLeague = userLeagueCount < MAX_LEAGUES_PER_USER;

  if (createdLeague) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogTrigger asChild>
          <Button className="flex items-center space-x-2" disabled={!canCreateLeague}>
            <Plus className="h-4 w-4" />
            <span>Create League</span>
          </Button>
        </DialogTrigger>
        <LeagueSuccessDialog
          createdLeague={createdLeague}
          onClose={handleClose}
        />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2" disabled={!canCreateLeague}>
          <Plus className="h-4 w-4" />
          <span>Create League</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New League</DialogTitle>
        </DialogHeader>

        {checkingLimit ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plpe-purple mr-3"></div>
            <span className="text-gray-600">Checking league limit...</span>
          </div>
        ) : !canCreateLeague ? (
          <LeagueLimitWarning
            maxLeagues={MAX_LEAGUES_PER_USER}
            onClose={() => setOpen(false)}
          />
        ) : (
          <CreateLeagueForm
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            userLeagueCount={userLeagueCount}
            maxLeagues={MAX_LEAGUES_PER_USER}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
