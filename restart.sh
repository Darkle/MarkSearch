appToOpen=$1; # app to open, simulating  restart ( entire path of app )
killall -9 $2; #app Name, will come here ex : "Electron"
open -nF $appToOpen;