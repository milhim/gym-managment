#!/bin/bash

echo "🚀 Gym Management Backend - Deploy to Vercel"
echo "============================================="

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not a git repository. Please run 'git init' first."
    exit 1
fi

# Add all changes
echo "📦 Adding all changes..."
git add .

# Commit with timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
echo "💾 Committing changes..."
git commit -m "Deploy backend to Vercel - $TIMESTAMP"

# Push to GitHub
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Changes pushed to GitHub successfully!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Import your 'gym-managment' repository"
echo "4. Set root directory to 'backend'"
echo "5. Add environment variables (see DEPLOYMENT.md)"
echo "6. Deploy!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md" 