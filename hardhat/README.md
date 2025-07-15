# Hardhat Project Manager

## 📖 概要

このリポジトリは、Hardhatをベースにしたスマートコントラクト開発環境です。<br>
Contract, Ignition, Scriptを包括する**プロジェクト**を効率的に管理するための独自の構成と、<br>
それを支援するカスタムコマンドを提供します。

## 📂 ディレクトリ構造

このリポジトリは、`hardhat.config.ts` の `paths` 設定に基づき、標準のHardhat構成から一部変更されています。ソースコードと生成物が明確に分離されているのが特徴です。

```

hardhat/
├── commands/                  # プロジェクト管理用のカスタムCLIスクリプト群
│   ├── tasks/                 # hardhatタスク(compile, deploy, script)のラッパー
│   ├── templates/             # 新規プロジェクト作成時のテンプレート
│   ├── cli_utils.ts           # 対話形式でプロジェクトを選択するヘルパー
│   ├── init.ts                # 新規プロジェクト初期化コマンド
│   ├── project_list_cli.ts    # プロジェクト一覧表示コマンド
│   └── project_remove_cli.ts  # プロジェクト削除コマンド
│
├── dist/                      # コンパイル成果物やキャッシュの出力先 (Git管理外)
│   ├── artifacts/             # コントラクトのABIなど
│   ├── cache/                 # コンパイルキャッシュ
│   └── ignition/              # Ignitionのデプロイメント関連ファイル
│
├── projects/                  # ✨ スマートコントラクトプロジェクトの格納場所
│   ├── MyProject1/            # (例) プロジェクト1
│   │   ├── contracts/
│   │   ├── ignition/
│   │   └── scripts/
│   └── MyProject2/            # (例) プロジェクト2
│       ├── contracts/
│       ├── ignition/
│       └── scripts/
│
├── test/                      # テストファイル
├── docker-compose.yml         # Docker (Anvil, Hardhat) の設定ファイル
├── hardhat.config.ts          # Hardhatの全体設定
├── package.json               # npmパッケージ管理
└── Makefile                   # 開発用コマンドのショートカット

````


## 📌 「プロジェクト」とは

このリポジトリでは、関連するファイルを一つの論理的な単位として「**プロジェクト**」と呼んでいます。一つのプロジェクトは、通常以下の要素で構成されます。

* **`contracts/`**: スマートコントラクトのSolidityファイル。
* **`ignition/`**: Hardhat Ignitionを使用したデプロイ定義モジュール。
* **`scripts/`**: デプロイ後の検証や、コントラクトと対話するための任意のスクリプト。

これらのファイルを `projects/[プロジェクト名]/` というディレクトリにまとめることで、関心事を明確に分離し、再利用性と管理性を高めています。


## 🚀 利用方法

`Makefile` に定義されたコマンドを使用することで、プロジェクトのライフサイクル全体を簡単に管理できます。コマンドの多くは、引数を省略すると対話形式のウィザードが起動し、選択肢から対象を選ぶことができます。

### 🔹 プロジェクトの初期化

新しいプロジェクトの雛形を作成します。`NAME`変数を省略すると、ウィザードがプロジェクト名の入力を求めます。

```sh
# 'MyNewProject'という名前で新しいプロジェクトを作成
make init NAME=MyNewProject
```

### 🔹 プロジェクトの一覧表示

現在 `projects/` ディレクトリに存在するプロジェクトの一覧を表示します。

```sh
make project-list
# or alias
make pls
```

### 🔹 プロジェクトのコンパイル

`projects/` 内の全てのスマートコントラクトをコンパイルします。デプロイやスクリプト実行の前に自動で実行されます。

```sh
make project-compile
# or alias
make pco
```

### 🔹 プロジェクトのデプロイ

指定したプロジェクトをデプロイします。`P` (Project) 変数を省略すると、ウィザードが起動し、デプロイするプロジェクトを一覧から選択できます。

```sh
# 'HtmlStorage' プロジェクトをデプロイ
make project-deploy P=HtmlStorage
# or alias
make pde P=HtmlStorage

# 引数を省略して対話形式で選択
make pde
```

`M` (Module) 変数で、プロジェクト内の特定のIgnitionモジュールファイルを指定することも可能です。

```sh
make pde P=MyProject M=path/to/MyModule.ts
```

### 🔹 プロジェクトのスクリプト実行

指定したプロジェクトのスクリプトを実行します。`P` (Project) 変数を省略すると、ウィザードで対象プロジェクトを選択できます。

```sh
# 'HtmlProxy' プロジェクトのスクリプトを実行 (スクリプトが1つの場合は自動選択)
make project-script P=HtmlProxy
# or alias
make psc P=HtmlProxy

# 引数を省略して対話形式で選択
make psc
```

`S` (Script) 変数で実行するスクリプトファイルを指定できます。

```sh
make psc P=MyProject S=path/to/MyScript.ts
```

### 🔹 プロジェクトの削除

指定したプロジェクトを削除します。`P` 変数を省略すると、ウィザードで削除対象のプロジェクトを選択できます。

**注意: この操作は取り消せません。**

```sh
# 'MyOldProject' を削除
make project-remove P=MyOldProject
# or alias
make prm P=MyOldProject

# 引数を省略して対話形式で選択
make prm
```