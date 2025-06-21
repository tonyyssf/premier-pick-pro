
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Copy, Share2, ExternalLink, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateAndSanitizeLeague } from '@/utils/validation';
import { leagueCreateLimiter, checkRateLimit } from '@/utils/rateLimiter';
import { z } from 'zod';

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

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const shareUrl = createdLeague ? `${window.location.origin}/leagues?join=${createdLeague.invite_code}` : '';

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-green-600" />
              <span>League Created Successfully!</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{createdLeague.name}</h3>
              <p className="text-sm text-gray-600">Share your league with friends</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">League Code</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={createdLeague.invite_code}
                    readOnly
                    className="font-mono text-center text-lg font-bold"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(createdLeague.invite_code, 'League code')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Share Link</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(shareUrl, 'Share link')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Create Another
              </Button>
              <Button 
                onClick={() => {
                  window.open(`/leagues`, '_blank');
                  handleClose();
                }}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View League
              </Button>
            </div>
          </div>
        </DialogContent>
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
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-900">League Limit Reached</h3>
                <p className="text-sm text-red-700 mt-1">
                  You've reached the maximum limit of {MAX_LEAGUES_PER_USER} leagues. Please delete an existing league to create a new one.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              You have created {userLeagueCount} of {MAX_LEAGUES_PER_USER} leagues allowed.
            </div>

            <div>
              <Label htmlFor="name">League Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter league name"
                required
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your league..."
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>
            
            <div>
              <Label htmlFor="maxMembers">Maximum Members</Label>
              <Input
                id="maxMembers"
                type="number"
                min="2"
                max="500"
                value={formData.maxMembers}
                onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value))}
                className={errors.maxMembers ? 'border-red-500' : ''}
              />
              {errors.maxMembers && <p className="text-sm text-red-500 mt-1">{errors.maxMembers}</p>}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
              />
              <Label htmlFor="isPublic">Make league public</Label>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Creating...' : 'Create League'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
