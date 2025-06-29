
import React from 'react';

interface Team {
  id: string;
  name: string;
  shortName: string;
  teamColor?: string;
}

interface MobileTeamCardProps {
  team: Team;
  isHome: boolean;
  usedCount: number;
  maxUses: number;
  isDisabled: boolean;
  onSelect: () => void;
  isSubmitting?: boolean;
}

export const MobileTeamCard: React.FC<MobileTeamCardProps> = ({
  team,
  isHome,
  usedCount,
  maxUses,
  isDisabled,
  onSelect,
  isSubmitting = false
}) => {
  return (
    <button
      type="button"
      className={`
        relative border-2 rounded-xl p-4 transition-all duration-200 flex-1
        min-h-[120px] min-w-[120px] touch-manipulation
        ${isDisabled
          ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
          : 'border-gray-200 bg-white hover:border-plpe-purple hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-plpe-purple focus:ring-offset-2'
        }
        ${isSubmitting ? 'animate-pulse' : ''}
      `}
      onClick={!isDisabled ? onSelect : undefined}
      disabled={isDisabled}
      aria-label={`Pick ${team.name} ${isHome ? 'home' : 'away'} team`}
    >
      {usedCount >= maxUses && (
        <div className="absolute inset-0 bg-gray-900/20 rounded-xl flex items-center justify-center">
          <span className="bg-red-500 text-white px-3 py-2 rounded-full text-sm font-semibold">
            Used {maxUses}/{maxUses}
          </span>
        </div>
      )}

      {isSubmitting && (
        <div className="absolute inset-0 bg-plpe-purple/10 rounded-xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plpe-purple"></div>
        </div>
      )}
      
      <div className="text-center">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg shadow-lg"
          style={{ backgroundColor: team.teamColor || '#6B7280' }}
        >
          {team.shortName}
        </div>
        <h4 className="font-semibold text-gray-900 text-sm mb-2 leading-tight">{team.name}</h4>
        <p className="text-xs text-gray-600 mb-3">{isHome ? 'Home' : 'Away'}</p>
        
        <div className="flex justify-center space-x-1 mb-2">
          {[...Array(maxUses)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < usedCount ? 'bg-plpe-purple' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 font-medium">{usedCount}/{maxUses} used</span>
      </div>
    </button>
  );
};
