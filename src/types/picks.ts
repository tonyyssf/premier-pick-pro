
export interface Pick {
  id: string;
  gameweekId: string;
  fixtureId: string;
  pickedTeamId: string;
  timestamp: Date;
}

export interface Fixture {
  id: string;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    teamColor?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    teamColor?: string;
  };
  kickoffTime: Date;
  status: string;
}

export interface Gameweek {
  id: string;
  number: number;
  deadline: Date;
  isCurrent: boolean;
}

export interface GameweekScore {
  id: string;
  userId: string;
  gameweekId: string;
  points: number;
  isCorrect: boolean;
}

export interface UserStanding {
  id: string;
  userId: string;
  totalPoints: number;
  correctPicks: number;
  totalPicks: number;
  currentRank: number | null;
}

export interface GameweekNavigation {
  viewingGameweek: Gameweek | null;
  setViewingGameweek: (gameweek: Gameweek | null) => void;
  navigateToGameweek: (direction: 'prev' | 'next') => void;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
  isNavigating: boolean;
}

export interface PicksContextType {
  picks: Pick[];
  fixtures: Fixture[];
  currentGameweek: Gameweek | null;
  viewingGameweek?: Gameweek | null;
  gameweekScores: GameweekScore[];
  userStandings: UserStanding[];
  submitPick: (fixtureId: string, teamId: string) => Promise<boolean>;
  undoPick: () => Promise<boolean>;
  canUndoPick: () => boolean;
  getTeamUsedCount: (teamId: string) => number;
  hasPickForGameweek: (gameweekId: string) => boolean;
  getCurrentPick: () => Pick | null;
  calculateScores: (gameweekId?: string) => Promise<void>;
  advanceToNextGameweek: () => Promise<boolean>;
  loading: boolean;
  fixturesLoading: boolean;
  scoresLoading: boolean;
  navigation?: GameweekNavigation;
}
