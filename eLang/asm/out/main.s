.intel_syntax
.org 0x100
.global _kernel_entry

.section .data
_stack_d1_: .long 0
_stack_d2_: .long 0

_return_i8_: .byte 0
_return_i16: .2byte 0
_return_i32_: .4byte 0

.include "libs/shift.s"
.include "libs/string.s"
.include "libs/io.s"

.section .data


_LBL1_: .asciz "hello world"
_LBL0_: .4byte 0
helloText: .4byte 0
_LBL3_: .asciz "hello world"
_LBL2_: .4byte 0
helloStrict: .4byte 0
number_small: .byte 0
number_auto: .4byte 0
_sum_a_: .4byte 0
_sum_b_: .4byte 0
typed_math: .byte 0
regular_math: .4byte 0
_TEMP8_0_: .byte 0
_TEMP8_1_: .byte 0
_TEMP8_2_: .byte 0
_TEMP8_3_: .byte 0
_TEMP32_0_: .4byte 0
_TEMP32_1_: .4byte 0
_TEMP32_2_: .4byte 0
_TEMP32_3_: .4byte 0
_TEMP32_4_: .4byte 0
_TEMP32_5_: .4byte 0
_TEMP32_6_: .4byte 0

_kernel_entry:
mov %eax, %esp
sub %eax, FRAME_OFFSET
mov _stack_d2_, %eax
lea %ecx, _LBL1_
mov _LBL0_, %ecx
mov %ecx, _LBL0_
mov helloText, %ecx
lea %ecx, _LBL3_
mov _LBL2_, %ecx
xor %ecx, %ecx
mov %ecx, _LBL2_
mov _TEMP32_0_, %ecx
mov %ecx, _TEMP32_0_
mov helloStrict, %ecx
xor %ecx, %ecx
mov %ecx, 123
mov _TEMP8_0_, %cl
mov %cl, _TEMP8_0_
mov number_small, %cl
mov %ecx, 456
mov number_auto, %ecx
mov %cl, _TEMP8_2_
mov typed_math, %cl
mov %ecx, _TEMP32_5_
mov regular_math, %ecx

_shift_stack_left_
call main
_shift_stack_right_
hlt

sum:
_shift_stack_right_
pop %eax
mov _sum_b_, %eax
pop %eax
mov _sum_a_, %eax
mov %ecx, _sum_b_
mov _TEMP32_1_, %ecx
mov %ecx, _sum_a_
mov _TEMP32_2_, %ecx
pusha
mov %eax, _TEMP32_2_
add %eax, _TEMP32_1_
mov _TEMP32_3_, %eax
popa
mov %ecx, _TEMP32_3_
mov _return_i32_, %ecx
_shift_stack_left_
ret
_shift_stack_left_
ret
main:
_shift_stack_right_
mov %cl, number_small
mov _TEMP8_1_, %cl
pusha
mov %al, 132
add %al, _TEMP8_1_
mov _TEMP8_2_, %al
popa
mov %ecx, number_auto
mov _TEMP32_4_, %ecx
pusha
mov %eax, 543
add %eax, _TEMP32_4_
mov _TEMP32_5_, %eax
popa
mov %ecx, number_auto
mov _TEMP32_6_, %ecx
mov %cl, number_small
mov _TEMP8_3_, %cl
xor %ecx, %ecx
mov %cl, _TEMP8_3_
push %ecx
mov %ecx, _TEMP32_6_
push %ecx
_shift_stack_left_
call sum
_shift_stack_right_
xor %ecx, %ecx
mov %ecx, _return_i32_
push %ecx
mov %ecx, 21
push %ecx
_shift_stack_left_
call sum
_shift_stack_right_
xor %ecx, %ecx
mov %ecx, _return_i32_
push %ecx
_shift_stack_left_
call put_int
_shift_stack_right_
_shift_stack_left_
ret
