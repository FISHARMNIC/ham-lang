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

## Variables

## Functions
`HAM` offers several solutions that tailor to every skill level. Let's start with the easiest. One thing to note is that by *typed functions*, I mean the *return type* of that functions. Any untyped function **can still return a *number***, and will default to `i32`. I am working to provide automatically typed returns.

#### Untyped Functions Without Arguments
```C
// untyped with no args
function easyFunc;
    return 123;
close;
```

#### Untyped Functions with Arguments
```C
// untyped with args
<a,b> function easyFunc2;
    return 123;
close;
```

#### Typed Functions without Arguments
```C
// typed with no args;
@i8 function myFuncitonNoP;
    return 123;
close;
```

#### Typed Functions with Arguments
```C
// typed args and return; 
<@i16 a, @i32 b> @i8 function myFunction;
    return {@i8 a + b};
close;
```

## Class-likes
Each type has a set of propeties and functions, which can be accessed by the period. This feature is still largely WIP, but currently supports `thing.print()`, which will print a variables value
 
