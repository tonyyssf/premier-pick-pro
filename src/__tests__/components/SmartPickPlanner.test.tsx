import { render, screen } from '@testing-library/react';
import { SmartPickPlanner } from '@/components/SmartPickPlanner';
import { PickRecommendation } from '@/utils/getPickRecommendations';

const mockRecommendations: PickRecommendation[] = [
  { club: 'Arsenal', gw: 1, winProb: 0.85 },
  { club: 'Liverpool', gw: 1, winProb: 0.78 },
  { club: 'Manchester City', gw: 1, winProb: 0.72 },
];

const mockRemainingTokens = {
  'Arsenal': 2,
  'Liverpool': 1,
  'Manchester City': 3,
};

describe('SmartPickPlanner', () => {
  it('should render 3 recommendations for premium users', () => {
    render(
      <SmartPickPlanner
        recommendations={mockRecommendations}
        remainingTokens={mockRemainingTokens}
        isPremium={true}
      />
    );

    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText('Liverpool')).toBeInTheDocument();
    expect(screen.getByText('Manchester City')).toBeInTheDocument();
  });

  it('should render only 1 recommendation for free users', () => {
    render(
      <SmartPickPlanner
        recommendations={mockRecommendations}
        remainingTokens={mockRemainingTokens}
        isPremium={false}
      />
    );

    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.queryByText('Liverpool')).not.toBeInTheDocument();
    expect(screen.queryByText('Manchester City')).not.toBeInTheDocument();
  });

  it('should display win probabilities correctly', () => {
    render(
      <SmartPickPlanner
        recommendations={mockRecommendations}
        remainingTokens={mockRemainingTokens}
        isPremium={true}
      />
    );

    expect(screen.getByText('Win Probability: 85.0%')).toBeInTheDocument();
    expect(screen.getByText('Win Probability: 78.0%')).toBeInTheDocument();
    expect(screen.getByText('Win Probability: 72.0%')).toBeInTheDocument();
  });

  it('should display remaining tokens correctly', () => {
    render(
      <SmartPickPlanner
        recommendations={mockRecommendations}
        remainingTokens={mockRemainingTokens}
        isPremium={true}
      />
    );

    expect(screen.getByText('x2 left')).toBeInTheDocument();
    expect(screen.getByText('x1 left')).toBeInTheDocument();
    expect(screen.getByText('x3 left')).toBeInTheDocument();
  });

  it('should show lock icon for free users', () => {
    render(
      <SmartPickPlanner
        recommendations={mockRecommendations}
        remainingTokens={mockRemainingTokens}
        isPremium={false}
      />
    );

    const lockIcon = screen.getByTestId('lock-icon');
    expect(lockIcon).toBeInTheDocument();
  });

  it('should not show lock icon for premium users', () => {
    render(
      <SmartPickPlanner
        recommendations={mockRecommendations}
        remainingTokens={mockRemainingTokens}
        isPremium={true}
      />
    );

    const lockIcon = screen.queryByTestId('lock-icon');
    expect(lockIcon).not.toBeInTheDocument();
  });

  it('should show premium upgrade message for free users', () => {
    render(
      <SmartPickPlanner
        recommendations={mockRecommendations}
        remainingTokens={mockRemainingTokens}
        isPremium={false}
      />
    );

    expect(screen.getByText('+2 more recommendations available with Premium')).toBeInTheDocument();
  });

  it('should show loading skeleton when isLoading is true', () => {
    render(
      <SmartPickPlanner
        recommendations={mockRecommendations}
        remainingTokens={mockRemainingTokens}
        isPremium={true}
        isLoading={true}
      />
    );

    // Should show loading skeleton instead of actual content
    expect(screen.queryByText('Arsenal')).not.toBeInTheDocument();
    expect(screen.queryByText('Liverpool')).not.toBeInTheDocument();
    expect(screen.queryByText('Manchester City')).not.toBeInTheDocument();
  });
}); 