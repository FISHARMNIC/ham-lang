.section .text

strlen:
    _shift_stack_right_
    pop %eax
    push %ecx
    mov %ecx, %eax # ecx will hold base
    dec %eax
    strlen.l:
        inc %eax
        cmpb [%eax], 0
        jne strlen.l
    sub %eax, %ecx
    pop %ecx
    _shift_stack_left_
    ret

strcmp:
    _shift_stack_right_
    pop %eax
    pop %ebx
    mov %ecx, %eax # eax will be overwritten by strlen

    _shift_stack_left_
    push %eax
    _shift_stack_right_

    call strlen # call with str1
    mov %edx, %eax # edx holds len1
    
    xor %eax, %eax
    mov %eax, %ebx
    call strlen #  call with str2

    sub %eax, %edx # cmp lengths
    jnz strcmp.exit

    # strings are now in %ebx and %ecx
    dec %ebx
    dec %ecx
    strcmp.l:
        inc %ebx
        inc %ecx

        mov %al, [%ebx] # avoid over reference
        cmp %al, 0
        jz strcmp.exit # finished string
        sub %al, [%ecx]
        jz strcmp.l
    strcmp.exit:
    mov %bl, %al
    xor %eax, %eax
    mov %al, %bl
    mov _return_i32_, %eax 
    _shift_stack_left_ 
    ret  
