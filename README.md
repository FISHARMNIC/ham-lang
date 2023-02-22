# eLang
A language with the simplicity of python but comlpexity of C
Main features:
* Compiled language
* No typing needed
* Simple array/string handling
* Pointers and low-level control
* Casting and optional typing

---Sample code----
```Java
helloText = "hello world";
helloStrict = @string "hello world";
number_small = @i8 123;
number_auto = 456;

// untyped functions
<a, b> function sum;
    return {a + b};
};

function main;
    // type math
    typed_math = {i8 132 + number_small};
    // defualt math
    regular_math = {543 + number_auto};
    // nested function calls
    // 123 + 456 + 21 = 600
    put_int(sum(sum(number_small,number_auto),21));
};
```
---Running---
Compile to Assembly using `main.js`
Compile and run to binary using `run.sh`
* Note that the shell script is meant for macOS using LIMA VM
* It should also work on Linux
* Must install `BINUTILS, XORRISO, GRUB`
