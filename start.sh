#!/bin/bash


# ================================================================================================
# 🚀 OBSERVER AI - COMPREHENSIVE SETUP SCRIPT 🚀
# ================================================================================================
# This script handles everything to get Observer AI running locally with style!
# Features:
# - 🎨 Beautiful colored output with emojis
# - 🔧 Automatic Ollama installation and setup
# - 🔒 Choice between auth-enabled and no-auth modes
# - 🐳 Docker or native setup options
# - 📦 Observer-ollama proxy setup
# - 🎯 Step-by-step guided installation
# ================================================================================================


# Color definitions for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color
BOLD='\033[1m'


# Function to print colored headers
print_header() {
   echo ""
   echo -e "${CYAN}================================================================================================${NC}"
   echo -e "${WHITE}${BOLD}$1${NC}"
   echo -e "${CYAN}================================================================================================${NC}"
   echo ""
}


# Function to print step headers
print_step() {
   echo ""
   echo -e "${BLUE}📋 $1${NC}"
   echo -e "${BLUE}────────────────────────────────────────────────────────────────────────────────────────────────${NC}"
}


# Function to print success messages
print_success() {
   echo -e "${GREEN}✅ $1${NC}"
}


# Function to print warning messages
print_warning() {
   echo -e "${YELLOW}⚠️  $1${NC}"
}


# Function to print error messages
print_error() {
   echo -e "${RED}❌ $1${NC}"
}


# Function to print info messages
print_info() {
   echo -e "${PURPLE}ℹ️  $1${NC}"
}


# Function to ask yes/no questions
ask_yes_no() {
   while true; do
       echo -ne "${YELLOW}$1 (y/n): ${NC}"
       read -r yn
       case $yn in
           [Yy]* ) return 0;;
           [Nn]* ) return 1;;
           * ) echo -e "${RED}Please answer yes or no.${NC}";;
       esac
   done
}


# Function to check if a command exists
command_exists() {
   command -v "$1" >/dev/null 2>&1
}


# Function to detect OS
detect_os() {
   if [[ "$OSTYPE" == "linux-gnu"* ]]; then
       echo "linux"
   elif [[ "$OSTYPE" == "darwin"* ]]; then
       echo "macos"
   elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
       echo "windows"
   else
       echo "unknown"
   fi
}


# Function to install Ollama
install_ollama() {
   local os=$(detect_os)
  
   print_step "🤖 Installing Ollama"
  
   case $os in
       "linux")
           print_info "Installing Ollama on Linux..."
           curl -fsSL https://ollama.com/install.sh | sh
           ;;
       "macos")
           if command_exists brew; then
               print_info "Installing Ollama via Homebrew..."
               brew install ollama
           else
               print_info "Installing Ollama via curl..."
               curl -fsSL https://ollama.com/install.sh | sh
           fi
           ;;
       "windows")
           print_error "Please manually install Ollama from https://ollama.com/download"
           print_info "After installation, please restart this script."
           exit 1
           ;;
       *)
           print_error "Unsupported operating system. Please manually install Ollama from https://ollama.com"
           exit 1
           ;;
   esac
  
   if command_exists ollama; then
       print_success "Ollama installed successfully!"
   else
       print_error "Ollama installation failed. Please install manually from https://ollama.com"
       exit 1
   fi
}


# Function to start Ollama service
start_ollama() {
   print_step "🔄 Starting Ollama Service"
  
   local os=$(detect_os)
  
   # Check if Ollama is already running
   if curl -s http://localhost:11434/api/version >/dev/null 2>&1; then
       print_success "Ollama is already running!"
       return 0
   fi
  
   case $os in
       "linux")
           if command_exists systemctl; then
               print_info "Starting Ollama via systemctl..."
               sudo systemctl start ollama
               sudo systemctl enable ollama
           else
               print_info "Starting Ollama in background..."
               nohup ollama serve > /dev/null 2>&1 &
               sleep 3
           fi
           ;;
       "macos")
           print_info "Starting Ollama service..."
           # On macOS, ollama serve runs in foreground, so we run it in background
           nohup ollama serve > /dev/null 2>&1 &
           sleep 3
           ;;
   esac
  
   # Wait for Ollama to be ready
   print_info "Waiting for Ollama to be ready..."
   for i in {1..30}; do
       if curl -s http://localhost:11434/api/version >/dev/null 2>&1; then
           print_success "Ollama is running and ready!"
           return 0
       fi
       sleep 1
   done
  
   print_error "Ollama failed to start. Please check the installation."
   return 1
}


