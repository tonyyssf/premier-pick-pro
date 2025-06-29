
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Settings } from 'lucide-react';
import { LeagueDialogContent } from './LeagueDialogContent';
import type { League, LeagueMember } from '@/types/league';

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
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Check if current user is the league creator
  const isCreator = user?.id === league.creator_id;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleLeagueUpdated = () => {
    setIsOpen(false);
    onLeagueUpdated();
  };

  const ContentComponent = ({ className }: { className?: string }) => (
    <LeagueDialogContent
      league={league}
      members={members}
      setMembers={setMembers}
      loadingMembers={loadingMembers}
      setLoadingMembers={setLoadingMembers}
      onLeagueUpdated={handleLeagueUpdated}
      className={className}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] p-4">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>{isCreator ? 'Manage' : 'View'}: {league.name}</span>
            </SheetTitle>
          </SheetHeader>
          <ContentComponent className="overflow-y-auto h-full pb-4" />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>{isCreator ? 'Manage League' : 'View League'}: {league.name}</span>
          </DialogTitle>
        </DialogHeader>
        <ContentComponent />
      </DialogContent>
    </Dialog>
  );
};
