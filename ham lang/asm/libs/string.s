.section .text

slen:
    pusha
    _shift_stack_right_
    pop %eax
    mov %ecx, %eax # ecx will hold base
    dec %eax
    slen.l:
        inc %eax
        cmpb [%eax], 0
        jne slen.l
    sub %eax, %ecx
    mov _return_i32_, %eax
    _shift_stack_left_
    popa
    ret

sequals:
    pusha
    _shift_stack_right_
    pop %eax # string 1
    pop %ebx # string 2

    push %eax
    _shift_stack_left_
    call slen # call with str1
    _shift_stack_right_

    mov %edx, _return_i32_ # edx holds len1
    
    push %ebx
    _shift_stack_left_
    call slen #  call with str2
    _shift_stack_right_

    mov %ecx, _return_i32_ # ecx holds len2

    sub %ecx, %edx # cmp lengths
    jnz strcmp.exit

    dec %eax
    dec %ebx
    # quickly whipped up for testing, make this code better haha
    strcmp.l:
        inc %eax
        inc %ebx

        mov %cl, [%ebx] # char at string 2
        cmp %cl, 0
        jz strcmp.true # finished string
        sub %cl, [%eax] # char at string 1
        jz strcmp.l

    jmp strcmp.exit

    strcmp.true:
    movb _return_i8_, 0
    _shift_stack_left_
    popa
    ret
    strcmp.exit:
    mov _return_i8_, %cl 
    _shift_stack_left_ 
    popa
    ret  
