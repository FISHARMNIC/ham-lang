cd ../

echo "===== Compilation Started ====="
node main.js

echo "=====  Assembler Started  ====="

mkdir /tmp/lima/bin

echo 1

cd asm
as --32 boot/boot.s -o /tmp/lima/bin/boot.o

echo 2
if (as --32 out/main.s -o /tmp/lima/bin/kernel.o) ; then
    echo 3
    #linking the kernel with kernel.o and boot.o files
    if (ld -m elf_i386 -T boot/linker.ld /tmp/lima/bin/kernel.o /tmp/lima/bin/boot.o -o /tmp/lima/bin/MyOS.bin -nostdlib) ; then
        echo 4
        #check MyOS.bin file is x86 multiboot file or not
        grub-file --is-x86-multiboot /tmp/lima/bin/MyOS.bin

        #building the iso file
        mkdir -p /tmp/lima/isodir/boot/grub
        cp /tmp/lima/bin/MyOS.bin /tmp/lima/isodir/boot/MyOS.bin
        cp boot/grub.cfg /tmp/lima/isodir/boot/grub/grub.cfg
        grub-mkrescue -o /tmp/lima/bin/MyOS.iso /tmp/lima/isodir

        #run the qemu
        qemu-system-x86_64 -cdrom /tmp/lima/bin/MyOS.iso
    fi
fi

exit