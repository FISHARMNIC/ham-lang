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


_gfx_char_px_: .2byte 0
_gfx_char_py_: .2byte 0
_gfx_char_ch_: .byte 0
_gfx_string_px_: .2byte 0
_gfx_string_py_: .2byte 0
_gfx_string_str_: .4byte 0
_gfx_int_px_: .2byte 0
_gfx_int_py_: .2byte 0
_gfx_int_num_: .4byte 0
_LBL1_: .asciz "hello" # string contents
_LBL0_: .4byte 0 # string adress
_TEMP8_0_: .byte 0
_TEMP16_0_: .2byte 0
_TEMP16_1_: .2byte 0
_TEMP32_0_: .4byte 0

_kernel_entry:
mov %eax, %esp
sub %eax, FRAME_OFFSET
mov _stack_d2_, %eax
lea %ecx, _LBL1_ # 2step - load into register
mov _LBL0_, %ecx # 2step - load into destination

_shift_stack_left_
call main
_shift_stack_right_
hlt

gfx_char:
_shift_stack_right_ # enter argument stack
pop %eax # pop argument
mov _gfx_char_ch_, %al # load into corresponding variable
pop %eax # pop argument
mov _gfx_char_py_, %ax # load into corresponding variable
pop %eax # pop argument
mov _gfx_char_px_, %ax # load into corresponding variable
    push _ttypos  # -- user inserted ASM --
mov %cx, _gfx_char_px_ # 2step - load into register
mov _TEMP16_0_, %cx # 2step - load into destination
mov %cx, _gfx_char_py_ # 2step - load into register
mov _TEMP16_1_, %cx # 2step - load into destination
pusha
xor %eax, %eax
xor %ebx, %ebx
xor %ecx, %ecx
mov %ax, _TEMP16_1_
mov %ebx, 80
mul %ebx
add %eax, _TEMP16_0_
add %eax, 753665
mov _TEMP32_0_, %eax
popa
mov %ecx, _TEMP32_0_ # 2step - load into register
mov _ttypos, %ecx # 2step - load into destination
mov %cl, _gfx_char_ch_ # 2step - load into register
mov _TEMP8_0_, %cl # 2step - load into destination
xor %ecx, %ecx
mov %cl, _TEMP8_0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_char
_shift_stack_right_
    pop _ttypos  # -- user inserted ASM --
_shift_stack_left_ # enter call stack
ret
gfx_string:
_shift_stack_right_ # enter argument stack
pop %eax # pop argument
mov _gfx_string_str_, %eax # load into corresponding variable
pop %eax # pop argument
mov _gfx_string_py_, %ax # load into corresponding variable
pop %eax # pop argument
mov _gfx_string_px_, %ax # load into corresponding variable
    push _ttypos  # -- user inserted ASM --
mov %cx, _gfx_string_px_ # 2step - load into register
mov _TEMP16_0_, %cx # 2step - load into destination
mov %cx, _gfx_string_py_ # 2step - load into register
mov _TEMP16_1_, %cx # 2step - load into destination
pusha
xor %eax, %eax
xor %ebx, %ebx
xor %ecx, %ecx
mov %ax, _TEMP16_1_
mov %ebx, 80
mul %ebx
add %eax, _TEMP16_0_
add %eax, 753665
mov _TEMP32_0_, %eax
popa
mov %ecx, _TEMP32_0_ # 2step - load into register
mov _ttypos, %ecx # 2step - load into destination
mov %ecx, _gfx_string_str_ # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
xor %ecx, %ecx
mov %ecx, _TEMP32_0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_string
_shift_stack_right_
    pop _ttypos  # -- user inserted ASM --
_shift_stack_left_ # enter call stack
ret
gfx_int:
_shift_stack_right_ # enter argument stack
pop %eax # pop argument
mov _gfx_int_num_, %eax # load into corresponding variable
pop %eax # pop argument
mov _gfx_int_py_, %ax # load into corresponding variable
pop %eax # pop argument
mov _gfx_int_px_, %ax # load into corresponding variable
    push _ttypos  # -- user inserted ASM --
mov %cx, _gfx_int_px_ # 2step - load into register
mov _TEMP16_0_, %cx # 2step - load into destination
mov %cx, _gfx_int_py_ # 2step - load into register
mov _TEMP16_1_, %cx # 2step - load into destination
pusha
xor %eax, %eax
xor %ebx, %ebx
xor %ecx, %ecx
mov %ax, _TEMP16_1_
mov %ebx, 80
mul %ebx
add %eax, _TEMP16_0_
add %eax, 753665
mov _TEMP32_0_, %eax
popa
mov %ecx, _TEMP32_0_ # 2step - load into register
mov _ttypos, %ecx # 2step - load into destination
mov %ecx, _gfx_int_num_ # 2step - load into register
mov _TEMP32_0_, %ecx # 2step - load into destination
xor %ecx, %ecx
mov %ecx, _TEMP32_0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call put_int
_shift_stack_right_
    pop _ttypos  # -- user inserted ASM --
_shift_stack_left_ # enter call stack
ret
main:
_shift_stack_right_ # enter argument stack
xor %ecx, %ecx
mov %ecx, 5 # load parameter into register
push %ecx # push to argument stack
xor %ecx, %ecx
mov %ecx, 1 # load parameter into register
push %ecx # push to argument stack
xor %ecx, %ecx
mov %ecx, _LBL0_ # load parameter into register
push %ecx # push to argument stack
_shift_stack_left_
call gfx_string
_shift_stack_right_
_shift_stack_left_ # enter call stack
ret
