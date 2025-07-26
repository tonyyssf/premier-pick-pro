#!/bin/bash

# Conservative Tree-shaking Cleanup Script
# This script removes only the largest unused files for maximum impact

echo "🎯 Conservative Tree-shaking Cleanup"
echo "===================================="
echo ""
echo "This script removes only the largest unused files for maximum impact."
echo "⚠️  WARNING: Please review the files before proceeding!"
echo ""

# Create backup directory
BACKUP_DIR="backup-conservative-$(date +%Y%m%d-%H%M%S)"
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

# List of largest unused files (top 20 by size)
LARGEST_UNUSED_FILES=(
    # Largest files first
    "src/components/ui/sidebar.tsx"                    # 22.82 KB
    "src/integrations/supabase/types.ts"               # 20.98 KB
    "src/components/AdminDataTable.tsx"                # 11.19 KB
    "src/components/PerformanceDashboard.tsx"          # 10.04 KB
    "src/pages/Insights.tsx"                           # 9.22 KB
    "src/components/EnhancedSecurityMonitor.tsx"       # 8.16 KB
    "src/components/FixtureCard.tsx"                   # 8.01 KB
    "src/components/ui/menubar.tsx"                    # 7.79 KB
    "src/components/SignUpForm.tsx"                    # 7.57 KB
    "src/components/SecurityAuditDashboard.tsx"        # 7.25 KB
    "src/components/ui/chart/ChartContainer.tsx"       # 6.89 KB
    "src/components/ui/chart/ChartContext.tsx"         # 6.45 KB
    "src/components/ui/chart/ChartLegend.tsx"          # 6.12 KB
    "src/components/ui/chart/ChartStyle.tsx"           # 5.98 KB
    "src/components/ui/chart/ChartTooltip.tsx"         # 5.67 KB
    "src/components/ui/chart/index.ts"                 # 5.34 KB
    "src/components/ui/chart/types.ts"                 # 5.12 KB
    "src/components/ui/chart/utils.ts"                 # 4.89 KB
    "src/components/ui/animated-chart.tsx"             # 4.67 KB
    "src/components/ui/mobile-optimized-chart.tsx"     # 4.45 KB
)

echo "📋 Largest unused files to be removed: ${#LARGEST_UNUSED_FILES[@]}"
echo ""

# Show files with sizes
echo "📏 Files to remove (sorted by size):"
for file in "${LARGEST_UNUSED_FILES[@]}"; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        echo "  $size - $file"
    fi
done
echo ""

# Calculate total size
total_size=0
for file in "${LARGEST_UNUSED_FILES[@]}"; do
    if [ -f "$file" ]; then
        size=$(du -k "$file" | cut -f1)
        total_size=$((total_size + size))
    fi
done

echo "💾 Total potential savings: $(numfmt --to=iec $((total_size * 1024)))"
echo ""

# Ask for confirmation
read -p "🤔 Do you want to proceed with removing these largest unused files? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo ""
echo "🚀 Starting removal process..."
echo ""

# Remove files
for file in "${LARGEST_UNUSED_FILES[@]}"; do
    remove_file "$file"
done

echo ""
echo "✅ Conservative cleanup completed!"
echo "📦 Backup created in: $BACKUP_DIR"
echo "💾 Estimated savings: $(numfmt --to=iec $((total_size * 1024)))"
echo ""
echo "💡 Next steps:"
echo "1. Test your application to ensure everything still works"
echo "2. If issues arise, restore files from the backup directory"
echo "3. Run 'npm run build' to verify the build process"
echo "4. If successful, consider running the full cleanup script"
echo ""
echo "🔧 To restore from backup:"
echo "cp -r $BACKUP_DIR/* ." 