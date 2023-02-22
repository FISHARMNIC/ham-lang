var autoLabel = 0;
var dummyRegister = "c"
global.userFunctions = {
    put_int: {autoReturn: true, returnType: types.i32, parameters: {_: types.i32}}
}
global.userFunctionArr = []
global.inFunction = false
global.functionLocals = {}

var tempLabels = {
    "8": 0,
    "16": 0,
    "32": 0
}

global.highestTempLabel = {
    "8": 0,
    "16": 0,
    "32": 0
}
/* #region  Compiler Functions */

function typeToBits(b) {
    if (b.pointer) return 32
    return b.bits
}


function type2Asm(b) {
    if (b.pointer) return `.4byte`
    if (b.bits == 8) return `.byte`
    return `.${b.bits / 8}byte`
}

function error(e) {
    console.log(e)
}

function formatRegister(letter, bits, pointer = false, low = true) {
    if (pointer) return `%e${letter}x`
    if (bits == 32)
        return `%e${letter}x`
    if (bits == 16)
        return `%${letter}x`
    else {
        if (low) return `%${letter}l`
        return `%${letter}h`
    }
}

function formatRegisterObj(letter, type, low = true)
{
    return formatRegister(letter, type.bits, type.pointer, low)
}

function generateAutoLabel() {
    return "_LBL" + autoLabel++ + "_";
}

function tempLabel(bits) {
    bits = String(bits)
    var str = `_TEMP${bits}_${tempLabels[bits]++}_`;
    if (tempLabels[bits] > highestTempLabel[bits] - 1) highestTempLabel[bits] = tempLabels[bits]
    return str;
}

function declareFunction(line) {
    inFunction = true
    var ftype = 0
    /*     parameters         return
    0 :     none           un-typed/none
    1 :     un-typed       un-typed/none
    2 :     typed             typed
    3 :     none              typed
    */
    if (line[0] == "<") {
        ftype = 1
        if (line[1] == '@') {
            ftype = 2
        }
    }
    else if (line[0] == '@') {
        ftype = 3
    }

    var fname;

    // default
    var autoReturn = true; // for end of function return something
    var returnType = types.i32;
    var parameters = {};

    if (ftype == 0) {
        fname = line[1];
    }
    else if (ftype == 1) {
        var index = 1
        fname = line[line.indexOf(">") + 2];
        // create the variables
        while (line[index] != '>') {
            if (line[index] != ',') {
                var fmt = `_${fname}_${line[index]}_`
                createVariable(fmt, types.i32, null)
                functionLocals[fmt] = types.i32
                parameters[fmt] = types.i32
                //console.log(line[index])
            }
            index++
        }
        
    }
    else if (ftype == 2) {

    }
    else if (ftype == 3) {

    }

    asm.text.push(
        `${fname}:`,
        `_shift_stack_right_`,
    )
    // pop into parameters
    Object.entries(parameters).reverse().forEach(x => 
        {
            var name = x[0];
            var type = x[1];
            asm.text.push(
                `pop ${formatRegister('a', 32)}`,
                `mov ${name}, ${formatRegisterObj('a', type)}`
            )
        })
    userFunctionArr.push(fname)
    userFunctions[fname] = {
        autoReturn, // for end of function return something
        returnType,
        parameters
    }
    bracketStack.push({type: "function", data: {}})
}

function mostRecentFunction() {
    return userFunctions[userFunctionArr.at(-1)]
}

function funcReturn(data = "") {
    var inf = mostRecentFunction()
    console.log(inf)
    if (data != "") {
        twoStepLoad({ destination: `_return_i${typeToBits(inf.returnType)}_`, source: data, type: inf.returnType })
    }
    asm.text.push(
        `_shift_stack_left_`,
        `ret`
    )
}

function formatFunctionLocal(name) {
    return `_${userFunctionArr.at(-1)}_${name}_`
}

function pushParameter(fname, parameterIndex, value)
{
    console.log(value)
    var type = Object.values(userFunctions[fname].parameters)[parameterIndex]
    //twoStepLoad({destination: formatRegister(dummyRegister, type), source: value, type})
    asm.text.push(
        `mov ${formatRegisterObj(dummyRegister, type)}, ${value}`,
        `push ${formatRegister(dummyRegister, 32)}`
    )
}

/* #endregion */

/* #region  Memory Functions */

function twoStepLoad({ destination, source, indirect = false, type = { bits: 32, pointer: false }, writeToInit = false }) {
    // moves a source to a destination, can be register, label, etc.
    if (type.pointer) type.bits = 32

    var formattedReg = formatRegister(dummyRegister, type.bits)
    var out = [
        `${indirect ? "lea" : "mov"} ${formattedReg}, ${source}`,     // mov %edx, source |OR| lea %edx, source
        `mov ${destination}, ${formattedReg}`                        // mov destination, %edx
    ]

    if (writeToInit) asm.init.push(...out)
    else asm.text.push(...out)
}

