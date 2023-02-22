var asmFormat = {
    beforeData:
        `.intel_syntax
.org 0x100
.global _kernel_entry

.section .data
_stack_d1_: .long 0
_stack_d2_: .long 0

_return_i8_: .byte 0
_return_i16: .2byte 0
_return_i32_: .4byte 0

.include "libs/shift.s"
.include "libs/string.s"
.include "libs/io.s"

.section .data


`,
    beforeInit:
        `\n\n_kernel_entry:
mov %eax, %esp
sub %eax, FRAME_OFFSET
mov _stack_d2_, %eax\n`,
    beforeText:
        `\n\n_shift_stack_left_
call main
_shift_stack_right_
hlt\n\n`
}

function formatAsm(data, init, text) {
    return asmFormat.beforeData + data.join("\n") + asmFormat.beforeInit + init.join("\n") + asmFormat.beforeText + text.join("\n") + "\n"
}

module.exports = formatAsm