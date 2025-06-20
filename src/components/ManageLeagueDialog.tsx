
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Settings, Trash2, Copy, Crown } from 'lucide-react';

interface League {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  creator_id: string;
  is_public: boolean;
  max_members: number | null;
  created_at: string;
  member_count?: number;
  is_creator?: boolean;
  is_member?: boolean;
}

interface LeagueMember {
  id: string;
  user_id: string;
  joined_at: string;
  profiles: {
    username: string | null;
    name: string | null;
    email: string | null;
  };
}

interface ManageLeagueDialogProps {
  league: League;
  onLeagueUpdated: () => void;
  children: React.ReactNode;
}

export const ManageLeagueDialog: React.FC<ManageLeagueDialogProps> = ({
  league,
  onLeagueUpdated,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  
  // League settings form state
  const [leagueName, setLeagueName] = useState(league.name);
  const [leagueDescription, setLeagueDescription] = useState(league.description || '');
  const [isPublic, setIsPublic] = useState(league.is_public);
  const [maxMembers, setMaxMembers] = useState(league.max_members?.toString() || '');

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from('league_members')
        .select(`
          id,
          user_id,
          joined_at,
          profiles:user_id (
            username,
            name,
            email
          )
        `)
        .eq('league_id', league.id)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Members",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchMembers();
    }
  };

  const handleUpdateLeague = async () => {
    setIsLoading(true);
    try {
      const updates: any = {
        name: leagueName,
        description: leagueDescription || null,
        is_public: isPublic,
        max_members: maxMembers ? parseInt(maxMembers) : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('leagues')
        .update(updates)
        .eq('id', league.id)
        .eq('creator_id', user?.id);

      if (error) throw error;

      toast({
        title: "League Updated",
        description: "League settings have been updated successfully.",
      });

      onLeagueUpdated();
    } catch (error: any) {
      toast({
        title: "Error Updating League",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === user?.id) {
      toast({
        title: "Cannot Remove Yourself",
        description: "You cannot remove yourself from your own league.",
        variant: "destructive",
      });
      return;
    }

    setRemovingMember(memberId);
    try {
      const { error } = await supabase
        .from('league_members')
        .delete()
        .eq('id', memberId)
        .eq('league_id', league.id);

      if (error) throw error;

      toast({
        title: "Member Removed",
        description: "Member has been removed from the league.",
      });

      fetchMembers();
      onLeagueUpdated();
    } catch (error: any) {
      toast({
        title: "Error Removing Member",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRemovingMember(null);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(league.invite_code);
    toast({
      title: "Invite Code Copied",
      description: "The invite code has been copied to your clipboard.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Manage League: {league.name}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">League Settings</TabsTrigger>
            <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="league-name">League Name</Label>
                <Input
                  id="league-name"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  placeholder="Enter league name"
                />
              </div>

              <div>
                <Label htmlFor="league-description">Description</Label>
                <Textarea
                  id="league-description"
                  value={leagueDescription}
                  onChange={(e) => setLeagueDescription(e.target.value)}
                  placeholder="Enter league description (optional)"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="is-public">Make league public</Label>
              </div>

              <div>
                <Label htmlFor="max-members">Maximum Members (optional)</Label>
                <Input
                  id="max-members"
                  type="number"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(e.target.value)}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium">Invite Code</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <code className="bg-white px-3 py-2 rounded border font-mono text-sm flex-1">
                    {league.invite_code}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyInviteCode}
                    className="flex items-center space-x-1"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleUpdateLeague} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Updating...' : 'Update League Settings'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            {loadingMembers ? (
              <div className="text-center py-8">
                <p>Loading members...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No members found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {member.profiles?.name || member.profiles?.username || 'Unknown User'}
                          {member.user_id === league.creator_id && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              Creator
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {member.profiles?.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined: {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {member.user_id !== league.creator_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id, member.user_id)}
                        disabled={removingMember === member.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        {removingMember === member.id ? 'Removing...' : 'Remove'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
