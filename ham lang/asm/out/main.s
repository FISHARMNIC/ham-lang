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


_LBL1_: .asciz "hello, this is a file io test" # string contents
_LBL0_: .4byte 0 # string adress
str: .4byte 0
_LBL3_: .asciz "            " # string contents
_LBL2_: .4byte 0 # string adress
buff: .4byte 0
_LBL5_: .asciz "Reading input..." # string contents
_LBL4_: .4byte 0 # string adress
_LBL7_: .asciz "Got: " # string contents
_LBL6_: .4byte 0 # string adress
_LBL9_: .asciz "Exit program and see return statement" # string contents
_LBL8_: .4byte 0 # string adress
_TEMP32_0_: .4byte 0
_TEMP32_1_: .4byte 0

_kernel_entry:
mov %eax, %esp
sub %eax, FRAME_OFFSET
mov _stack_d2_, %eax
lea %ecx, _LBL1_ # 2step - load into register
mov _LBL0_, %ecx # 2step - load into destination
mov %ecx, _LBL0_ # 2step - load into register
mov str, %ecx # 2step - load into destination
lea %ecx, _LBL3_ # 2step - load into register
mov _LBL2_, %ecx # 2step - load into destination
mov %ecx, _LBL2_ # 2step - load into register
mov buff, %ecx # 2step - load into destination
lea %ecx, _LBL5_ # 2step - load into register
mov _LBL4_, %ecx # 2step - load into destination
lea %ecx, _LBL7_ # 2step - load into register
mov _LBL6_, %ecx # 2step - load into destination
lea %ecx, _LBL9_ # 2step - load into register
mov _LBL8_, %ecx # 2step - load into destination

_shift_stack_left_
call main
_shift_stack_right_
hlt

main:
_shift_stack_right_ # enter argument stack
xor %ecx, %ecx
mov %ecx, _LBL4_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_string
_shift_stack_right_
call new_line
mov %ecx, buff # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
xor %ecx, %ecx
mov %ecx, _TEMP32_0_ # load parameter into register
push %ecx # push to argument stack
xor %ecx, %ecx
mov %ecx, 0 # load parameter into register
push %ecx # push to argument stack
xor %ecx, %ecx
mov %ecx, 10 # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call program_get_in_bytes
_shift_stack_right_
xor %ecx, %ecx
mov %ecx, _LBL6_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_string
_shift_stack_right_
mov %ecx, buff # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
xor %ecx, %ecx
mov %ecx, _TEMP32_0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_string
_shift_stack_right_
call new_line
xor %ecx, %ecx
mov %ecx, _LBL8_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_string
_shift_stack_right_
call new_line
mov %ecx, str # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
xor %ecx, %ecx
mov %ecx, _TEMP32_0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call slen
_shift_stack_right_
mov %ecx, str # 2step - load into register
mov _TEMP32_1_, %ecx # 2step - load into destination
xor %ecx, %ecx
mov %ecx, _TEMP32_1_ # load parameter into register
push %ecx # push to argument stack
xor %ecx, %ecx
mov %ecx, _return_i32_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call program_return
_shift_stack_right_
_shift_stack_left_ # enter call stack
ret
