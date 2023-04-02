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


VGA: .4byte 0
_ochar_ch_: .byte 0
_ostr_str_: .4byte 0
i: .4byte 0
_LBL2_: .asciz "hello"
_LBL1_: .4byte 0
_TEMP8_0_: .byte 0
_TEMP8_1_: .byte 0
_TEMP32_0_: .4byte 0
_TEMP32_1_: .4byte 0

_kernel_entry:
mov %eax, %esp
sub %eax, FRAME_OFFSET
mov _stack_d2_, %eax
mov %ecx, 753664
mov VGA, %ecx
mov %ecx, 0
mov i, %ecx
lea %ecx, _LBL2_
mov _LBL1_, %ecx

_shift_stack_left_
call main
_shift_stack_right_
hlt

ochar:
_shift_stack_right_
pop %eax
mov _ochar_ch_, %al
mov %cl, _ochar_ch_
mov _TEMP8_0_, %cl
mov %al, _TEMP8_0_
xor %edx, %edx
mov %edx, VGA
mov [%edx], %al
mov %ecx, VGA
mov _TEMP32_0_, %ecx
mov %ecx, VGA
mov _TEMP32_0_, %ecx
pusha
xor %eax, %eax
xor %ebx, %ebx
xor %ecx, %ecx
mov %eax, _TEMP32_0_
add %eax, 1
mov _TEMP32_1_, %eax
popa
mov %ecx, _TEMP32_1_
mov VGA, %ecx
mov %eax, 15
xor %edx, %edx
mov %edx, VGA
mov [%edx], %eax
mov %ecx, VGA
mov _TEMP32_0_, %ecx
mov %ecx, VGA
mov _TEMP32_0_, %ecx
pusha
xor %eax, %eax
xor %ebx, %ebx
xor %ecx, %ecx
mov %eax, _TEMP32_0_
add %eax, 1
mov _TEMP32_1_, %eax
popa
mov %ecx, _TEMP32_1_
mov VGA, %ecx
_shift_stack_left_
ret
ostr:
_shift_stack_right_
pop %eax
mov _ostr_str_, %eax
_LBL0_:
mov %ecx, _ostr_str_
mov _TEMP32_0_, %ecx
push %ecx
mov %ecx, _TEMP32_0_
mov %dl, [%ecx]
mov _TEMP8_0_, %dl
pop %ecx
mov %cl, _TEMP8_0_
mov _TEMP8_1_, %cl
xor %ecx, %ecx
mov %cl, _TEMP8_1_
push %ecx
_shift_stack_left_
call ochar
_shift_stack_right_
mov %ecx, _ostr_str_
mov _TEMP32_0_, %ecx
pusha
xor %eax, %eax
xor %ebx, %ebx
xor %ecx, %ecx
mov %eax, _TEMP32_0_
add %eax, 1
mov _TEMP32_1_, %eax
popa
mov %ecx, _TEMP32_1_
mov _ostr_str_, %ecx
mov %ecx, i
inc %ecx
mov i, %ecx
cmp %ecx, 5
jl _LBL0_
_shift_stack_left_
ret
main:
_shift_stack_right_
xor %ecx, %ecx
mov %ecx, 65
push %ecx
_shift_stack_left_
call ochar
_shift_stack_right_
xor %ecx, %ecx
mov %ecx, 66
push %ecx
_shift_stack_left_
call ochar
_shift_stack_right_
xor %ecx, %ecx
mov %ecx, _LBL1_
push %ecx
_shift_stack_left_
call ostr
_shift_stack_right_
_shift_stack_left_
ret
