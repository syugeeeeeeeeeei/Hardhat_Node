# Makefile

# .PHONY: ターゲットがファイル名と衝突しないように設定
# これにより、同名のファイルが存在してもコマンドが正しく実行されます。
.PHONY: all help init project-compile pco project-deploy pde project-script psc project-list pls project-remove prm project-unify pun network-list nls network-switch nsw

# デフォルトターゲット: `make` のみ実行された場合はヘルプを表示
all: help

# .envファイルを読み込み、変数をエクスポートする
# これにより、サブシェルで実行されるコマンドでも環境変数が利用可能になる
ifneq (,$(wildcard ./hardhat/.env))
    include ./hardhat/.env
    export
endif

# デフォルトのネットワークが設定されていなければ 'geth' を使用
DEFAULT_NETWORK ?= geth

# ヘルプメッセージ
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Core Commands:"
	@echo "  project-compile (pco)            Compile all contracts."
	@echo ""
	@echo "Project Management:"
	@echo "  init [NAME=<project>]            Initialize a new hardhat project."
	@echo "  project-list (pls)               List all available projects."
	@echo "  project-deploy (pde) [P=<p>] [M=<m>]  Compile and deploy contracts to the current network."
	@echo "  project-script (psc) [P=<p>] [S=<s>]  Compile and run a script on the current network."
	@echo "  project-remove (prm) [P=<project>]   Delete a project."
	@echo "  project-unify (pun) [P=<project>]    Unify all files in a project into a single text file."
	@echo ""
	@echo "Network Management:"
	@echo "  network-list (nls)                List available networks."
	@echo "  network-switch (nsw) [N=<network>] Switch the default network."


# コンパイル
project-compile:
	@yarn hardhat compile-project
pco: project-compile

# デプロイ (選択されたネットワークを使用)
project-deploy: project-compile
	@DOCKER_COMMAND="yarn hardhat deploy-project --network $(DEFAULT_NETWORK)"; \
	if [ ! -z "$(P)" ]; then DOCKER_COMMAND="$$DOCKER_COMMAND --project $(P)"; fi; \
	if [ ! -z "$(M)" ]; then DOCKER_COMMAND="$$DOCKER_COMMAND --module $(M)"; fi; \
	eval $$DOCKER_COMMAND
pde: project-deploy

# スクリプト実行 (選択されたネットワークを使用)
project-script: project-compile
	@DOCKER_COMMAND="yarn hardhat run-script --network $(DEFAULT_NETWORK)"; \
	if [ ! -z "$(P)" ]; then DOCKER_COMMAND="$$DOCKER_COMMAND --project $(P)"; fi; \
	if [ ! -z "$(S)" ]; then DOCKER_COMMAND="$$DOCKER_COMMAND --script $(S)"; fi; \
	eval $$DOCKER_COMMAND
psc: project-script

# プロジェクトの初期化
init:
	@yarn node -r esbuild-register commands/init.ts $(NAME)

# プロジェクトのリスト表示
project-list:
	@yarn node -r esbuild-register commands/project_list_cli.ts
pls: project-list

# プロジェクトの削除
project-remove:
	@yarn node -r esbuild-register commands/project_remove_cli.ts $(P)
prm: project-remove

# プロジェクトファイルの統合
project-unify:
	@yarn node -r esbuild-register commands/project_unify_cli.ts $(P)
pun: project-unify

# --- ネットワーク管理コマンド ---

# ネットワーク一覧表示
network-list:
	@yarn node -r esbuild-register commands/network_list_cli.ts
nls: network-list

# ネットワーク切り替え
network-switch:
	@yarn node -r esbuild-register commands/network_switch_cli.ts $(N)
nsw: network-switch