function declareString({ contents, name = null, pointer = true, containsQuotes = true, addToRecentTypes = true }) {
    // allocateds a string and returns its name (one can be provided)
    if (!containsQuotes) contents = `"${contents}"`;
    if (addToRecentTypes) recentTypes.push(types.string)

    if (name == null) name = generateAutoLabel();

    if (pointer) { // return pointer to address
        var label = generateAutoLabel()
        asm.data.push(`${label}: .asciz ${contents}`)                      // auto: .asciz "text"
        asm.data.push(`${name}: .4byte 0`)                                 // name: .4byte 0
        twoStepLoad({ destination: name, source: label, writeToInit: true, indirect: true, })    // lea name, auto
    } else { // return direct label (need lea to load address)
        asm.data.push(`${name}: .asciz ${contents}`)
    }

    return name
}

function castSize(source, typeInfo, addToRecentTypes = true) {
    var lbl = tempLabel(typeInfo.bits)
    if (addToRecentTypes) recentTypes.push(typeInfo)
    // asm.text.push(
    //     `mov ${formatRegister(dummyRegister, 32)}, ${source}`,  // mov %edx, abc
    //     `mov ${lbl}, ${formatRegister(dummyRegister, typeInfo.pointer ? 32 : typeInfo.bits)}` // mov temp, %dx
    // )
    asm.text.push(
        // `xor ${formatRegister(dummyRegister, 32)}, ${formatRegister(dummyRegister, 32)}`
        `mov ${formatRegisterObj(dummyRegister, 32)}, ${source}`,
        `mov ${lbl}, ${formatRegisterObj(dummyRegister, typeInfo)}`
    )
    return lbl
}

function setVariable(destination, source) {
    //var b = variableList[destination].pointer ? 32 : variableList[destination].bits
    twoStepLoad({ destination, source, type: variableList[destination] })
}

function createVariable(name, type, value) {
    asm.data.push(`${name}: ${type2Asm(type)} 0`) // variable: .type 0
    variableList[name] = type
    if(value != null) setVariable(name, value)
}

function math(arr) {
    var scanPos = 0;
    // typed math
    var mathBits = 32;
    if (arr[0] == 'i8' || arr[0] == 'i16' || arr[0] == 'i32') {
        mathBits = parseInt(arr[0].substring(1))
        scanPos++
    }

    var regA = formatRegister('a', mathBits)
    var regB = formatRegister('b', mathBits)
    var regC = formatRegister('c', mathBits)
    var regD = formatRegister('d', mathBits)
    // clear all registers

    asm.text.push(`pusha`, `mov ${regA}, ${arr[scanPos]}`) // load first value into register a

    scanPos += 1
    var qt = recentTypes.reverse()
    var c = 0;
    while (scanPos < arr.length) {
        var item = {
            current: arr[scanPos],
            next: arr[scanPos + 1],
            nextT: qt[c]
        }

        asm.text.push(...((inD) => {
            console.log("---", inD)
            switch (inD.current) {
                case "+":
                    return [`add ${regA}, ${inD.next}`]
                case "-":
                    return [`sub ${regA}, ${inD.next}`]
                case "*":
                    return [
                        `mov ${regB}, ${inD.next}`,
                        `mul ${regB}`,
                    ]
                case "/":
                    return [
                        `mov ${regB}, ${inD.next}`,
                        `xor %edx, %edx`,
                        `div ${regB}`,
                    ]
                case "%":
                    return [
                        `mov ${regB}, ${inD.next}`,
                        `xor %edx, %edx`,
                        `div ${regB}`,
                        `mov ${regA}, ${regD}`,
                    ]
                case "|":
                    return [
                        `mov ${regB}, ${inD.next}`,
                        `or ${regA}, %ebx`,
                    ]
                case "<<":
                    return [
                        `mov ${regC}, ${inD.next}`,
                        `shl ${regA}, ${regC}`,
                    ]
                case ">>":
                    return [
                        `mov ${regA}, ${inD.next}`,
                        `shr ${regA}, ${regC}`,
                    ]
                case "&":
                    return [
                        `mov ${regB}, ${inD.next}`,
                        `and ${regA}, ${regB}`,
                    ]
            }
        })(item))
        scanPos += 2;
        c++;
    }
    var lbl = tempLabel(mathBits)
    asm.text.push(`mov ${lbl}, ${regA}`, `popa`)
    replaceIndex(lbl)
}
/* #endregion */

module.exports = {
    declareString,
    twoStepLoad,
    tempLabel,
    castSize,
    createVariable,
    setVariable,
    math,
    declareFunction,
    mostRecentFunction,
    funcReturn,
    formatFunctionLocal,
    pushParameter,
    typeToBits
}