# Function to pull recommended models
setup_ollama_models() {
   print_step "🧠 Setting up AI Models"
  
   print_info "Recommended models for Observer AI:"
   echo -e "${WHITE}• gemma3:4b${NC} - Great balance of performance and speed (RECOMMENDED)"
   echo -e "${WHITE}• llama3.3:latest${NC} - Latest Llama model with excellent capabilities"
   echo -e "${WHITE}• deepseek-r1:latest${NC} - Advanced reasoning model"
   echo -e "${WHITE}• llama3.2:3b${NC} - Fast and lightweight option"
   echo ""
  
   if ask_yes_no "Would you like to install the recommended gemma3:4b model? (~3GB download)"; then
       print_info "Pulling gemma3:4b model..."
       ollama pull gemma3:4b
       if [ $? -eq 0 ]; then
           print_success "gemma3:4b model installed successfully!"
       else
           print_warning "Failed to pull gemma3:4b. You can install it later with: ollama pull gemma3:4b"
       fi
   fi
  
   if ask_yes_no "Would you like to install llama3.3:latest model? (~4.7GB download)"; then
       print_info "Pulling llama3.3:latest model..."
       ollama pull llama3.3:latest
       if [ $? -eq 0 ]; then
           print_success "llama3.3:latest model installed successfully!"
       else
           print_warning "Failed to pull llama3.3:latest. You can install it later with: ollama pull llama3.3:latest"
       fi
   fi
  
   if ask_yes_no "Would you like to install deepseek-r1:latest model? (~8.9GB download)"; then
       print_info "Pulling deepseek-r1:latest model..."
       ollama pull deepseek-r1:latest
       if [ $? -eq 0 ]; then
           print_success "deepseek-r1:latest model installed successfully!"
       else
           print_warning "Failed to pull deepseek-r1:latest. You can install it later with: ollama pull deepseek-r1:latest"
       fi
   fi
  
   if ask_yes_no "Would you like to install the lightweight llama3.2:3b model? (~2GB download)"; then
       print_info "Pulling llama3.2:3b model..."
       ollama pull llama3.2:3b
       if [ $? -eq 0 ]; then
           print_success "llama3.2:3b model installed successfully!"
       else
           print_warning "Failed to pull llama3.2:3b. You can install it later with: ollama pull llama3.2:3b"
       fi
   fi
  
   # Show available models
   print_info "Currently installed models:"
   ollama list
}


# Function to install Python dependencies
setup_python_env() {
   print_step "🐍 Setting up Python Environment"
  
   if ! command_exists python3; then
       print_error "Python 3 is required but not installed. Please install Python 3 and try again."
       exit 1
   fi
  
   print_success "Python 3 found: $(python3 --version)"
  
   # Check if pip is available
   if ! command_exists pip3; then
       print_error "pip3 is required but not found. Please install pip3 and try again."
       exit 1
   fi
  
   # Install observer-ollama
   print_info "Installing observer-ollama proxy..."
   cd observer-ollama
   pip3 install . --user
   cd ..
  
   # Test if the module works properly
   if python3 -c "import observer_ollama" 2>/dev/null; then
       print_success "observer-ollama installed successfully!"
   else
       # Try alternative installation method
       print_info "Trying alternative installation method..."
       cd observer-ollama
       pip3 install --break-system-packages . --user
       cd ..
       if python3 -c "import observer_ollama" 2>/dev/null; then
           print_success "observer-ollama installed successfully!"
       else
           print_error "Failed to install observer-ollama. Please check Python/pip installation."
           exit 1
       fi
   fi
}


