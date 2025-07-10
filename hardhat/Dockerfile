# Node.jsの公式LTSイメージを使用
FROM node:lts

# コンテナ内の作業ディレクトリを設定
# docker-compose.ymlのworking_dirと一致させる
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピーして依存関係をインストール
# これにより、package.jsonが変更されない限り、層がキャッシュされビルドが高速化される
COPY package*.json ./

# プロジェクトの依存関係をインストール
# npm ciはpackage-lock.jsonに基づいてクリーンなインストールを行うため、推奨される
RUN corepack enable 
RUN yarn set version stable
RUN yarn install

# プロジェクトの残りのファイルをコンテナにコピー
COPY . .

