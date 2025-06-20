
import React from 'react';
import { usePicks } from '../contexts/PicksContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { CheckCircle, XCircle, Minus, Clock } from 'lucide-react';

export const UserPickHistory: React.FC = () => {
  const { gameweekScores, fixtures, loading } = usePicks();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pick History</h2>
        <p className="text-gray-600">Please sign in to view your pick history.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pick History</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plpe-purple"></div>
          <span className="ml-3 text-gray-600">Loading pick history...</span>
        </div>
      </div>
    );
  }

  // Filter scores for current user and sort by gameweek
  const userScores = gameweekScores
    .filter(score => score.userId === user.id)
    .sort((a, b) => a.gameweekId.localeCompare(b.gameweekId));

  const getResultIcon = (points: number, isCorrect: boolean) => {
    if (points === 3 && isCorrect) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (points === 1) {
      return <Minus className="h-5 w-5 text-yellow-500" />;
    } else if (points === 0) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getResultText = (points: number, isCorrect: boolean) => {
    if (points === 3 && isCorrect) {
      return 'Won';
    } else if (points === 1) {
      return 'Tied';
    } else if (points === 0) {
      return 'Lost';
    }
    return 'Pending';
  };

  const getResultColor = (points: number, isCorrect: boolean) => {
    if (points === 3 && isCorrect) {
      return 'text-green-600 bg-green-50';
    } else if (points === 1) {
      return 'text-yellow-600 bg-yellow-50';
    } else if (points === 0) {
      return 'text-red-600 bg-red-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  if (userScores.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pick History</h2>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No picks found. Start making your picks to see your history here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pick History</h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gameweek</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userScores.map((score, index) => (
              <TableRow key={score.id}>
                <TableCell className="font-medium">
                  Gameweek {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getResultIcon(score.points, score.isCorrect)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultColor(score.points, score.isCorrect)}`}>
                      {getResultText(score.points, score.isCorrect)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{score.points}</span> points
                </TableCell>
                <TableCell>
                  {score.isCorrect ? 'Correct Pick' : score.points === 1 ? 'Draw' : 'Incorrect Pick'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {userScores.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {userScores.reduce((sum, score) => sum + score.points, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {userScores.filter(score => score.isCorrect).length}
              </p>
              <p className="text-sm text-gray-600">Wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {userScores.filter(score => score.points === 1).length}
              </p>
              <p className="text-sm text-gray-600">Draws</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {userScores.filter(score => score.points === 0).length}
              </p>
              <p className="text-sm text-gray-600">Losses</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
