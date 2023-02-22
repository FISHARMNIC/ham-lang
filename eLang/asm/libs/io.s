BLACK = 0 # vga color for black
WHITE = 15 # vga color for white
VGA_ADDR = 0xB8000

KEYBOARD_PORT = 0x60
KEY_A = 0x1E
KEY_B = 0x30
KEY_C = 0x2E
KEY_D = 0x20
KEY_E = 0x12
KEY_F = 0x21
KEY_G = 0x22
KEY_H = 0x23
KEY_I = 0x17
KEY_J = 0x24
KEY_K = 0x25
KEY_L = 0x26
KEY_M = 0x32
KEY_N = 0x31
KEY_O = 0x18
KEY_P = 0x19
KEY_Q = 0x10
KEY_R = 0x13
KEY_S = 0x1F
KEY_T = 0x14
KEY_U = 0x16
KEY_V = 0x2F
KEY_W = 0x11
KEY_X = 0x2D
KEY_Y = 0x15
KEY_Z = 0x2C
KEY_1 = 0x02
KEY_2 = 0x03
KEY_3 = 0x04
KEY_4 = 0x05
KEY_5 = 0x06
KEY_6 = 0x07
KEY_7 = 0x08
KEY_8 = 0x09
KEY_9 = 0x0A
KEY_0 = 0x0B
KEY_MINUS = 0x0C
KEY_EQUAL = 0x0D
KEY_SQUARE_OPEN_BRACKET = 0x1A
KEY_SQUARE_CLOSE_BRACKET = 0x1B
KEY_SEMICOLON = 0x27
KEY_BACKSLASH = 0x2B
KEY_COMMA = 0x33
KEY_DOT = 0x34
KEY_FORESLHASH = 0x35
KEY_F1 = 0x3B
KEY_F2 = 0x3C
KEY_F3 = 0x3D
KEY_F4 = 0x3E
KEY_F5 = 0x3F
KEY_F6 = 0x40
KEY_F7 = 0x41
KEY_F8 = 0x42
KEY_F9 = 0x43
KEY_F10 = 0x44
KEY_F11 = 0x85
KEY_F12 = 0x86
KEY_BACKSPACE = 0x0E
KEY_DELETE = 0x53
KEY_DOWN = 0x50
KEY_END = 0x4F
KEY_ENTER = 0x1C
KEY_ESC = 0x01
KEY_HOME = 0x47
KEY_INSERT = 0x52
KEY_KEYPAD_5 = 0x4C
KEY_KEYPAD_MUL = 0x37
KEY_KEYPAD_Minus = 0x4A
KEY_KEYPAD_PLUS = 0x4E
KEY_KEYPAD_DIV = 0x35
KEY_LEFT = 0x4B
KEY_PAGE_DOWN = 0x51
KEY_PAGE_UP = 0x49
KEY_PRINT_SCREEN = 0x37
KEY_RIGHT = 0x4D
KEY_SPACE = 0x39
KEY_TAB = 0x0F
KEY_UP = 0x48

.section .data

char_map: .asciz "`^1234567890-=  qwertyuiop[]\  asdfghjkl;' ) zxcvbnm,./      "
keyboard_out: .byte 0
_ttypos: .long VGA_ADDR

.section .text

/* #region ************* Output ************* */

.macro __pchar_mac__ tchar
    xor %eax, %eax
    mov %al, \tchar
    or %eax, 3840 # Equivalent of BG = 0, FG = 15
    mov %ebx, _ttypos
    mov [%ebx], %ax # Move the character into the tty pointer
    addw _ttypos, 2 # Increment to the next character spot
.endm

reset_tty:
    mov %edx, VGA_ADDR
    mov _ttypos, %edx
    ret

# prints a number on the screen after reading it from the stack
put_int:
    _shift_stack_right_
    pop %eax 
    
    push 10 # know when to stop, there should only be single digit numbers (10 will thus never show up)
    _pip_slice:
    mov %ecx, 10
    xor %edx, %edx
    div %ecx # eax = number / 10, edx = number % 10
    push %edx # push remainder
    cmp %eax, 0 # check if zero
    jne _pip_slice
    
    _pip_print:
    pop %edx
    cmp %edx, 10
    je _pip_ret 
    add %dl, 48 # convert to char
    __pchar_mac__ %dl
    jmp _pip_print
    _pip_ret: 
    
    _shift_stack_left_
    ret

