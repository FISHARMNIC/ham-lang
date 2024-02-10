# the HAM language <img src="https://github.com/FISHARMNIC/ham-lang/assets/73864341/48c69c6d-9094-4a13-afd5-34780b120624" width="30" height="30">
    
---
## simplicity of `Python`, complexity of `C`, speed of `Assembly`
- **Hard As** (you) **Make** (it)
- Fully compiled language, running standalone on x86 virtual machine, no boilerplate OS
    - Every library included is written in Assembly, including stdio, strings, etc.
    - Raw inline x86 assembly support
    - Build your own OS!
- Dynamic typing by default
    - Relax your braincells, and let `HAM` do all the hard work for you
    - No need to worry about type conversions, mismatches, etc.

# How to run:
- Made for MacOS (will work on linux)
- Requires:
    - LimaVM debian (for MacOS)
    - xorriso (If you are on mac, install on Lima)
    - gnu binutils (If you are on mac, install on Lima)
    - NodeJS
- Run "node main.js file" in the same directory as main.js
    - Example: in directory "ham lang" type "node main.js programs/ex3.txt"
- Follow instructions presented at the end of succesful compilation

# Docs

[https://docs.google.com/document/d/1dvrnv1i9j71S5V8oIfRu-QUAKFk0uw6s5r6wOy7J6vY/edit?usp=sharing](link)

# Some notes

## Typing
`HAM` offers several types for those who wish to use them. Variables who have been assigned a type cannot be reassigned a new type, and are locked to that type. Types are prefixed with `@`

### Casting

Casting in `HAM` is simply done by prefixing any form of data with an `@` symbol followed by the type. For example, `@i8 123` casts `123` to the type `i8`  .

For each type there is a brief description followed by the C correspondent.

#### Integer Types
- `@i8` 8 bit number type (`char`)
- `@i16` 16 bit number type (`short int`)
- `@i32` 32 bit number type (`long int`)

#### Pointer Types
All pointers are 32 bit numbers, but are treated by the compiler differently. These are similar to C's pointer types.
- `@string` 8 bit pointer type (`char *`)
- `@p16` 16 bit pointer type (`short int *`)
- `@p32` 32 bit pointer types (`long int *`)

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
put_int({i8 255 + 1}); // will print 0;
``` 
## Loops & Control Flow

### Repeat
The repeat loop takes an **exisiting variable** and counts either up to or down to another number. After the `repeat`, specify the counter variable to be used followed by whether that counter should be incremented or decremented. Use `to` to count upwards, or `down` to count downwards. **Make sure to end with a semicolon, no brackets. Indentation does not matter.** To finish the loop use `close`.
```C
i = 0;
repeat i to 10;
    // do stuff (indentation doesn't matter)
close;
```
### If/elif/else
`if` and `elif` statements are done in the format: `statement arg cmp arg`. Where `arg` are the two values being compared, and `cmp` is the type of comparison. Use the following chart to learn comparison types.
* `is` | *is equal to* | ==
* `isnt` | *is not equal to* | !=
* `less` | *is less than* | <
* `more` | *is greater than* | >
* `lessq` | *is less/equal to* | <=
* `moreq` | *is more/equal to* | >=  

Here is a valid example statement
```C
age = 10;
if age moreq 16;
    print("You can get a driving license!");
close;
elif age more 15;
    print("You can get a driving permit...");
close;
else;
    print("Sorry, you can't drive :(");
close;
```
`If` statements in `HAM` alter in functionality across different types. For numbers, their value will be compared. For pointers, their contents will be compared. Inorder to compare the address of strings/pointers cast them to `i32` first.

```C
// compares numbers;
if 123 is 456;
    print("something is seriously wrong...");
close;

// compares string contents;
name = "James Bond";
if name is "James Bond";
    print("Welcome Agent 007");
close;

// compares addresses;
address = @p32 123;
secondaddr = address;
if @i32 address is @i32 secondaddr;
    print("Same location!");
close;

```
### Functions
`HAM` offers several solutions that tailor to every skill level. One thing to note is that *typed functions*, mean the *return type* of that function. Any untyped function will inherit it's return statement. For example, if you return a string, the type will be string. Inorder to exit the function, it's the same as any other control flow statement: use the `close` keyword.

##### *Untyped* Functions *Without* Arguments
```C
// untyped with no args
function easyFunc;
    return 123;
close;
```

##### *Untyped* Functions *With* Arguments
```C
// untyped with args
<a,b> function easyFunc2;
    return 123;
close;
```

##### *Typed* Functions *Without* Arguments
```C
// typed with no args;
@i8 function myFuncitonNoP;
    return 123;
close;
```

##### *Typed* Functions *With* Arguments
```C
// typed args and return; 
<@i16 a, @i32 b> @i8 function myFunction;
    return {@i8 a + b};
close;
```
##### Dynamic Functions

Inorder to smoothly handle dynamic typing, certain functions adapt to their inherited type inorder to produce the expected result. For example, the `print` function will print the correct value regardless of the type. This is a sort of macro that is done at compile time. If statements also have this functionality, along with `println`.
##### Calling Functions

Calling functions is done with the standard `name(parameter,parameter,...)`

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

## Passing and returning from the program
Due to the the fact that HAM is run in a virtual machine, file/data passing to and from is very limited (at least for now, I have plans to re-work the file passing). To return text/data from the program to print as output use `program_return(buffer, length)`. This will print text after the program is finished. To return data in the format of a binary file us `program_return_file(buffer, length)`. Only one return statement is allowed and any more after that will overwrite the data. To read input, first run `program_prepare_input()` then run `program_get_in_bytes(buffer, read offset, number of bytes)`. Note that currently the input functions drasticallly slow the programs down, I also plan to fix this.

## Class-likes

**DEPRECATED: see dynamic functions instead**
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

# Changelog  
Note: some of this was done after the date I uploaded  

2/21/23: First version uploaded featuring variables and math, along with static and dynamic typing, and untyped functions. Assembler + bootloader not included. Mostly theoretical at this point, probably a lot of bugs.  

2/22/23: Fixed function parameters, added casting

3/23/23: Added bootloader and assembler, along with libraries and classlikes

-- deadspot --  

5/20/23: Added function prototypes, fixed issue with arrays being stuck read as 8bit, implemented new type of function, added library inclusion, creating run script that does everything easily
