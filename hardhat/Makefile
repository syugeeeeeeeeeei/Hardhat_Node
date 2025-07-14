# .PHONY: ターゲットがファイル名と衝突しないように設定
# これにより、同名のファイルが存在してもコマンドが正しく実行されます。
.PHONY: all help init project-deploy pde project-script psc project-list pls project-remove prm

# デフォルトターゲット: `make` のみ実行された場合はヘルプを表示
all: help

# ヘルプメッセージ
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Project Commands:"
	@echo "  init [NAME=<project>]             Initialize a new hardhat project."
	@echo "  project-list (pls)              List all available projects."
	@echo "  project-deploy (pde) [P=<project>]  Deploy contracts in a project."
	@echo "  project-script (psc) [P=<project>]  Run a script in a project."
	@echo "  project-remove (prm) [P=<project>]  Delete a project."
	@echo ""
	@echo "Examples:"
	@echo "  make init NAME=\"MyAwesomeProject\""
	@echo "  make pde                          (Interactive mode)"
	@echo "  make psc P=\"MyAwesomeProject\""
	@echo "  make prm"

# プロジェクトの初期化
init:
	@yarn node -r esbuild-register commands/init.ts $(NAME)

# 💡 プロジェクトのデプロイ (引数チェックを削除)
project-deploy:
	@yarn node -r esbuild-register commands/project_deploy_cli.ts $(P) $(M)
pde: project-deploy

# 💡 プロジェクトのスクリプト実行 (引数チェックを削除)
project-script:
	@yarn node -r esbuild-register commands/project_script_cli.ts $(P) $(S)
psc: project-script

# プロジェクトのリスト表示
project-list:
	@yarn node -r esbuild-register commands/project_list_cli.ts
pls: project-list

# プロジェクトの削除
project-remove:
	@yarn node -r esbuild-register commands/project_remove_cli.ts $(P)
prm: project-remove