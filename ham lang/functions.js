var autoLabel = 0;
var dummyRegister = "c"
global.userFunctions = {
    put_int: { autoReturn: true, returnType: types.i32, parameters: { _: types.i32 } },
    put_short: { autoReturn: true, returnType: types.i32, parameters: { _: types.i16 } },
    put_char: { autoReturn: true, returnType: types.i32, parameters: { _: types.i8 } },
    put_string: { autoReturn: true, returnType: types.i32, parameters: { _: types.string } },
    _str_concat_: { autoReturn: true, returnType: types.string, parameters: { a: types.string, b: types.string } }
}
global.userFunctionArr = []
global.inFunction = false
global.functionLocals = {}

global.tempLabels = {
    "8": 0,
    "16": 0,
    "32": 0
}

global.highestTempLabel = {
    "8": 0,
    "16": 0,
    "32": 0
}

global.dynamicFunctions = {
    "print": function (type) {
        switch (JSON.stringify(type)) {
            case JSON.stringify(types.string):
                return "put_string"
            case JSON.stringify(types.i32):
                return "put_int"
            case JSON.stringify(types.i16):
                return "put_short"
            case JSON.stringify(types.i8):
                return "put_char"
        }
    }
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

function error(e, line, word) {
    console.error(`\x1b[31m ***[COMPILE ERROR]*** \x1b[0m [line ${line + 1}:${word}]`, e)
    process.exit(0)
}

function warning(e, line, word) {
    console.error(`\x1b[33m ***[WARNING]*** \x1b[0m [line ${line + 1}:${word}]`, e)
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

function formatRegisterObj(letter, type, low = true) {
    return formatRegister(letter, type.bits, type.pointer, low)
}

function generateAutoLabel() {
    return "_LBL" + autoLabel++ + "_";
}

function tempLabel(bits) {
    bits = String(bits)
    var str = `_TEMP${bits}_${tempLabels[bits]++}_`;
    variableList[str] = { bits, pointer: false }
    if (tempLabels[bits] > highestTempLabel[bits] - 1) highestTempLabel[bits] = tempLabels[bits]
    return str;
}

function declareFunction(line) {
    inFunction = true
    //console.log("FUNCTION NSCREATE", line)
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
        var index = 1
        fname = line[line.indexOf(">") + 4];
        while (line[index] != '>') {
            if (line[index] == '@') {
                var type = types[line[index + 1]]
                var fmt = `_${fname}_${line[index + 2]}_`
                createVariable(fmt, type, null)
                functionLocals[fmt] = type
                parameters[fmt] = type
                //console.log("::", fmt)
            }
            index++
        }
        returnType = types[line[line.indexOf(">") + 2]]
        //console.log("--", fname, returnType)
    }
    else if (ftype == 3) {

    }

    asm.text.push(
        `${fname}:`,
        `_shift_stack_right_`,
    )
    // pop into parameters
    Object.entries(parameters).reverse().forEach(x => {
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
    bracketStack.push({ type: "function", data: {} })
}

function mostRecentFunction() {
    return userFunctions[userFunctionArr.at(-1)]
}

function funcReturn(data = "") {
    var inf = mostRecentFunction()
    //console.log(inf)
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

function pushParameter(fname, parameterIndex, value) {
    //console.log(value)

    var type = types.i32
    if (parseInt(value) != value) {
        if (Object.keys(functionLocals).includes(formatFunctionLocal(value))) {
            type = functionLocals[formatFunctionLocal(value)]
        } else if (Object.keys(variableList).includes(value)) {
            type = variableList[value]
        }
    }

    //twoStepLoad({destination: formatRegister(dummyRegister, type), source: value, type})
    asm.text.push(
        `xor ${formatRegister(dummyRegister, 32)}, ${formatRegister(dummyRegister, 32)}`,
        `mov ${formatRegisterObj(dummyRegister, type)}, ${value}`,
        `push ${formatRegister(dummyRegister, 32)}`
    )
}

/* #endregion */

/* #region  Memory Functions */

function twoStepLoad({ destination, source, indirect = false, type = { bits: 32, pointer: false }, writeToInit = false }) {
    // moves a source to a destination, can be register, label, etc.
    type = JSON.parse(JSON.stringify(type))
    if (type.pointer) type.bits = 32
    //asm.text.push(`# ${JSON.stringify(variableList)}`)
    var formattedReg = formatRegister(dummyRegister, type.bits)
    var out = [
        `${indirect ? "lea" : "mov"} ${formattedReg}, ${source}`,     // mov %edx, source |OR| lea %edx, source
        `mov ${destination}, ${formattedReg}`                        // mov destination, %edx
    ]

    if (writeToInit) asm.init.push(...out)
    else asm.text.push(...out)
}

function indirectSet(destination, source, source_type) {

    var source_reg = formatRegisterObj('a', source_type)

    var destination_type = types.i32
    if (Object.keys(functionLocals).includes(formatFunctionLocal(destination))) {
            destination_type = functionLocals[formatFunctionLocal(destination)]
    } else if (Object.keys(variableList).includes(destination)) {
            destination_type = variableList[destination]
    }

    var destination_reg = formatRegisterObj('d', destination_type)

    var out = [
        `mov ${source_reg}, ${source}`,     // mov %edx, source |OR| lea %edx, source
        `xor %edx, %edx`,
        `mov ${destination_reg}, ${destination}`,
        `mov [%edx], ${source_reg}`                        // mov destination, %edx
    ]

    asm.text.push(...out)
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
    var type = types.i32
    if (parseInt(source) != source) {
        if (Object.keys(functionLocals).includes(formatFunctionLocal(source))) {
            type = functionLocals[formatFunctionLocal(source)]
        } else if (Object.keys(variableList).includes(source)) {
            type = variableList[source]
        }
    }
    var text = [
        `xor ${formatRegister(dummyRegister, 32)}, ${formatRegister(dummyRegister, 32)}`,
        `mov ${formatRegisterObj(dummyRegister, type)}, ${source}`,
        `mov ${lbl}, ${formatRegisterObj(dummyRegister, typeInfo)}`]

    // strict typed variable at definition
    if (inFunction) asm.text.push(...text)
    else asm.init.push(...text)
    return lbl
}

function setVariable(destination, source, writeToInit = false) {
    //var b = variableList[destination].pointer ? 32 : variableList[destination].bits
    twoStepLoad({ destination, source, type: variableList[destination], writeToInit })
}

function setVariableAndCheckLocal(destination, source, writeToInit = false)
{
    console.log(formatFunctionLocal(destination), functionLocals)
    var type;
    if (Object.keys(functionLocals).includes(formatFunctionLocal(destination))) {
        console.log("yup")
        type = functionLocals[formatFunctionLocal(destination)]
        destination = formatFunctionLocal(destination)
    } else if (Object.keys(variableList).includes(destination)) {
        type = variableList[destination]
    }
    twoStepLoad({ destination, source, type, writeToInit })
}

function createVariable(name, type, value) {

    //console.log("TYPE", type)
    var t = JSON.stringify(type)
    asm.data.push(`${name}: ${type2Asm(type)} 0`) // variable: .type 0
    variableList[name] = JSON.parse(t)
    if (value != null) setVariable(name, value, true)

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

    //console.log("----------FORMAT----------", rtype(arr[scanPos], mathBits))
    asm.text.push(
        `pusha`,
        `xor %eax, %eax`,
        `xor %ebx, %ebx`,
        `xor %ecx, %ecx`,
        `mov ${formatRegisterObj('a', rtype(arr[scanPos], { bits: mathBits, pointer: false }))}, ${arr[scanPos]}`) // load first value into register a

    scanPos += 1

    while (scanPos < arr.length - 1) {
        var item = {
            current: arr[scanPos],
            next: arr[scanPos + 1],
        }

        if (Object.keys(functionLocals).includes(formatFunctionLocal(arr[scanPos + 1]))) {
            regB = formatRegister('b', functionLocals[formatFunctionLocal(arr[scanPos + 1])])
        } else if (Object.keys(variableList).includes(arr[scanPos + 1])) {
            regB = formatRegister('b', variableList[arr[scanPos + 1]])
        }

        asm.text.push(...((inD) => {
            //console.log("---", inD)


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
                        `or ${regA}, ${formatRegister('b', mathBits)}`,
                    ]
                case "<":
                    return [
                        `mov ${regC}, ${inD.next}`,
                        `shl ${regA}, %cl`,
                    ]
                case ">":
                    return [
                        `mov ${regC}, ${inD.next}`,
                        `shr ${regA}, %cl`,
                    ]
                case "&":
                    return [
                        `mov ${regB}, ${inD.next}`,
                        `and ${regA}, ${formatRegister('b', mathBits)}`,
                    ]
                default:
                    return ""
            }
        })(item))
        scanPos += 1;
    }
    var lbl = tempLabel(mathBits)
    asm.text.push(`mov ${lbl}, ${regA}`, `popa`)
    replaceIndex(lbl)
    recentTypes.push({ bits: mathBits, pointer: false })
}

function rtype(source, ogtype) {
    var ret = ogtype
    ret.bits = parseInt(ogtype.bits)
    if (Object.keys(functionLocals).includes(formatFunctionLocal(source))) {
        ret = functionLocals[formatFunctionLocal(source)]
    } else if (Object.keys(variableList).includes(source)) {
        ret = variableList[source]
    }
    return ret;
}

function checkVariableExists(name) {
    return Object.keys(functionLocals).includes(formatFunctionLocal(name)) || Object.keys(variableList).includes(name)
}

function getVariableType(name) {
    var pre;
    if (Object.keys(functionLocals).includes(formatFunctionLocal(name))) {
        pre = functionLocals[formatFunctionLocal(name)]
    } else if (Object.keys(variableList).includes(name)) {
        pre = variableList[name]
    } else {
        error("Undefined variable " + name)
        process.exit(0)
    }
    return pre;
}

function performOnVar(operation, name, type) {
    var reg = formatRegisterObj('c', type)
    asm.text.push(
        `mov ${reg}, ${name}`,
        `${operation} ${reg}`,
        `mov ${name}, ${reg}`
    )

}

function changetype(variable, newtype) {
    if (Object.keys(functionLocals).includes(formatFunctionLocal(variable))) {
        functionLocals[formatFunctionLocal(variable)] = JSON.parse(JSON.stringify(newtype))
    } else if (Object.keys(variableList).includes(variable)) {
        variableList[variable] = JSON.parse(JSON.stringify(newtype))
        //console.log(variableList)
    }
}
/* #endregion */

module.exports = {
    error,
    warning,
    changetype,
    typeToBits,
    generateAutoLabel,
    declareString,
    twoStepLoad,
    tempLabel,
    castSize,
    createVariable,
    setVariable,
    setVariableAndCheckLocal,
    math,
    declareFunction,
    mostRecentFunction,
    funcReturn,
    formatFunctionLocal,
    pushParameter,
    typeToBits,
    indirectSet,
    formatRegister,
    formatRegisterObj,
    getVariableType,
    performOnVar,
    checkVariableExists
}