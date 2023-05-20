# change path to local path
RAM_ADDR=/Users/squijano/Documents/ham\ lang/asm/qemu-memory/qemu-ram
qemu-system-x86_64 -m 20m \
-object memory-backend-file,id=pc.ram,size=20M,mem-path="$RAM_ADDR",share=on \
-machine memory-backend=pc.ram -smp cpus=2 \
-drive file=/tmp/lima/bin/MyOS.iso,if=ide \

node qemuhandler.js "$RAM_ADDR"
