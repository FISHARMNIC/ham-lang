/*
todo:
loading indirect values (see customPrint.txt) MAYBE DONE?
finish classlikes functions like str.print not returning how they should
raw assembly support (easy peasy)
pointers (colon)
super important - add printing without type specification, like print("hi") should be super easy
allow untyped funcitons to guess their return type, currently only return i32, but what about string?
*/

global.asm = {
    data: [],
    init: [],
    text: [],
}

global.types = require("./types.js")

global.recentTypes = [];
global.lastType = () => recentTypes.pop()
global.variableList = {
    _return_i8_: types.i8,
    _return_i16_: types.i16,
    _return_i32_: types.i32,
    _return_string_: types.string,
};
global.replaceIndex;
global.bracketStack = []
global.DoNotLoadVariable = [
    "repeat"
]

const functions = require("./functions.js")
const parser = require("./parser.js")
const formatAsm = require("./asm.js")
const classes = require("./classlikes.js")
const fs = require("fs");

if (String(process.argv[2]) == "undefined") {
    console.log("No input file provided!");
    process.exit(1)
}

var code = String(fs.readFileSync(String(process.argv[2])))

code = code.replace(/\n/g, "").split(/;/g)

var lineNum = 0;
var wordNum = 0;

for (lineNum = 0; lineNum < code.length; lineNum++) {
    var lineContents = parser.parse(code[lineNum]);
    console.log(lineContents)
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
        else if (word[0] == "'") {
            replaceIndex(word.charCodeAt(1))
            recentTypes.push(types.i8)
        }
        else if (word[0] == '@') { // casting
            // check if known type
            if (!Object.keys(types).includes(word_offset(1)))
                functions.error(`Unkown type: ${word_offset(1)}`)

            // cast next word with the specified type
            var addr = functions.castSize(word_offset(2), types[word_offset(1)])
            lineContents.splice(wordNum, 3, addr)
            //console.log(lineContents)
        }
        else if (word[0] == '<' && word_offset(1) == '-') { // pointer set
            functions.indirectSet(word_offset(-1), word_offset(2), lastType())
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
            //console.log(variableList, type, vname)
            if (functions.checkVariableExists(vname)) {
                if (JSON.stringify(type) != JSON.stringify(variableList[vname])) {
                    // have to reassign type
                    console.log(type, variableList[vname], type == variableList[vname])
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
        else if (word == ':')
        {
            // pointer calls
        }
        else if (Object.keys(variableList).includes(word)) // Asking for variable
        {
            var type = variableList[word]
            var lbl = functions.tempLabel(type.bits)
            if(!DoNotLoadVariable.includes(word_offset(-1))) {
                functions.twoStepLoad({ destination: lbl, source: word, type })
                replaceIndex(lbl)
            }
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
        else if (word == 'repeat')
        {
            var lbl = functions.generateAutoLabel();
            var counter = word_offset(1);
            var phrase = word_offset(2);
            var end = word_offset(3);
            bracketStack.push({ type: "repeat", data: {lbl,counter,end, phrase} })
            // support like repeat 1 down 10 or repeat 1 to 10
            asm.text.push(lbl + ":")
        }
        else if (word == 'function') {
            //console.log("riofrpeijforjioeiojijeoigije")
            functions.declareFunction(lineContents);
            break;
        }
        else if (word == 'close') //(lineContents.join("") == ']') // exiting funciton
        {
            var bracket = bracketStack.pop()
            var type = bracket.type
            var data = bracket.data
            if (type == "function") {
                inFunction = false
                functions.funcReturn()
                functionLocals = {}
            }
            else if (type == "repeat")
            {
                var type = functions.getVariableType(data.counter)
                var fmtreg = functions.formatRegisterObj('c', type)
                var fmtreg2 = functions.formatRegisterObj('b', type)
                //asm.text.push(`mov ${fmtreg}, ${data.counter}`)
                functions.performOnVar("inc", data.counter, type) 
                asm.text.push(
                    `cmp ${fmtreg}, ${data.end}`,
                    `jl ${data.lbl}`
                )
            }
        }
        /* #region  method test */
        /*
        // else if (word_offset(-1) == '.') { // class method call
        //     var pre = word_offset(-2)

        //     if (Object.keys(functionLocals).includes(functions.formatFunctionLocal(pre))) {
        //         pre = functionLocals[functions.formatFunctionLocal(pre)]
        //     } else if (Object.keys(variableList).includes(pre)) {
        //         pre = variableList[pre]
        //     } else {
        //         console.log("Undefined variable ", pre)
        //     }
        //     pre = JSON.stringify(pre).replace(/ /g, "")
        //     var index = word_offset
        //     var new_code = parser.parse(classes[pre][word](word_offset(-2), argum))
        //     lineContents.splice(wordNum - 2, 3, ...new_code)
        //     console.log(lineContents)
        // }
        */
        /* #endregion */
        else if (word_offset(1) == '(') // is function
        {
            if (word_offset(-1) == '.') { // class method call
                var pre = word_offset(-2)

                // make this chunk a function
                if (Object.keys(functionLocals).includes(functions.formatFunctionLocal(pre))) {
                    pre = functionLocals[functions.formatFunctionLocal(pre)]
                } else if (Object.keys(variableList).includes(pre)) {
                    pre = variableList[pre]
                } else {
                    console.log("Undefined variable ", pre)
                }
                pre = JSON.stringify(pre).replace(/ /g, "")

                var index = 2;
                var argum = [];

                while (word_offset(index) != ')') {
                    if (word_offset(index) != ',') {
                        argum.push(word_offset(index))
                    }
                    index++
                }
                //console.log("PARSING: ", argum, argum.length + 1, classes[pre][word](word_offset(-2), ...argum))
                var new_code = parser.parse(classes[pre][word](word_offset(-2), ...argum))
                new_code.pop()
                lineContents.splice(wordNum - 2, new_code.length, ...new_code)
                wordNum += argum.length + 2
                console.log("FINAL", lineContents, wordNum)


            } else {
                var index = 2;
                var i2 = 0
                //asm.text.push(`xor %ecx, %ecx`)
                while (word_offset(index) != ')') {
                    if (word_offset(index) != ',') {
                        functions.pushParameter(word, i2++, word_offset(index))
                    }
                    index++
                }
                asm.text.push(`_shift_stack_left_`, `call ${word}`, `_shift_stack_right_`)
                lineContents.splice(wordNum, i2 * 2 + 2, `_return_i${functions.typeToBits(userFunctions[word].returnType)}_`)
                recentTypes.push(variableList[`_return_i${functions.typeToBits(userFunctions[word].returnType)}_`])
                console.log("CALLED", recentTypes.at(-1), word, lineContents)
                // HERE NOT INSERTING FUNCTION OUTPUT 123
            }
            //console.log("out: ", lineContents)
        }
        //console.log(userFunctionArr)

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

