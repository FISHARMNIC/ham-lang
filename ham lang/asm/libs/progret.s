.section .data
program_in_ready: .byte 0
.comm program_in_file_buffer, 4000, 1 # 4 kb test
.section .text
program_return:
    pusha
    _shift_stack_right_
    pop %eax # size
    pop %ebx # address
    
    mov [0], %ebx 
    mov [4], %eax 

    movb [8], 'P'
    movb [9], 'A'
    movb [10], 'S'
    movb [11], 'S'
    _shift_stack_left_
    popa
    ret

program_return_file:
    pusha
    _shift_stack_right_
    pop %eax # size
    pop %ebx # address
    
    mov [0], %ebx 
    mov [4], %eax # check, should this be 1 or 4?

    movb [8], 'F'
    movb [9], 'I'
    movb [10], 'L'
    movb [11], 'E'
    _shift_stack_left_
    popa
    ret

program_wait_in_ready:
    _pwir.lp:
        cmpb [0], 'R'
        jne _pwir.lp
        cmpb [1], 'D'
        jne _pwir.lp
        cmpb [2], 'Y'
        jne _pwir.lp
    movb program_in_ready, 1
    ret

program_get_in_bytes:
    // buffer is located at address
    pusha
    _shift_stack_right_
    pop %ecx # number of bytes
    pop %ebx # read offset
    pop %eax # write buffer
    lea %edx, program_in_file_buffer # read buffer

    add %edx, %ebx # free ebx, now edx is read + offset 
    cmpb program_in_ready, 1
    je _pgib.loopstrt
    call program_wait_in_ready

    _pgib.loopstrt:
        mov %bl, [%edx]
        mov [%eax], %bl# *write = *read
        inc %eax # inc write
        inc %edx # inc read
        sub %ecx, 1
        cmp %ecx, 0
        jg _pgib.loopstrt

    movb [%eax], 0
    _shift_stack_left_
    popa
    ret

program_prepare_input:
    lea %eax, program_in_file_buffer
    
    movb [0], 'A'
    movb [1], 'D'
    movb [2], 'D'
    movb [3], 'R'
    mov [4], %eax

    ret

