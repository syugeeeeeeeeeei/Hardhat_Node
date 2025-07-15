# .PHONY: ターゲットがファイル名と衝突しないように設定
# これにより、同名のファイルが存在してもコマンドが正しく実行されます。
.PHONY: all help init project-compile pco project-deploy pde project-script psc project-list pls project-remove prm

# デフォルトターゲット: `make` のみ実行された場合はヘルプを表示
all: help

# ヘルプメッセージ
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Core Commands:"
	@echo "  project-compile (pco)              Compile all contracts."
	@echo ""
	@echo "Project Commands:"
	@echo "  init [NAME=<project>]             Initialize a new hardhat project."
	@echo "  project-list (pls)              List all available projects."
	@echo "  project-deploy (pde) [P=<project>] [M=<module>]  Compile and deploy contracts."
	@echo "  project-script (psc) [P=<project>] [S=<script>]  Compile and run a script."
	@echo "  project-remove (prm) [P=<project>]  Delete a project."

# 新しいコンパイルターゲット
project-compile:
	@yarn hardhat compile-project
pco: project-compile

# deploy と script の依存関係に project-compile を追加
project-deploy: project-compile
	@DOCKER_COMMAND="yarn hardhat deploy-project --network anvil"; \
	if [ ! -z "$(P)" ]; then DOCKER_COMMAND="$$DOCKER_COMMAND --project $(P)"; fi; \
	if [ ! -z "$(M)" ]; then DOCKER_COMMAND="$$DOCKER_COMMAND --module $(M)"; fi; \
	eval $$DOCKER_COMMAND
pde: project-deploy

project-script: project-compile
	@DOCKER_COMMAND="yarn hardhat run-script --network anvil"; \
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