# Function to setup Node.js environment
setup_node_env() {
   print_step "📦 Setting up Node.js Environment"
  
   if ! command_exists node || ! command_exists npm; then
       print_error "Node.js and npm are required but not found."
       print_info "Please install Node.js from: https://nodejs.org/"
       exit 1
   fi
  
   print_success "Node.js found: $(node --version)"
   print_success "npm found: $(npm --version)"
  
   # Install app dependencies
   print_info "Installing Observer AI webapp dependencies..."
   cd app
  
   if [ ! -d "node_modules" ]; then
       print_info "Installing npm packages (this may take a moment)..."
       npm install
   else
       print_success "Node modules already installed!"
   fi
  
   cd ..
}


# Function to start services based on mode
start_local_no_auth() {
   print_step "🚀 Starting Observer AI (No Auth Mode)"
  
   # Set environment variable for no auth
   export VITE_DISABLE_AUTH=true
  
   print_info "Starting observer-ollama proxy..."
   cd observer-ollama
   python3 -m observer_ollama --disable-ssl --enable-exec &
   PROXY_PID=$!
   cd ..
  
   # Wait for proxy to start
   sleep 3
  
   print_info "Starting Observer AI webapp..."
   cd app
  
   # Build the app
   print_info "Building webapp..."
   npm run build
  
   # Start the preview server
   print_success "🎉 Observer AI is starting!"
   echo ""
   print_header "🌟 ACCESS YOUR OBSERVER AI INSTALLATION 🌟"
   echo -e "${GREEN}🌐 Webapp: ${WHITE}http://localhost:8080${NC}"
   echo -e "${GREEN}🔧 Proxy:  ${WHITE}http://localhost:3838${NC}"
   echo -e "${GREEN}🤖 Ollama: ${WHITE}http://localhost:11434${NC}"
   echo ""
   echo -e "${YELLOW}📝 In the Observer AI interface:${NC}"
   echo -e "   • Set Model Server Address to: ${WHITE}http://localhost:3838${NC}"
   echo -e "   • Auth is disabled - you'll be automatically logged in${NC}"
   echo ""
   echo -e "${CYAN}Press Ctrl+C to stop all services${NC}"
  
   # Function to cleanup on exit
   cleanup() {
       echo ""
       print_info "Shutting down services..."
       kill $PROXY_PID 2>/dev/null
       exit 0
   }
   trap cleanup INT
  
   npm run preview
}


# Function to start services with auth
start_auth_local() {
   print_step "🚀 Starting Observer AI (Auth Mode)"
  
   # Make sure auth is not disabled
   unset VITE_DISABLE_AUTH
  
   print_info "Starting observer-ollama proxy with SSL..."
   cd observer-ollama
   python3 -m observer_ollama --enable-exec &
   PROXY_PID=$!
   cd ..
  
   # Wait for proxy to start
   sleep 3
  
   print_info "Starting Observer AI webapp..."
   cd app
  
   # Build the app
   print_info "Building webapp..."
   npm run build
  
   # Start the preview server
   print_success "🎉 Observer AI is starting!"
   echo ""
   print_header "🌟 ACCESS YOUR OBSERVER AI INSTALLATION 🌟"
   echo -e "${GREEN}🌐 Webapp: ${WHITE}http://localhost:8080${NC}"
   echo -e "${GREEN}🔧 Proxy:  ${WHITE}https://localhost:3838${NC}"
   echo -e "${GREEN}🤖 Ollama: ${WHITE}http://localhost:11434${NC}"
   echo ""
   echo -e "${YELLOW}📝 Setup Instructions:${NC}"
   echo -e "   1. Visit ${WHITE}https://localhost:3838${NC} and accept the self-signed certificate"
   echo -e "   2. In Observer AI, set Model Server Address to: ${WHITE}https://localhost:3838${NC}"
   echo -e "   3. Sign in with your Auth0 account"
   echo ""
   echo -e "${CYAN}Press Ctrl+C to stop all services${NC}"
  
   # Function to cleanup on exit
   cleanup() {
       echo ""
       print_info "Shutting down services..."
       kill $PROXY_PID 2>/dev/null
       exit 0
   }
   trap cleanup INT
  
   npm run preview
}


