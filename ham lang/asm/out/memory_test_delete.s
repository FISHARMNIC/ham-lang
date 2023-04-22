.intel_syntax
.org 0x100
.global _kernel_entry
.section .data

label: .asciz "hello my name is nico"

.section .text
_kernel_entry:
lea %ecx, label
mov [0], %ecx
// movb [0], 'N'
// movb [1], 'I'
// movb [2], 'C'
// movb [3], 'O'
hlt
ret
