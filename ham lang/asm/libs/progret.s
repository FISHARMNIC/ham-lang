.section .text
program_return:
    _shift_stack_right_
    pop %eax # size
    pop %ebx # address
    
    mov [0], %ebx 
    mov [4], %eax # check, should this be 1 or 4?

    movb [8], 'P'
    movb [9], 'A'
    movb [10], 'S'
    movb [11], 'S'
    _shift_stack_left_
    ret