
import React from 'react';

interface TeamCardProps {
  name: string;
  logo: string;
  opponent: string;
  venue: 'H' | 'A';
  usedCount: number;
  maxUses: number;
  isSelected: boolean;
  onSelect: () => void;
  teamColor?: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  name,
  logo,
  opponent,
  venue,
  usedCount,
  maxUses,
  isSelected,
  onSelect,
  teamColor
}) => {
  const isDisabled = usedCount >= maxUses;
  
  return (
    <div 
      className={`
        relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 transform hover:scale-105
        ${isSelected 
          ? 'border-plpe-purple bg-purple-50 shadow-lg' 
          : isDisabled
            ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
            : 'border-gray-200 bg-white hover:border-plpe-purple hover:shadow-md'
        }
      `}
      onClick={!isDisabled ? onSelect : undefined}
    >
      {isDisabled && (
        <div className="absolute inset-0 bg-gray-900/20 rounded-lg flex items-center justify-center">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Used {maxUses}/{maxUses}
          </span>
        </div>
      )}
      
      <div className="flex items-center space-x-3 mb-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
          style={{ backgroundColor: teamColor || '#6B7280' }}
        >
          <span className="text-sm">{name.slice(0, 3).toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">
            {venue === 'H' ? 'vs' : '@'} {opponent}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-1">
          {[...Array(maxUses)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < usedCount ? 'bg-plpe-purple' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">{usedCount}/{maxUses} used</span>
      </div>
    </div>
  );
};
