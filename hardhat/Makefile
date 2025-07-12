# ==============================================================================
# Makefile for Hardhat Project
#
# Manages compilation and deployment of Solidity contracts.
# ==============================================================================

# --- Variables ---
# @-prefix suppresses command echoing.
# ?= allows overriding from the command line (e.g., make deploy NETWORK=sepolia)

# The core hardhat command
HARDHAT := yarn hardhat

# Default network to use for deployment
# ★★★ ここを 'anvil' に変更 ★★★
NETWORK ?= anvil

# Paths to deployment scripts
SCRIPT_STORAGE := scripts/HtmlStorage/deploy.ts
SCRIPT_PROXY   := scripts/HtmlProxy/deploy.ts

# --- Help Target (Self-documentation) ---
# Provides a user-friendly list of available commands.
# `make` or `make help` will run this.
.PHONY: help
help:
	@echo "Usage: make [target] [NETWORK=<network_name>]"
	@echo "Default network is set to: \033[33m$(NETWORK)\033[0m"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --- Core Targets ---

.PHONY: all
all: compile ## (Default) Compiles all contracts.

.PHONY: compile
compile: ## Compiles all Solidity contracts.
	@echo "⚙️  Compiling contracts..."
	@$(HARDHAT) compile

.PHONY: clean
clean: ## Cleans the project (removes cache and artifacts).
	@echo "🧹 Cleaning up project artifacts..."
	@$(HARDHAT) clean

# --- Deployment Targets ---

.PHONY: deploy
deploy: deploy-storage deploy-proxy ## Deploys all contracts to the specified network.

.PHONY: deploy-storage
deploy-storage: compile ## Deploys the HtmlStorage contract.
	@echo "🚀 Deploying HtmlStorage to network: \033[33m$(NETWORK)\033[0m..."
	@$(HARDHAT) run $(SCRIPT_STORAGE) --network $(NETWORK)
	@echo "✅ HtmlStorage deployment script finished."

.PHONY: deploy-proxy
deploy-proxy: compile ## Deploys the HtmlProxy and its child contracts.
	@echo "🚀 Deploying HtmlProxy to network: \033[33m$(NETWORK)\033[0m..."
	@$(HARDHAT) run $(SCRIPT_PROXY) --network $(NETWORK)
	@echo "✅ HtmlProxy deployment script finished."

# --- Node Modules ---
# A simple check to ensure dependencies are installed.
node_modules: package.json
	@echo "📦 Installing npm dependencies..."
	@npm install
