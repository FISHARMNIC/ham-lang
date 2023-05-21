FRAME_OFFSET = 100
.macro _shift_stack_left_
    mov _stack_d1_, %esp # duplicate the current pos
    mov %esp, _stack_d2_ # duplicate the stack frame
.endm

.macro _shift_stack_right_
    mov _stack_d2_, %esp # duplicate the current pos
    mov %esp, _stack_d1_ # go back to the original base
.endm

.macro _index_arr_ base, segment, index
    push %edx
    push %eax
    mov %eax, \segment
    mov %edx, \index
    mul %edx
    mov %edx, \base
    add %edx, %eax
    mov _return_i32_, %edx
    pop %eax
    pop %edx
.endm
