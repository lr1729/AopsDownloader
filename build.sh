mkdir -p ./build
rm -f ./build/*
pkg downloader.js -t node14-linux-x64,node14-macos-x64,node14-win-x64 --out-path build
