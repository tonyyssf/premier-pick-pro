import React from 'react';

interface Team {
  id: string;
  name: string;
  shortName: string;
  teamColor?: string;
}

interface TeamButtonProps {
  team: Team;
  isDisabled: boolean;
  usedCount: number;
  maxUses: number;
  isLoading: boolean;
  onSelect: () => void;
  hasStarted: boolean;
  disabled: boolean;
}

export const TeamButton: React.FC<TeamButtonProps> = ({
  team,
  isDisabled,
  usedCount,
  maxUses,
  isLoading,
  onSelect,
  hasStarted,
  disabled
}) => {
  const canSelect = !isDisabled && !isLoading && !hasStarted && !disabled;
  
  const getButtonClass = () => {
    return `
      flex items-center justify-center space-x-1 p-2 h-full transition-all duration-200 relative
      ${canSelect
        ? 'cursor-pointer'
        : 'cursor-not-allowed opacity-60'
      }
      ${isLoading ? 'ring-1 ring-plpe-purple ring-opacity-50' : ''}
    `;
  };

  const handleClick = (e: React.MouseEvent) => {
    console.log('TeamButton clicked:', team.name, 'canSelect:', canSelect);
    e.preventDefault();
    e.stopPropagation();
    
    if (canSelect) {
      onSelect();
    } else {
      console.log('Click ignored - button not selectable');
    }
  };

  return (
    <button
      type="button"
      className={getButtonClass()}
      onClick={handleClick}
      disabled={!canSelect}
      aria-label={`Pick ${team.name}`}
      data-testid={`team-button-${team.id}`}
    >
      {/* Loading spinner overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-plpe-purple"></div>
        </div>
      )}

      {/* Team color indicator */}
      <div 
        className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
        style={{ backgroundColor: team.teamColor || '#6B7280' }}
      />
      
      {/* Team name - responsive display */}
      <span className="font-medium text-gray-900 text-xs leading-tight truncate">
        <span className="hidden md:inline">{team.name}</span>
        <span className="md:hidden">{team.shortName}</span>
      </span>
      
      {/* Usage indicators - dots on larger screens */}
      <div className="hidden sm:flex space-x-0.5">
        {[...Array(maxUses)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < usedCount ? 'bg-plpe-purple' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      
      {/* Usage count - mobile display */}
      <span className="text-xs text-gray-600 sm:hidden">
        {usedCount}/{maxUses}
      </span>
    </button>
  );
};