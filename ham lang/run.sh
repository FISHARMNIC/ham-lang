if (node main.js $1) ; then
cd run
limactl shell debian ./assemble.sh 
./run.sh
cd ../
fi