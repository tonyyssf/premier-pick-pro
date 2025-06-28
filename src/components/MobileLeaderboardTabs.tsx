
import React from 'react';

interface MobileLeaderboardTabsProps {
  activeTab: 'friends' | 'global';
  onTabChange: (tab: 'friends' | 'global') => void;
}

export const MobileLeaderboardTabs: React.FC<MobileLeaderboardTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
      <button
        onClick={() => onTabChange('friends')}
        className={`flex-1 py-3 px-4 rounded-md font-semibold transition-colors ${
          activeTab === 'friends'
            ? 'bg-purple-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Leagues
      </button>
      <button
        onClick={() => onTabChange('global')}
        className={`flex-1 py-3 px-4 rounded-md font-semibold transition-colors ${
          activeTab === 'global'
            ? 'bg-purple-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Global
      </button>
    </div>
  );
};
