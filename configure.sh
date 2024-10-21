echo Running npm init
echo "--------------------------"
npm init
npm pkg set scripts.start="node --experimental-json-modules start.mjs"
npm pkg set type="module"
echo "Installing package dependencies"
echo "----------------------------"
npm install colors mongodb uuid short-uuid node-static node-fetch unzipper live-plugin-manager

clear
more help -1