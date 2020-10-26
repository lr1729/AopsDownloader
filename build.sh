mkdir -p ./build
rm -f ./build/*
pkg downloader.js -t node14-linux-x64 --output ./build/aopsdownloader-linux
pkg downloader.js -t node14-win-x64 --output ./build/aopsdownloader-macos
pkg downloader.js -t node14-win-x64 --output ./build/aopsdownloader-windows
