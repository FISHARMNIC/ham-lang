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


.comm _LBL0_, 100, 4
_LBL1_: .4byte 0 # array pointer
snakeX: .4byte 0
.comm _LBL2_, 100, 4
_LBL3_: .4byte 0 # array pointer
snakeY: .4byte 0
snakelen: .4byte 0
headX: .4byte 0
headY: .4byte 0
_TEMP32_0_: .4byte 0
_TEMP32_1_: .4byte 0
_TEMP32_2_: .4byte 0

_kernel_entry:
mov %eax, %esp
sub %eax, FRAME_OFFSET
mov _stack_d2_, %eax
lea %ecx, _LBL0_ # 2step - load into register
mov _LBL1_, %ecx # 2step - load into destination
mov %ecx, _LBL1_ # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
mov %ecx, _TEMP32_0_ # 2step - load into register
mov snakeX, %ecx # 2step - load into destination
lea %ecx, _LBL2_ # 2step - load into register
mov _LBL3_, %ecx # 2step - load into destination
mov %ecx, _LBL3_ # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
mov %ecx, _TEMP32_0_ # 2step - load into register
mov snakeY, %ecx # 2step - load into destination
mov %ecx, 3 # 2step - load into register
mov snakelen, %ecx # 2step - load into destination
mov %ecx, 0 # 2step - load into register
mov headX, %ecx # 2step - load into destination
mov %ecx, 0 # 2step - load into register
mov headY, %ecx # 2step - load into destination
mov %ecx, headX # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
mov %ecx, snakelen # 2step - load into register
mov _TEMP32_1_, %ecx # 2step - load into destination
mov %ecx, headY # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
mov %ecx, snakelen # 2step - load into register
mov _TEMP32_1_, %ecx # 2step - load into destination
mov %ecx, snakelen # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination

_shift_stack_left_
call main
_shift_stack_right_
hlt

main:
_shift_stack_right_ # enter argument stack
push %ebx
push %eax
xor %edx, %edx
mov %edx, _TEMP32_1_
mov %ebx, snakeX
mov %eax, %edx
mov %ecx, 4
mul %ecx
add %ebx, %eax
mov %eax, _TEMP32_0_
mov [%ebx], %eax
pop %eax
pop %ebx
push %ebx
push %eax
xor %edx, %edx
mov %edx, _TEMP32_1_
mov %ebx, snakeY
mov %eax, %edx
mov %ecx, 4
mul %ecx
add %ebx, %eax
mov %eax, _TEMP32_0_
mov [%ebx], %eax
pop %eax
pop %ebx
push %ebx
xor %edx, %edx
xor %ebx, %ebx
mov %edx, _TEMP32_0_
mov %ebx, snakeX
mov %ecx, [%ebx + %edx*4]
mov _TEMP32_1_, %ecx
pop %ebx
xor %ecx, %ecx
mov %ecx, _TEMP32_1_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_int
_shift_stack_right_
call new_line
_shift_stack_left_ # enter call stack
ret
