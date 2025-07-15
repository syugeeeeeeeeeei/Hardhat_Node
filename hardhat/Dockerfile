# Node.jsの公式LTSイメージを使用
FROM node:lts

# コンテナ内の作業ディレクトリを設定
# docker-compose.ymlのworking_dirと一致させる
WORKDIR /app

RUN apt update && apt install tree

# package.jsonとyarn.lockをコピーして依存関係をインストール
# これにより、package.json/yarn.lockが変更されない限り、層がキャッシュされビルドが高速化される
COPY package.json ./

# Corepackを有効にし、Yarnをインストールして依存関係をインストール
RUN corepack enable && \
	yarn set version stable && \
	yarn config set nodeLinker node-modules
RUN yarn install
