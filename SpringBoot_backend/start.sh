#!/bin/bash

echo "🚀 Starting StackIt Q&A Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📦 Building and starting services..."
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🔍 Checking service status..."
docker-compose ps

echo "✅ StackIt Q&A Platform is running!"
echo ""
echo "🌐 Backend API: http://localhost:8080"
echo "🗄️  Database: localhost:3306"
echo ""
echo "📚 API Documentation:"
echo "  - Authentication: http://localhost:8080/api/auth"
echo "  - Questions: http://localhost:8080/api/questions"
echo "  - WebSocket: ws://localhost:8080/ws"
echo ""
echo "🛠️  Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo ""
echo "🎉 Happy coding!" 