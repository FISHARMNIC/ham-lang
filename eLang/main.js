/*
todo:
ading variables not working,

calling main before setting variables in init see assembly code
temp not resseting after each lien
*/

global.asm = {
    data: [],
    init: [],
    text: [],
}

global.recentTypes = [];
global.lastType = () => recentTypes.pop()
global.variableList = {};
global.replaceIndex;
global.bracketStack = []

global.types = require("./types.js")
const functions = require("./functions.js")
const parser = require("./parser.js")
const formatAsm = require("./asm.js")
const fs = require("fs");

var code =
    `
helloText = "hello world";
helloStrict = @string "hello world";
number_small = @i8 123;
number_auto = 456;

typed_math = {i8 132 + number_small};
regular_math = {543 + number_auto};

<a, b> function sum;
    return {a + b};
};

function main;
    put_int(sum(1,2));
};

`

code = code.replace(/\n/g, "").split(/;/g)

var lineNum = 0;
var wordNum = 0;

for (lineNum = 0; lineNum < code.length; lineNum++) {
    var lineContents = parser.parse(code[lineNum]);
    console.log(functions.formatFunctionLocal(word))
    // comment
    if (lineContents[0] == "/" && lineContents.length > 1 && lineContents[1] == "/") continue

    recentTypes = [];
    for (wordNum = lineContents.length - 1; wordNum >= 0; wordNum--) {
        var word = lineContents[wordNum];
        if (word == "") continue; // skip if empty

        replaceIndex = function (n, i = wordNum, remove = true) {
            var v = n;
            var len = 1
            if (typeof n == 'object') {
                v = [...n]
                len = v.length
            }

            lineContents.splice(i, remove ? len : 0, v)
        }


        var word_offset = n => lineContents[wordNum + n]

        // Main area
        if (word[0] == '"') // string : "hello"
        {
            var addr = functions.declareString({ contents: word })
            replaceIndex(addr)
            console.log("line: " + lineContents)
        }
        else if (word[0] == '@') { // casting
            // check if known type
            if (!Object.keys(types).includes(word_offset(1)))
                functions.error(`Unkown type: ${word_offset(1)}`)

            // cast next word with the specified type
            var addr = functions.castSize(word_offset(2), types[word_offset(1)])
            replaceIndex(addr)
        }
        else if (word == parseInt(word)) // Integer
        {
            recentTypes.push(types.i32)
        }
        else if (word[0] == '=') { // setting variables
            var type = lastType()
            var vname = word_offset(-1)
            var value = word_offset(1)
            // if we have already created a variable
            if (Object.keys(variableList).includes(vname)) {
                if (type != variableList[vname].bits) {
                    // have to reassign type
                    functions.error("Type reassign unfinished")
                } else {
                    functions.setVariable(vname, value)
                }
            }
            else {
                functions.createVariable(vname, type, value)
            }
            break; // set the varibale, skip to the next line
        }
        else if (Object.keys(variableList).includes(word)) // Asking for variable
        {
            var type = variableList[word]
            var lbl = functions.tempLabel(type.bits)
            functions.twoStepLoad({ destination: lbl, source: word, type })
            replaceIndex(lbl)
            recentTypes.push(type)
        }
        else if (Object.keys(functionLocals).includes(functions.formatFunctionLocal(word))) // local variable
        {
            var truename = functions.formatFunctionLocal(word)
            var type = functionLocals[truename]
            var lbl = functions.tempLabel(type.bits)
            functions.twoStepLoad({ destination: lbl, source: truename, type })
            replaceIndex(lbl)
            recentTypes.push(type)
        }
        else if (word == '{') // Math equation
        {
            var build = []
            for (var i = 1; word_offset(i) != '}'; i++) {
                build.push(word_offset(i))
            }

            functions.math(build)

        }
        else if (word == 'return') {
            var p = (lineContents.length > wordNum + 1) ? word_offset(1) : ""
            functions.funcReturn(p)
        }
        else if (word == 'function') {
            functions.declareFunction(lineContents);
            break;
        }
        else if (lineContents.join("") == '}') // exiting funciton
        {
            var bracket = bracketStack.pop()
            var type = bracket.type
            var data = bracket.data
            if (type == "function") {
                inFunction = false
                functions.funcReturn()
                functionLocals = {}
            }
        }
        else if(word_offset(1) == '(') // is function
        {
            var index = 2;
            var i2 = 0
            while (word_offset(index) != ')') {
                if (word_offset(index) != ',') {
                    functions.pushParameter(word, i2++, word_offset(index))
                }
                index++
            }
            asm.text.push(`_shift_stack_left_`, `call ${word}`, `_shift_stack_right_`)
            lineContents.splice(wordNum,  i2 * 2 + 2, `_return_i${functions.typeToBits(userFunctions[word].returnType)}_`)
            console.log("out: ", lineContents)
        }
        console.log(userFunctionArr)
    }
}

// Create all the temp variables we ever used
for (var i = 0; i < highestTempLabel["8"]; i++)
    asm.data.push(`_TEMP8_${i}_: .byte 0`)

for (var i = 0; i < highestTempLabel["16"]; i++)
    asm.data.push(`_TEMP16_${i}_: .2byte 0`)

for (var i = 0; i < highestTempLabel["32"]; i++)
    asm.data.push(`_TEMP32_${i}_: .4byte 0`)

var out = formatAsm(asm.data, asm.init, asm.text)
fs.writeFileSync("asm/out/main.s", out)
// console.log("==================Code==================\n#======data======")
// asm.data.forEach(x=>console.log(x))
// console.log("#======init======")
// asm.init.forEach(x=>console.log(x))
// console.log("#======text======")
// asm.text.forEach(x=>console.log(x))

