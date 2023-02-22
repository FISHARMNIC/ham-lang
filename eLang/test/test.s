.intel_syntax
#======data======
_LBL1_: .asciz "hello world"
_LBL0_: .4byte 0
helloText: .4byte 0
_LBL3_: .asciz "hello world"
_LBL2_: .4byte 0
helloStrict: .4byte 0
number_small: .byte 0
number_auto: .4byte 0
typed_math: .byte 0
regular_math: .4byte 0
_TEMP8_0_: .byte 0
_TEMP8_1_: .byte 0
_TEMP8_2_: .byte 0
_TEMP32_0_: .4byte 0
_TEMP32_1_: .4byte 0
_TEMP32_2_: .4byte 0
#======init======
lea %ecx, _LBL1_
mov _LBL0_, %ecx
lea %ecx, _LBL3_
mov _LBL2_, %ecx
#======text======
mov %ecx, _LBL0_
mov helloText, %ecx
mov %ecx, _LBL2_
mov _TEMP32_0_, %ecx
mov %ecx, _TEMP32_0_
mov helloStrict, %ecx
mov %ecx, 123
mov _TEMP8_0_, %cl
mov %cl, _TEMP8_0_
mov number_small, %cl
mov %ecx, 456
mov number_auto, %ecx
mov %cl, number_small
mov _TEMP8_1_, %cl
pusha
mov %al, 131
add %al, _TEMP8_1_
mov _TEMP8_2_, %al
popa
mov %cl, _TEMP8_2_
mov typed_math, %cl
mov %ecx, number_auto
mov _TEMP32_1_, %ecx
pusha
mov %eax, 543
add %eax, _TEMP32_1_
mov _TEMP32_2_, %eax
popa
mov %ecx, _TEMP32_2_
mov regular_math, %ecx