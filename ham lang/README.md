# the HAM language
---
## simplicity of `Python`, complexity of `C`, speed of `assembly`
- **Hard As** (you) **Make** (it)
- Fully compiled language, running standalone on x86 virtual machine, no boilerplate OS
    - Every library included is hand made in Assembly, including stdio, strings, etc. *Feel free to peak inside*
    - Raw inline x86 assembly support
    - Build your own OS!
- Dynamic typing by default
    - Relax your braincells, and let `HAM` do all the typing for you
    - No need to worry about type conversions, mismatches, etc.

## Typing
`HAM` offers several types for those who wish to use them. Variables who have been assigned a type cannot be reassigned a new type, and are locked to that type. Types are prefixed with `@`

### Casting

Casting in `HAM` is simply done by prefixing any form of data with a type. For example, `@i8 123` casts `123` to the type `i8`  .

For each type there is a brief description followed by the C correspondent.

#### Integer Types
- `@i8` 8 bit number type (`char`)
- `@i16` 16 bit number type (`short int`)
- `@i32` 32 bit number type (`long int`)

#### Pointer Types
All pointers are 32 bit numbers, but are treated by the compiler differently. These are similar to C's pointer types.
- `@p8` 8 bit pointer type (`char *`)
- `@p16` 16 bit pointer type (`short int *`)
- `@p32` 32 bit pointer types (`long int *`)

#### Other Types

- `@string` Same thing as `p8` type 

## Variables

Variables are created without any keyword. They are implicitly typed, and automatically assume the type of their value being set. Here are a few examples:

```C
greeting = "hello world!"; // new string variable;
character = 'A'; // new character;
number = 123; // number variable (i32);
```
That being said, the type can be specificed via using a cast
```C
smallNumber = @i8 123; // character (i8);
someString = @string 5000; // would normally be created as number;
```
## Math
Math is evualuated when any code is specified in curly brackets. Any math symbol used outside of those brackets will have no effect (except probably causing some unwanted outcome). 
```C
put_int({123 + 456}); // will work;
put_int(123 + 456); // won't work;
```
Math is evuated from left to right, and accumulated the answer as it goes. This means no order of operation or parenthesis (hoping to fix this soon). The math accumulator can also be clamped to a certain size. By default it is 32 bits. This can be done by adding a type right after the opening bracket.
```C
put_int({@i8 255 + 1}); // will print 0;
``` 
## Loops

#### Repeat
The repeat loop takes an **exisiting variable** and counts either up to or down to another number. After the `repeat`, specify the counter variable to be used followed by whether that counter should be incremented or decremented. Use `to` to count upwards, or `down` to count downwards. **Make sure to end with a semicolon, no brackets. Indentation does not matter.** To finish the loop use `close`.
```C
i = 0;
repeat i to 10;
    // do stuff (indentation doesn't matter)
close;
```
## Functions
`HAM` offers several solutions that tailor to every skill level. Let's start with the easiest. One thing to note is that by *typed functions*, I mean the *return type* of that functions. Any untyped function **can still return a *number***, and will default to `i32`. I am working to provide automatically typed returns. Inorder to exit the function, it's the same as loops: use the `close` keyword.

##### *Untyped* Functions *Without Arguments*
```C
// untyped with no args
function easyFunc;
    return 123;
close;
```

##### *Untyped* Functions *With Arguments*
```C
// untyped with args
<a,b> function easyFunc2;
    return 123;
close;
```

##### *Typed* Functions *Without Arguments*
```C
// typed with no args;
@i8 function myFuncitonNoP;
    return 123;
close;
```

##### *Typed* Functions *With Arguments*
```C
// typed args and return; 
<@i16 a, @i32 b> @i8 function myFunction;
    return {@i8 a + b};
close;
```

## Pointers
Pointers are called using a type followed by the address, seperated by a colon. The type will specify how many bytes to load from the address. Note that the type should not have the `@` specifier
```C
str = "hello";
put_char(i8:str); // prints 'h';
```

In order to indirectley set a value —for example in C `*str = 'a'`— use the arrow operator.
```C
str = "hay";
str <- 'y'; // becomes yay;
```
## Class-likes
Each type has a set of propeties and functions, which can be accessed by the period. This feature is still largely WIP, but currently supports `thing.print()`, which will print a variables value
 
# Examples
---
```C
helloText = "hello world"; // string;
helloStrict = @string "hello world";
number_small = @i8 123;
number_auto = 456;

// function to add two numbers and return their sum;
<a, b> function sum;
    return {a + b};
close;

// similar function but with types;
<@i16 a, @i16 b> @i16 function sumShort;
    return {i16 a + b};
close;

// main function to be run;
function main;
    typed_math = {i8 132 + number_small};
    regular_math = {543 + number_auto};
    // 123 + 456 + 21 = 600;
    put_int(sum(sum(number_small,number_auto),21));
    
    // loop;
    i = 0;
    repeat i to 10;
        put_int(i);
    close;
close;
```