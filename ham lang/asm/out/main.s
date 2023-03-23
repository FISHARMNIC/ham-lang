.intel_syntax
.org 0x100
.global _kernel_entry

.section .data
_stack_d1_: .long 0
_stack_d2_: .long 0

_return_i8_: .byte 0
_return_i16_: .2byte 0
_return_i32_: .4byte 0

_return_void_: .byte 0

.include "libs/shift.s"
.include "libs/string.s"
.include "libs/io.s"

.section .data


i: .4byte 0
_TEMP32_0_: .4byte 0
_TEMP32_1_: .4byte 0

_kernel_entry:
mov %eax, %esp
sub %eax, FRAME_OFFSET
mov _stack_d2_, %eax
mov %ecx, 0
mov i, %ecx

_shift_stack_left_
call main
_shift_stack_right_
hlt

main:
_shift_stack_right_
_LBL0_:
mov %ecx, i
mov _TEMP32_1_, %ecx
xor %ecx, %ecx
mov %ecx, _TEMP32_1_
push %ecx
_shift_stack_left_
call put_int
_shift_stack_right_
mov %ecx, i
inc %ecx
mov i, %ecx
cmp %ecx, 10
jl _LBL0_
_shift_stack_left_
ret
