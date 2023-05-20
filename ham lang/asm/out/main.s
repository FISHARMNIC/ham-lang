.intel_syntax
.org 0x100
.global _kernel_entry

.section .data
_stack_d1_: .long 0
_stack_d2_: .long 0

_return_i8_: .byte 0
_return_i16_: .2byte 0
_return_i32_: .4byte 0
_return_string_: .4byte 0

_return_void_: .byte 0

.include "libs/shift.s"
.include "libs/string.s"
.include "libs/io.s"
.include "libs/progret.s"

.section .data


_LBL0_: .4byte 530,531,532 # array data
_LBL1_: .4byte 0 # array pointer
arr: .4byte 0
i: .4byte 0
_TEMP32_0_: .4byte 0
_TEMP32_1_: .4byte 0

_kernel_entry:
mov %eax, %esp
sub %eax, FRAME_OFFSET
mov _stack_d2_, %eax
lea %ecx, _LBL0_ # 2step - load into register
mov _LBL1_, %ecx # 2step - load into destination
mov %ecx, _LBL1_ # 2step - load into register
mov arr, %ecx # 2step - load into destination

_shift_stack_left_
call main
_shift_stack_right_
hlt

main:
_shift_stack_right_ # enter argument stack
mov %ecx, 0 # 2step - load into register
mov i, %ecx # 2step - load into destination
_LBL2_:
mov %ecx, i # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
push %ebx
xor %edx, %edx
xor %ebx, %ebx
mov %edx, _TEMP32_0_
mov %ebx, arr
mov %ecx, [%ebx + %edx*4]
mov _TEMP32_1_, %ecx
pop %ebx
xor %ecx, %ecx
mov %ecx, _TEMP32_1_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_int
_shift_stack_right_
mov %ecx, i
inc %ecx
mov i, %ecx
cmp %ecx, 3
jl _LBL2_
_shift_stack_left_ # enter call stack
ret
