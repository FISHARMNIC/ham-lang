# runs javascipt that waits for "ADDR" in memory
# then runs qemu
# then passes data into address specified

RAM_ADDR=/Users/squijano/Documents/ham\ lang/asm/qemu-memory/qemu-ram
echo -e " ------- \n\n \e[33m  Ctrl + C to exit program when done \e[0m \n\n -------" 
node input.js "$RAM_ADDR" "hello world" &
./run.sh