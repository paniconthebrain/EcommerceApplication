#!/usr/bin/env bash
# ============================================================
# GoGO Pantry — Mac/Linux Auto Setup Script
# Run: chmod +x setup.sh && ./setup.sh
# ============================================================

set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
step()  { echo -e "\n${CYAN}==> $1${NC}"; }
ok()    { echo -e "  ${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "  ${YELLOW}[!!]${NC} $1"; }
fail()  { echo -e "  ${RED}[XX]${NC} $1"; }

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo -e "${GREEN}  ╔══════════════════════════════════╗"
echo -e "  ║     GoGO Pantry — Auto Setup     ║"
echo -e "  ╚══════════════════════════════════╝${NC}"
echo ""

# ── Detect OS ────────────────────────────────────────────────
OS="$(uname -s)"
LINUX_DISTRO=""
if [ "$OS" = "Linux" ] && [ -f /etc/os-release ]; then
    LINUX_DISTRO=$(grep -oP '(?<=^ID=).+' /etc/os-release | tr -d '"')
fi

# ── 1. Node.js ────────────────────────────────────────────────
step "Checking Node.js..."
NODE_OK=false
if command -v node &>/dev/null; then
    NODE_VER=$(node --version)
    MAJOR=$(echo "$NODE_VER" | sed 's/v\([0-9]*\).*/\1/')
    if [ "$MAJOR" -ge 18 ]; then
        ok "Node.js $NODE_VER found"
        NODE_OK=true
    else
        warn "Node.js $NODE_VER too old (need v18+). Will upgrade."
    fi
else
    warn "Node.js not found. Will install."
fi

if [ "$NODE_OK" = false ]; then
    step "Installing Node.js..."
    if [ "$OS" = "Darwin" ]; then
        if ! command -v brew &>/dev/null; then
            warn "Homebrew not found. Installing Homebrew first..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install node@20
        brew link node@20 --force --overwrite 2>/dev/null || true
    elif [ "$LINUX_DISTRO" = "ubuntu" ] || [ "$LINUX_DISTRO" = "debian" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [ "$LINUX_DISTRO" = "fedora" ] || [ "$LINUX_DISTRO" = "rhel" ] || [ "$LINUX_DISTRO" = "centos" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo dnf install -y nodejs
    else
        fail "Could not auto-install Node.js for your OS."
        echo "  Install manually from: https://nodejs.org"
        exit 1
    fi
    ok "Node.js $(node --version) installed"
fi

# ── 2. PostgreSQL ─────────────────────────────────────────────
step "Checking PostgreSQL..."
PG_OK=false
if command -v psql &>/dev/null; then
    ok "PostgreSQL found: $(psql --version)"
    PG_OK=true
else
    warn "PostgreSQL not found. Will install."
fi

if [ "$PG_OK" = false ]; then
    step "Installing PostgreSQL..."
    if [ "$OS" = "Darwin" ]; then
        brew install postgresql@16
        brew services start postgresql@16
        echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zprofile
        export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
    elif [ "$LINUX_DISTRO" = "ubuntu" ] || [ "$LINUX_DISTRO" = "debian" ]; then
        sudo apt-get update -q
        sudo apt-get install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    elif [ "$LINUX_DISTRO" = "fedora" ] || [ "$LINUX_DISTRO" = "rhel" ] || [ "$LINUX_DISTRO" = "centos" ]; then
        sudo dnf install -y postgresql-server postgresql-contrib
        sudo postgresql-setup --initdb
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    else
        fail "Could not auto-install PostgreSQL for your OS."
        echo "  Install manually from: https://www.postgresql.org/download/"
        exit 1
    fi
    ok "PostgreSQL installed"
fi

# ── 3. .env file ──────────────────────────────────────────────
step "Configuring backend environment..."
ENV_PATH="$ROOT_DIR/backend/.env"
if [ -f "$ENV_PATH" ]; then
    ok "backend/.env already exists — skipping"
else
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-f0-9' | head -c 64)
    echo -n "  Enter PostgreSQL 'postgres' password (default: postgres): "
    read -r PG_PASS
    [ -z "$PG_PASS" ] && PG_PASS="postgres"

    cat > "$ENV_PATH" <<EOF
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gogopantry
DB_USER=postgres
DB_PASSWORD=$PG_PASS

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3002

# Email (optional)
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
APP_URL=http://localhost:3001
EOF
    ok "backend/.env created"
fi

# Load env vars
export $(grep -v '^#' "$ENV_PATH" | grep -v '^\s*$' | xargs)

# ── 4. npm install ────────────────────────────────────────────
step "Installing backend dependencies..."
cd "$ROOT_DIR/backend" && npm install --silent
ok "Backend dependencies installed"

step "Installing Customer Webapp dependencies..."
cd "$ROOT_DIR/GoGO Pantry Customer WebApp"
[ -f package.json ] && npm install --silent && ok "Customer webapp dependencies installed" || ok "No package.json — skipping"

step "Installing Staff Webapp dependencies..."
cd "$ROOT_DIR/GoGO Pantry Staff"
[ -f package.json ] && npm install --silent && ok "Staff webapp dependencies installed" || ok "No package.json — skipping"

# ── 5. Create database ────────────────────────────────────────
step "Setting up PostgreSQL database..."
export PGPASSWORD="$DB_PASSWORD"
DB_EXISTS=$(psql -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -w "$DB_NAME" || true)
if [ -n "$DB_EXISTS" ]; then
    ok "Database '$DB_NAME' already exists — skipping"
else
    psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null && ok "Database '$DB_NAME' created" || \
        warn "Could not create DB automatically. Run: psql -U postgres -c 'CREATE DATABASE $DB_NAME;'"
fi

# ── 6. Seed ───────────────────────────────────────────────────
step "Seeding database..."
cd "$ROOT_DIR/backend"
node seed.js && ok "Database seeded" || warn "Seed failed or already seeded — continuing"

# ── 7. Done ───────────────────────────────────────────────────
echo ""
echo -e "${GREEN}  ╔════════════════════════════════════════╗"
echo -e "  ║          Setup Complete!               ║"
echo -e "  ╠════════════════════════════════════════╣"
echo -e "  ║  Backend API:   http://localhost:3000  ║"
echo -e "  ║  Customer App:  http://localhost:3001  ║"
echo -e "  ║  Staff App:     http://localhost:3002  ║"
echo -e "  ╚════════════════════════════════════════╝${NC}"
echo ""
echo -n "  Start all servers now? (Y/n): "
read -r LAUNCH
if [ "$LAUNCH" != "n" ] && [ "$LAUNCH" != "N" ]; then
    cd "$ROOT_DIR/backend"          && npm start &
    cd "$ROOT_DIR/GoGO Pantry Customer WebApp" && node server.js &
    cd "$ROOT_DIR/GoGO Pantry Staff"           && node server.js &
    ok "All servers started (running in background)"
    echo -e "  ${CYAN}Press Ctrl+C to stop all servers${NC}"
    wait
fi
