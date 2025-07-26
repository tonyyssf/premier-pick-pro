#!/bin/bash

# Tree-shaking cleanup script for Premier Pick Pro
# This script removes potentially unused files identified by the analysis

echo "🧹 Tree-shaking Cleanup Script"
echo "=============================="
echo ""
echo "This script will remove files identified as potentially unused."
echo "⚠️  WARNING: Please review the files before proceeding!"
echo ""

# Create backup directory
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Function to safely remove a file with backup
remove_file() {
    local file="$1"
    if [ -f "$file" ]; then
        # Create backup
        mkdir -p "$BACKUP_DIR/$(dirname "$file")"
        cp "$file" "$BACKUP_DIR/$file"
        
        # Remove file
        rm "$file"
        echo "✅ Removed: $file (backed up to $BACKUP_DIR/$file)"
    else
        echo "⚠️  File not found: $file"
    fi
}

# List of files to remove (from analysis)
FILES_TO_REMOVE=(
    # Components
    "src/components/AdminDataTable.tsx"
    "src/components/AdminFixtureSync.tsx"
    "src/components/AuthDivider.tsx"
    "src/components/AuthSignUpForm.tsx"
    "src/components/DeadlineCard.tsx"
    "src/components/DeadlineCardIcon.tsx"
    "src/components/DeadlineCardTimer.tsx"
    "src/components/DeadlineCardTip.tsx"
    "src/components/DeadlineCardTypes.ts"
    "src/components/DeadlineCardUtils.ts"
    "src/components/DesktopStandingsTable.tsx"
    "src/components/EmptyStandings.tsx"
    "src/components/EnhancedSecurityMonitor.tsx"
    "src/components/ErrorDisplay.tsx"
    "src/components/FixtureCard.tsx"
    "src/components/FixtureListItem.tsx"
    "src/components/GameweekHeader.tsx"
    "src/components/GoogleSignInButton.tsx"
    "src/components/GuestUserPickHistory.tsx"
    "src/components/GuestUserScoreDisplay.tsx"
    "src/components/GuestWeeklyPicks.tsx"
    "src/components/HeroSection.tsx"
    "src/components/LazyImageWithFallback.tsx"
    "src/components/LazyLoadedComponents.tsx"
    "src/components/LeaderboardHeader.tsx"
    "src/components/LeagueAccessDenied.tsx"
    "src/components/LeagueDeleteSection.tsx"
    "src/components/LeagueDialogContent.tsx"
    "src/components/LeagueInviteCodeSection.tsx"
    "src/components/LeagueManagementTabs.tsx"
    "src/components/LeagueMembersList.tsx"
    "src/components/LeagueMembersTab.tsx"
    "src/components/LeagueRankingCard.tsx"
    "src/components/LeagueSettingsTab.tsx"
    "src/components/LeagueShareSection.tsx"
    "src/components/ManageLeagueDialog.tsx"
    "src/components/MobileStandingsCard.tsx"
    "src/components/Navbar.tsx"
    "src/components/OptimizedDesktopStandingsTable.tsx"
    "src/components/OptimizedRealtimeStandingsTable.tsx"
    "src/components/PerformanceDashboard.tsx"
    "src/components/PerformanceDebugger.tsx"
    "src/components/PickConfirmationActions.tsx"
    "src/components/PickConfirmationCard.tsx"
    "src/components/PickConfirmationDetails.tsx"
    "src/components/PickConfirmationHeader.tsx"
    "src/components/PickConfirmationLocked.tsx"
    "src/components/PickingGuide.tsx"
    "src/components/PremierLeagueStandings.tsx"
    "src/components/RankIcon.tsx"
    "src/components/RankingIntegrityMonitor.tsx"
    "src/components/RealtimeDesktopStandingsTable.tsx"
    "src/components/RealtimeMobileStandingsCard.tsx"
    "src/components/RealtimeStandingsHeader.tsx"
    "src/components/RealtimeStandingsTable.tsx"
    "src/components/RefreshStandingsButton.tsx"
    "src/components/SecurityAuditDashboard.tsx"
    "src/components/SignInForm.tsx"
    "src/components/SignUpForm.tsx"
    "src/components/StandingsLoadingState.tsx"
    "src/components/StandingsTable.tsx"
    "src/components/StreakIndicator.tsx"
    "src/components/TeamCard.tsx"
    "src/components/UserFriendlyError.tsx"
    "src/components/UserSettingsForm.tsx"
    "src/components/UserSettingsLoading.tsx"
    "src/components/WeeklyPicksDeadlinePassed.tsx"
    "src/components/WeeklyPicksEmptyState.tsx"
    "src/components/WeeklyPicksFixtureList.tsx"
    "src/components/WeeklyPicksHeader.tsx"
    "src/components/WeeklyPicksInstructions.tsx"
    "src/components/WeeklyPicksLoadingState.tsx"
    "src/components/WeeklyPicksMessages.tsx"
    "src/components/WeeklyStandingsTable.tsx"
    "src/components/insights/EfficiencyLineChart.tsx"
    "src/components/insights/HeatMapChart.tsx"
    "src/components/insights/ProjectionStat.tsx"
    "src/components/onboarding/LeaguePrompt.tsx"
    "src/components/onboarding/UsernamePrompt.tsx"
    
    # UI Components (unused)
    "src/components/ui/accordion.tsx"
    "src/components/ui/animated-chart.tsx"
    "src/components/ui/aspect-ratio.tsx"
    "src/components/ui/avatar.tsx"
    "src/components/ui/breadcrumb.tsx"
    "src/components/ui/calendar.tsx"
    "src/components/ui/carousel.tsx"
    "src/components/ui/chart/ChartContainer.tsx"
    "src/components/ui/chart/ChartContext.tsx"
    "src/components/ui/chart/ChartLegend.tsx"
    "src/components/ui/chart/ChartStyle.tsx"
    "src/components/ui/chart/ChartTooltip.tsx"
    "src/components/ui/chart/index.ts"
    "src/components/ui/chart/types.ts"
    "src/components/ui/chart/utils.ts"
    "src/components/ui/command.tsx"
    "src/components/ui/context-menu.tsx"
    "src/components/ui/drawer.tsx"
    "src/components/ui/form.tsx"
    "src/components/ui/hover-card.tsx"
    "src/components/ui/input-otp.tsx"
    "src/components/ui/menubar.tsx"
    "src/components/ui/mobile-optimized-chart.tsx"
    "src/components/ui/navigation-menu.tsx"
    "src/components/ui/pagination.tsx"
    "src/components/ui/popover.tsx"
    "src/components/ui/radio-group.tsx"
    "src/components/ui/resizable.tsx"
    "src/components/ui/select.tsx"
    "src/components/ui/sidebar.tsx"
    "src/components/ui/slider.tsx"
    "src/components/ui/toggle-group.tsx"
    "src/components/ui/use-toast.ts"
    
    # Hooks
    "src/hooks/useGlobalStandings.ts"
    "src/hooks/useLeagueStandings.ts"
    "src/hooks/useOptimizedApi.ts"
    "src/hooks/useOptimizedGameweekData.ts"
    "src/hooks/useSecureForm.ts"
    
    # Pages
    "src/pages/Admin.tsx"
    "src/pages/Auth.tsx"
    "src/pages/Index.tsx"
    "src/pages/Insights.tsx"
    "src/pages/Leaderboards.tsx"
    "src/pages/Leagues.tsx"
    "src/pages/NotFound.tsx"
    "src/pages/OptimizedLeaderboards.tsx"
    
    # Utils
    "src/utils/enhancedRateLimiter.ts"
    "src/utils/enhancedValidation.ts"
    "src/utils/exportUtils.ts"
    
    # Types
    "src/integrations/supabase/types.ts"
)

