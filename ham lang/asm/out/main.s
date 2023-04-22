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


_LBL1_: .asciz "hello" # string contents
_LBL0_: .4byte 0 # string adress
arr: .4byte 0
_printThirdLetter_a_: .4byte 0
_modifyString_a_: .4byte 0
_TEMP8_0_: .byte 0
_TEMP32_0_: .4byte 0

_kernel_entry:
mov %eax, %esp
sub %eax, FRAME_OFFSET
mov _stack_d2_, %eax
lea %ecx, _LBL1_ # 2step - load into register
mov _LBL0_, %ecx # 2step - load into destination
mov %ecx, _LBL0_ # 2step - load into register
mov arr, %ecx # 2step - load into destination

_shift_stack_left_
call main
_shift_stack_right_
hlt

printThirdLetter:
_shift_stack_right_ # enter argument stack
pop %eax # pop argument
mov _printThirdLetter_a_, %eax # load into corresponding variable
push %ebx
xor %edx, %edx
xor %ebx, %ebx
mov %edx, 2
mov %ebx, _printThirdLetter_a_
mov %cl, [%ebx + %edx*1]
mov _TEMP8_0_, %cl
pop %ebx
xor %ecx, %ecx
mov %cl, _TEMP8_0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_char
_shift_stack_right_
call new_line
_shift_stack_left_ # enter call stack
ret
modifyString:
_shift_stack_right_ # enter argument stack
pop %eax # pop argument
mov _modifyString_a_, %eax # load into corresponding variable
push %ebx
push %eax
xor %edx, %edx
mov %edx, 1
mov %ebx, _modifyString_a_
mov %eax, %edx
mov %ecx, 1
mul %ecx
add %ebx, %eax
mov %al, 121
mov [%ebx], %al
pop %eax
pop %ebx
_shift_stack_left_ # enter call stack
ret
main:
_shift_stack_right_ # enter argument stack
mov %ecx, arr # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
xor %ecx, %ecx
mov %ecx, _TEMP32_0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call printThirdLetter
_shift_stack_right_
mov %ecx, arr # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
xor %ecx, %ecx
mov %ecx, _TEMP32_0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call modifyString
_shift_stack_right_
mov %ecx, arr # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
xor %ecx, %ecx
mov %ecx, _TEMP32_0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_string
_shift_stack_right_
call new_line
_shift_stack_left_ # enter call stack
ret