# Function to start with Docker
start_docker_mode() {
   print_step "🐳 Starting with Docker"
  
   if ! command_exists docker; then
       print_error "Docker is required but not found. Please install Docker and try again."
       exit 1
   fi
  
   if ! command_exists docker-compose; then
       print_error "Docker Compose is required but not found. Please install Docker Compose and try again."
       exit 1
   fi
  
   echo -e "${YELLOW}Choose Docker setup mode:${NC}"
   echo -e "${WHITE}1)${NC} Full Docker (includes Ollama) - Recommended"
   echo -e "${WHITE}2)${NC} Local development mode (no auth)"
   echo ""
  
   while true; do
       echo -ne "${YELLOW}Enter your choice (1-2): ${NC}"
       read -r choice
       case $choice in
           1)
               print_info "Starting full Docker setup..."
               docker-compose up --build
               break
               ;;
           2)
               export VITE_DISABLE_AUTH=true
               print_info "Starting local development Docker setup..."
               docker-compose -f docker-compose.local.yml up --build
               break
               ;;
           *)
               print_error "Invalid choice. Please enter 1 or 2."
               ;;
       esac
   done
}


# Main function
main() {
   # Clear screen and show welcome
   clear
   print_header "🚀 WELCOME TO OBSERVER AI SETUP 🚀"
  
   echo -e "${WHITE}Observer AI is a privacy-first platform for local AI agents that observe your screen!${NC}"
   echo ""
   echo -e "${PURPLE}🔒 Privacy First:${NC} Everything runs locally on your machine"
   echo -e "${PURPLE}🤖 AI Powered:${NC} Use any Ollama-compatible model"
   echo -e "${PURPLE}🎯 Smart Agents:${NC} Create agents that watch, log, and react"
   echo ""
  
   # Check if we're in the right directory
   if [ ! -f "package.json" ] && [ ! -f "app/package.json" ]; then
       print_error "Please run this script from the Observer AI root directory."
       exit 1
   fi
  
   # Choose setup mode
   echo -e "${YELLOW}Choose your setup mode:${NC}"
   echo -e "${WHITE}1)${NC} 🏠 All Local (No Auth) - Simple setup, same device only"
   echo -e "${WHITE}2)${NC} 🔐 Auth + Local - Full features, cross-device access"
   echo -e "${WHITE}3)${NC} 🐳 Docker Mode - Containerized setup"
   echo ""
  
   while true; do
       echo -ne "${YELLOW}Enter your choice (1-3): ${NC}"
       read -r mode
       case $mode in
           1)
               MODE="local-no-auth"
               break
               ;;
           2)
               MODE="auth-local"
               break
               ;;
           3)
               MODE="docker"
               break
               ;;
           *)
               print_error "Invalid choice. Please enter 1, 2, or 3."
               ;;
       esac
   done
  
   # Docker mode has its own flow
   if [ "$MODE" = "docker" ]; then
       start_docker_mode
       return
   fi
  
   # Check and install Ollama if needed
   if ! command_exists ollama; then
       print_warning "Ollama not found on your system."
       if ask_yes_no "Would you like to install Ollama automatically?"; then
           install_ollama
       else
           print_error "Ollama is required for local AI inference. Please install it manually from https://ollama.com"
           exit 1
       fi
   else
       print_success "Ollama found: $(ollama --version)"
   fi
  
   # Start Ollama service
   start_ollama
  
   # Setup models - skipped for faster setup
   print_info "Skipping AI model installation for faster setup. You can install models later using: ollama pull <model-name>"
  
   # Setup Python environment (for observer-ollama)
   setup_python_env
  
   # Setup Node.js environment (for webapp)
   setup_node_env
  
   # Start services based on mode
   case $MODE in
       "local-no-auth")
           start_local_no_auth
           ;;
       "auth-local")
           start_auth_local
           ;;
   esac
}


# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
   main "$@"
fi

