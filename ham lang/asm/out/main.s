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


_LBL1_: .asciz "     " # string contents
_LBL0_: .4byte 0 # string adress
str: .4byte 0
_LBL2_: .4byte 1,2,3 # array data
_LBL3_: .4byte 0 # array pointer
arr: .4byte 0
_LBL5_: .asciz "done" # string contents
_LBL4_: .4byte 0 # string adress
_TEMP32_0_: .4byte 0

_kernel_entry:
mov %eax, %esp
sub %eax, FRAME_OFFSET
mov _stack_d2_, %eax
lea %ecx, _LBL1_ # 2step - load into register
mov _LBL0_, %ecx # 2step - load into destination
mov %ecx, _LBL0_ # 2step - load into register
mov str, %ecx # 2step - load into destination
lea %ecx, _LBL2_ # 2step - load into register
mov _LBL3_, %ecx # 2step - load into destination
mov %ecx, _LBL3_ # 2step - load into register
mov arr, %ecx # 2step - load into destination
lea %ecx, _LBL5_ # 2step - load into register
mov _LBL4_, %ecx # 2step - load into destination

_shift_stack_left_
call main
_shift_stack_right_
hlt

main:
_shift_stack_right_ # enter argument stack
push %ebx
xor %edx, %edx
xor %ebx, %ebx
mov %edx, 1
mov %ebx, arr
mov %ecx, [%ebx + %edx*4]
mov _TEMP32_0_, %ecx
pop %ebx
xor %ecx, %ecx
mov %ecx, _TEMP32_0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_int
_shift_stack_right_
mov %ecx, str # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
xor %ecx, %ecx
mov %ecx, _TEMP32_0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call gets
_shift_stack_right_
mov %ecx, str # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
xor %ecx, %ecx
mov %ecx, _TEMP32_0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_string
_shift_stack_right_
xor %ecx, %ecx
mov %ecx, _LBL4_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_string
_shift_stack_right_
    mov %eax, str  # -- user inserted ASM --
_shift_stack_left_ # enter call stack
ret