# prints a character on the screen after reading it from the stack
put_char:
    _shift_stack_right_
    pop %ebx
    xor %eax, %eax
    mov %al, %bl
    or %eax, 3840 # Equivalent of BG = 0, FG = 15
    mov %ebx, _ttypos
    mov [%ebx], %ax # Move the character into the tty pointer
    addw _ttypos, 2 # Increment to the next character spot
    _shift_stack_left_
    ret


# prints a series of characters until NULL from a base addres passed on the stack
put_string:
    _shift_stack_right_
    pop %edx

    _ps.lp:
        __pchar_mac__ [%edx]
        inc %edx
        cmpb [%edx], 0
        jne _ps.lp
    _shift_stack_left_
    ret
    _shift_stack_left_
    ret

char_ln:
    call put_char
    call new_line
    ret

int_ln:
    call put_int
    call new_line
    ret

string_ln:
    call put_string
    call new_line
    ret
    
new_line:
    // newline = position  + (80 - (position % 80))
    # NEWLINE = position  + (80 - (position % 80))
    pusha

    xor %edx, %edx 

    mov %ecx, _ttypos
    sub %ecx, VGA_ADDR 
    shr %ecx, 1 # ecx holds relative tty

    cmp %ecx, 1920
    jg _newline.refresh

    mov %eax, %ecx
    mov %ebx, 80 # divisor
    div %ebx # remainder (mod) in %edx

    sub %ebx, %edx # 80 - remainder
    add %ebx, %ecx # edx = linePos
    shl %ebx, 1 # reajust for 2-width
    mov _ttypos, %ebx # new line position
    
    mov %ebx, VGA_ADDR
    add _ttypos, %ebx
    popa
    ret
    _newline.refresh:
    call clear_vga
    popa
    ret

clear_vga:
    mov %ecx, 4000
    mov %al, 0
    mov %edi, 0xb8000
    rep stosb
    mov %ebx, VGA_ADDR
    mov _ttypos, %ebx
    ret

/* #endregion */

/* #region ************* Input ************** */
read_keyboard:
    xor %eax, %eax
    inb %al, KEYBOARD_PORT # store keycode in al
    mov keyboard_out, %al # save the resulting keycode
    mov _return_i32_, %eax
    ret

getc:
    push %ebx
    _getc.ls:
    call read_keyboard
    cmpb keyboard_out, 0 # Read and compare keyboard
    jle _getc.ls # falling edge or no key pressed (-128 -> 0)
    get_char.fe:
    call read_keyboard
    cmpb keyboard_out, 0 
    jge get_char.fe # (0-128) means the key is still being held
    
    sub %al, 128
    subb keyboard_out, 128

    lea %ebx, char_map
    add %ebx, %eax
    xor %eax, %eax
    mov %al, [%ebx]

    mov _return_i32_, %eax
    pop %ebx
    ret

gets:
    _shift_stack_right_
    pop %ebx # string addr
    push %ebx # return addr too
    push %eax
        _gets_entry:
            call getc
            // _put_char %al
            mov [%ebx], %al # move into pointer
            inc %ebx
            cmpb keyboard_out, KEY_BACKSPACE
            je _gets_DEL
            _gets_RET:
            cmpb keyboard_out, KEY_ENTER
            jne _gets_entry
        dec %ebx
        movb [%ebx], 0
        pop %eax
         
        _shift_stack_left_
        pop _return_i32_
        ret

        _gets_DEL:
            dec %ebx # back to type char
            movb [%ebx], 0 # clear
            dec %ebx # back to char before
            jmp _gets_RET

geti:
    xor %ebx, %ebx # stores number
    xor %ecx, %ecx # incase overflow
    call getc
    mov %al, keyboard_out # convert to number
    dec %al
    mov %bl, %al
    _gi_loop:
        call getc
        cmpb keyboard_out, KEY_ENTER
        je _gi_exit # exit on key enter
        mov %al, keyboard_out # convert to number
        dec %al
        mov %cl, %al # store entered
        mov %eax, 10
        mul %ebx # saved number
        add %eax, %ecx # shift and add
        mov %ebx, %eax
        jmp _gi_loop
    _gi_exit:
    mov _return_i32_, %ebx
    ret
    
/* #endregion */