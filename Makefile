# Makefile at repo root
# Minimal comments focus on *why* only.

SHELL := /bin/bash
PNPM := pnpm
COMPOSE := docker compose

# Detect LAN IP for Expo Go; tries en0 then en1
LAN_IP := $(shell ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)

.PHONY: help
help:
	@echo "Common targets:"
	@echo "  make install         # workspace install"
	@echo "  make turbo/dev       # run all dev scripts via turbo"
	@echo "  make api/dev         # run Nest API"
	@echo "  make mobile/dev      # run Expo (web/LAN)"
	@echo "  make mobile/tunnel   # run Expo in tunnel mode"
	@echo "  make mobile/ip       # write EXPO_PUBLIC_API_BASE with LAN IP"
	@echo "  make db/up|db/down   # start/stop Postgres+Redis"
	@echo "  make db/psql         # psql into the DB"
	@echo "  make clean           # remove node_modules (root + mobile)"

.PHONY: install
install:
	$(PNPM) install

.PHONY: turbo/dev
turbo/dev:
	$(PNPM) -w dev

# --- API ---
.PHONY: api/dev
api/dev:
	cd services/api && $(PNPM) dev

# --- Mobile ---
.PHONY: mobile/dev
mobile/dev:
	cd apps/mobile && $(PNPM) dev

.PHONY: mobile/tunnel
mobile/tunnel:
	cd apps/mobile && $(PNPM) dev -- --tunnel

# Writes apps/mobile/.env so Expo Go hits your Mac API
.PHONY: mobile/ip
mobile/ip:
	@if [ -z "$(LAN_IP)" ]; then echo "Could not detect LAN IP. Set EXPO_PUBLIC_API_BASE manually."; exit 1; fi
	@mkdir -p apps/mobile
	@echo "EXPO_PUBLIC_API_BASE=http://$(LAN_IP):4000" > apps/mobile/.env
	@echo "Wrote apps/mobile/.env with EXPO_PUBLIC_API_BASE=http://$(LAN_IP):4000"

# --- Docker DB ---
.PHONY: db/up
db/up:
	$(COMPOSE) up -d

.PHONY: db/down
db/down:
	$(COMPOSE) down

.PHONY: db/psql
db/psql:
	$(COMPOSE) exec db bash -lc 'psql -h 127.0.0.1 -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

# --- Cleanup ---
.PHONY: clean
clean:
	rm -rf node_modules apps/mobile/node_modules
	@echo "Removed node_modules in root and apps/mobile"