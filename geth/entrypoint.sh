#!/bin/sh
# エラーが発生した場合はスクリプトを終了する
set -e

DATADIR="/root/.ethereum"
GENESIS_FILE="/root/genesis.json"

# まだ初期化されていない場合のみ、ジェネシスブロックで初期化を実行
if [ ! -d "${DATADIR}/geth" ]; then
  echo "Initializing Geth with genesis file..."
  geth --datadir "$DATADIR" init "$GENESIS_FILE"
fi

# docker-compose.yml の command で渡された引数で geth を実行する
# exec を使うことで、このスクリプトのプロセスが geth のプロセスに置き換わり、
# シグナル（例: Ctrl+C）が正しく geth に伝わるようになる
exec geth "$@"