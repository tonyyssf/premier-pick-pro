
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CreateLeagueDialogProps {
  onLeagueCreated?: () => void;
}

export const CreateLeagueDialog: React.FC<CreateLeagueDialogProps> = ({ onLeagueCreated }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    maxMembers: 50
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

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

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('leagues')
        .insert({
          name: formData.name,
          description: formData.description || null,
          creator_id: user.id,
          is_public: formData.isPublic,
          max_members: formData.maxMembers
        });

      if (error) throw error;

      toast({
        title: "League Created!",
        description: `Your league "${formData.name}" has been created successfully.`,
      });

      setFormData({
        name: '',
        description: '',
        isPublic: false,
        maxMembers: 50
      });
      setOpen(false);
      onLeagueCreated?.();
    } catch (error: any) {
      toast({
        title: "Error Creating League",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create League</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New League</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">League Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter league name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your league..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="maxMembers">Maximum Members</Label>
            <Input
              id="maxMembers"
              type="number"
              min="2"
              max="500"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
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
      </DialogContent>
    </Dialog>
  );
};