echo "📋 Files to be removed: ${#FILES_TO_REMOVE[@]}"
echo ""

# Show summary
echo "📊 Summary of files to remove:"
echo "  - Components: $(echo "${FILES_TO_REMOVE[@]}" | tr ' ' '\n' | grep "components/" | wc -l)"
echo "  - UI Components: $(echo "${FILES_TO_REMOVE[@]}" | tr ' ' '\n' | grep "ui/" | wc -l)"
echo "  - Hooks: $(echo "${FILES_TO_REMOVE[@]}" | tr ' ' '\n' | grep "hooks/" | wc -l)"
echo "  - Pages: $(echo "${FILES_TO_REMOVE[@]}" | tr ' ' '\n' | grep "pages/" | wc -l)"
echo "  - Utils: $(echo "${FILES_TO_REMOVE[@]}" | tr ' ' '\n' | grep "utils/" | wc -l)"
echo ""

# Ask for confirmation
read -p "🤔 Do you want to proceed with removing these files? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo ""
echo "🚀 Starting removal process..."
echo ""

# Remove files
for file in "${FILES_TO_REMOVE[@]}"; do
    remove_file "$file"
done

echo ""
echo "✅ Cleanup completed!"
echo "📦 Backup created in: $BACKUP_DIR"
echo ""
echo "💡 Next steps:"
echo "1. Test your application to ensure everything still works"
echo "2. If issues arise, restore files from the backup directory"
echo "3. Run 'npm run build' to verify the build process"
echo "4. Consider running the tree-shaking analysis again"
echo ""
echo "🔧 To restore from backup:"
echo "cp -r $BACKUP_DIR/* ." 