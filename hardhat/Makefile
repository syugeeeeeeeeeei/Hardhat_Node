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
	@echo "  init [NAME=<project-name>]        Initialize a new hardhat project."
	@echo "  project-list (pls)              List all available projects."
	@echo "  project-deploy (pde) P=<project>  Deploy contracts in a project."
	@echo "  project-script (psc) P=<project>  Run a script in a project."
	@echo "  project-remove (prm) [P=<project>]  Delete a project."
	@echo ""
	@echo "Examples:"
	@echo "  make init NAME=\"MyAwesomeProject\""
	@echo "  make init                         (Interactive mode)"
	@echo "  make pls"
	@echo "  make pde P=\"MyAwesomeProject\""
	@echo "  make psc P=\"MyAwesomeProject\" S=MyAwesomeProjectScript.ts"
	@echo "  make prm P=\"MyAwesomeProject\""
	@echo "  make prm                          (Interactive mode)"

# プロジェクトの初期化
# NAMEを指定しない場合は、スクリプトが対話的に入力を求めます。
init:
	@yarn node -r esbuild-register commands/init.ts $(NAME)

# プロジェクトのデプロイ
project-deploy:
ifndef P
	@echo "Error: P (project name) is not set."
	@echo "Usage: make project-deploy P=<project-name> [M=<module-path>]"
	@exit 1
endif
	@yarn node -r esbuild-register commands/project_deploy_cli.ts $(P) $(M)
pde: project-deploy

# プロジェクトのスクリプト実行
project-script:
ifndef P
	@echo "Error: P (project name) is not set."
	@echo "Usage: make project-script P=<project-name> [S=<script-path>]"
	@exit 1
endif
	@yarn node -r esbuild-register commands/project_script_cli.ts $(P) $(S)
psc: project-script

# プロジェクトのリスト表示
# OSに依存しないようにNode.jsスクリプトで実行します。
project-list:
	@yarn node -r esbuild-register commands/project_list_cli.ts
pls: project-list

# プロジェクトの削除
# 安全のため、確認プロンプトが表示されるスクリプトを介して実行します。
project-remove:
	@yarn node -r esbuild-register commands/project_remove_cli.ts $(P)
prm: project-remove