mkdir -p ./build
rm -f ./build/*
echo "Building linux executable"
pkg downloader.js -t node14-linux-x64 --output ./build/aopsdownloader-linux
echo "Building macos executable"
pkg downloader.js -t node14-macos-x64 --output ./build/aopsdownloader-macos
echo "Building windows executable"
pkg downloader.js -t node14-win-x64 --output ./build/aopsdownloader-windows
