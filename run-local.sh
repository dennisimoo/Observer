#!/bin/bash

echo "🚀 Starting Observer AI with disabled authentication..."
echo "📝 This will run the app on http://localhost:8080 with auth disabled"
echo ""

# Build and run the local development container
docker-compose -f docker-compose.local.yml up --build

echo ""
echo "✅ Observer AI is now running with disabled auth!"
echo "🌐 Access it at: http://localhost:8080"
echo "🔧 Auth is disabled - you'll be automatically logged in as 'Local Dev User'" 