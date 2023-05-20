var autoLabel = 0;
var dummyRegister = "c"
global.userFunctions = {
    put_int: { autoReturn: true, returnType: types.i32, parameters: { _: types.i32 } },
    put_short: { autoReturn: true, returnType: types.i32, parameters: { _: types.i16 } },
    put_char: { autoReturn: true, returnType: types.i32, parameters: { _: types.i8 } },
    put_string: { autoReturn: true, returnType: types.i32, parameters: { _: types.string } },
    getc: { autoReturn: true, returnType: types.i8, parameters: {} },
    gets: { autoReturn: true, returnType: types.string, parameters: { _: types.string } },
    geti: { autoReturn: true, returnType: types.i32, parameters: {} },
    _str_concat_: { autoReturn: true, returnType: types.string, parameters: { a: types.string, b: types.string } },
    slen: { autoReturn: true, returnType: types.i32, parameters: { str: types.string } },
    sequals: { autoReturn: true, returnType: types.i8, parameters: { a: types.string, b: types.string } },
    program_return: { autoReturn: true, returnType: types.i8, parameters: { buffer: types.i32, size: types.i32 } },
    program_return_file: { autoReturn: true, returnType: types.i8, parameters: { buffer: types.i32, size: types.i32 } },
    program_get_in_bytes: { autoReturn: true, returnType: types.i8, parameters: { buffer: types.i32, read_offset: types.i32, bytes: types.i32 } },
    program_wait_in_ready: { autoReturn: true, returnType: types.i8, parameters: {} },
    program_prepare_input: { autoReturn: true, returnType: types.i8, parameters: {} }
}
global.eolActions = [] // do all this at the end of each line
global.userFunctionArr = []
global.inFunction = false
global.functionLocals = {}
global.cmpKeyWords = [
    'is'
]
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
    },
    "println": function (type) {
        eolActions.push(`call new_line`)
        return this.print(type)
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
    console.error(`\x1b[31m ***[COMPILE ERROR]*** \x1b[0m [line ${line + 2}:${word}]`, e)
    process.exit(0)
}

function warning(e, line, word) {
    console.error(`\x1b[33m ***[WARNING]*** \x1b[0m [line ${line + 2}:${word}]`, e)
}

function nameFromType(type) {
    var rt;
    Object.entries(types).forEach(x => {
        //console.log(JSON.stringify(x[1]),JSON.stringify(type), JSON.stringify(x[1]) == JSON.stringify(type))
        if (JSON.stringify(x[1]) == JSON.stringify(type)) {
            rt = x[0]
        }
    })
    return rt
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

function tempLabel(bits, pointer = false) {
    if (pointer) bits = 32
    bits = String(bits)
    var str = `_TEMP${bits}_${tempLabels[bits]++}_`;
    variableList[str] = { bits, pointer }
    if (tempLabels[bits] > highestTempLabel[bits] - 1) highestTempLabel[bits] = tempLabels[bits]
    return str;
}

function declareFunction(line, forwardDec = false) {
    inFunction = true
    var ftype = 0
    /*     parameters         return
    0 :     none           un-typed/none
    1 :     un-typed       un-typed/none
    2 :     typed             typed
    3 :     none              typed
    */
   var _offset = 0;
   if(forwardDec) _offset = 1;

    if (line[0 + _offset] == "<") {
        ftype = 1
        if (line[1 + _offset] == '@') {
            ftype = 2
        }
    }
    else if (line[0 + _offset] == '@') {
        ftype = 3
    }

    var fname;

    // default
    var autoReturn = true; // for end of function return something
    var returnType = types.i32;
    var parameters = {};
    var unknownReturnType = false;

    if (ftype == 0) {
        unknownReturnType = true;
        fname = line[1 + _offset];
    }
    else if (ftype == 1) {
        unknownReturnType = true;
        var index = 1 + _offset
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
        var index = 1 + _offset
        fname = line[line.indexOf(">") + 4];
        while (line[index] != '>') {
            if (line[index] == '@') {
                var type = types[line[index + 1]]
                var fmt = `_${fname}_${line[index + 2]}_`
                if (!forwardDec) {
                    createVariable(fmt, type, null)
                    functionLocals[fmt] = type
                }
                parameters[fmt] = type
                //console.log("::", fmt)
            }
            index++
        }
        returnType = types[line[line.indexOf(">") + 2]]
        //console.log("--", fname, returnType)
    }
    else if (ftype == 3) {
        returnType = types[line[1 + _offset]]
        fname = line[2 + _offset]
    }

    if (forwardDec) {
        userFunctions[fname] = {
            autoReturn, // for end of function return something
            returnType,
            parameters,
            unknownReturnType
        }
    }
    else {
        asm.text.push(
            `${fname}:`,
            `_shift_stack_right_ # enter argument stack`,
        )
        // pop into parameters
        Object.entries(parameters).reverse().forEach(x => {
            var name = x[0];
            var type = x[1];
            asm.text.push(
                `pop ${formatRegister('a', 32)} # pop argument`,
                `mov ${name}, ${formatRegisterObj('a', type)} # load into corresponding variable`
            )
        })
        userFunctionArr.push(fname)
        userFunctions[fname] = {
            autoReturn, // for end of function return something
            returnType,
            parameters,
            unknownReturnType
        }
        bracketStack.push({ type: "function", data: { fname, unknownReturnType } })
    }
}

function mostRecentFunction() {
    var name = userFunctionArr.pop()
    //console.log(name)
    return { name, data: userFunctions[name] }
}

function funcReturn(data = "", type = types.i32) {
    var inf_all = mostRecentFunction()
    var inf = inf_all.data
    if (inf.unknownReturnType) {
        inf.returnType = type
        userFunctions[inf_all.name].returnType = type
    }
    //console.log("-", nameFromType(inf.returnType), userFunctions.bob)
    if (data != "") {
        twoStepLoad({ destination: `_return_${nameFromType(inf.returnType)}_`, source: data, type: inf.returnType })
    }
    asm.text.push(
        `_shift_stack_left_ # enter call stack`,
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
        `mov ${formatRegisterObj(dummyRegister, type)}, ${value} # load parameter into register`,
        `push ${formatRegister(dummyRegister, 32)} # push to argument stack`
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
        `${indirect ? "lea" : "mov"} ${formattedReg}, ${source} # 2step - load into register`,     // mov %edx, source |OR| lea %edx, source
        `mov ${destination}, ${formattedReg} # 2step - load into destination`                        // mov destination, %edx
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
        `# -- indirect set -- `,
        `mov ${source_reg}, ${source}`,     // mov %edx, source |OR| lea %edx, source
        `xor %edx, %edx`,
        `mov ${destination_reg}, ${destination}`,
        `mov [%edx], ${source_reg}`,                        // mov destination, %edx
        `# --     end      --`
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
        asm.data.push(`${label}: .asciz ${contents} # string contents`)                      // auto: .asciz "text"
        asm.data.push(`${name}: .4byte 0 # string adress`)                                 // name: .4byte 0
        twoStepLoad({ destination: name, source: label, writeToInit: true, indirect: true, })    // lea name, auto
    } else { // return direct label (need lea to load address)
        asm.data.push(`${name}: .asciz ${contents} # string label (no pointer)`)
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
        `mov ${formatRegisterObj(dummyRegister, type)}, ${source} # load into register`,
        `mov ${lbl}, ${formatRegisterObj(dummyRegister, typeInfo)} # cast into specified type`]

    // strict typed variable at definition
    if (inFunction) asm.text.push(...text)
    else asm.init.push(...text)
    return lbl
}

function setVariable(destination, source, writeToInit = false, pointer = false) {
    //var b = variableList[destination].pointer ? 32 : variableList[destination].bits
    twoStepLoad({ destination, source, type: variableList[destination], writeToInit, indirect: pointer })
}

function setVariableAndCheckLocal(destination, source, writeToInit = false) {
    //console.log(formatFunctionLocal(destination), functionLocals)
    var type;
    if (Object.keys(functionLocals).includes(formatFunctionLocal(destination))) {
        //console.log("yup")
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
    if (value != null) setVariable(name, value, !inFunction) // BROKEN FIX HERE IF BROKEN 123 QWERTY
}

function allocateArray(type, data) {
    var lbl = generateAutoLabel();
    var name_ = generateAutoLabel();

    asm.data.push(`${lbl}: ${type2Asm(type)} ${data.join("")} # array data`)
    asm.data.push(`${name_}: .4byte 0 # array pointer`)                                 // name: .4byte 0
    twoStepLoad({ destination: name_, source: lbl, writeToInit: true, indirect: true, })
    return name_
}

function math(arr) {
    var scanPos = 0;
    // typed math
    var mathBits = 32;
    var typed = 0
    if (arr[0] == 'i8' || arr[0] == 'i16' || arr[0] == 'i32') {
        mathBits = parseInt(arr[0].substring(1))
        typed = 1
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
    var reps = scanPos - 2;
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
    recentTypes.push({ bits: mathBits, pointer: false })
    return {lbl, rep: scanPos - reps + 2 + typed}
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

function storeAs32(source, type) {
    var lbl = tempLabel(32)
    var fmt1 = formatRegisterObj('d', type)
    asm.text.push(
        `push %edx`,
        `xor %edx, %edx # storeAs32 - clear whole reg`,
        `mov ${fmt1}, ${source} # storeAs32 - load as correct type`,
        `mov ${lbl}, ${fmt1} # storeAs32 - save as whole`,
        `pop %edx`
    )
    recentTypes.push(types.i32)
    return lbl
}

function changetype(variable, newtype) {
    if (Object.keys(functionLocals).includes(formatFunctionLocal(variable))) {
        functionLocals[formatFunctionLocal(variable)] = JSON.parse(JSON.stringify(newtype))
    } else if (Object.keys(variableList).includes(variable)) {
        variableList[variable] = JSON.parse(JSON.stringify(newtype))
        //console.log(variableList)
    }
}
function createIfStatement(value) {
    var data = {
        escape: generateAutoLabel(), // escape from this if
    }

    asm.text.push(
        `cmpb ${value}, 0 # if - check comparison`,
        `jne ${data.escape} # if - escape if not true`
    )

    return data
}
/*
function createIfStatement(o1, o1_type, cmp, o2, o2_type) {
    if (JSON.stringify(o1_type) != JSON.stringify(o2_type)) {
        if (strictmode)
            error(`[STRICT] Comparing unequal types: \n${JSON.stringify(o1_type)}\n == with == \n${JSON.stringify(o2_type)}`, lineNum, wordNum)
        else
            warning(`Comparing unequal types: \n${JSON.stringify(o1_type)}\n == with == \n${JSON.stringify(o2_type)}`, lineNum, wordNum)
    }

    var lbl1 = storeAs32(o1, o1_type)
    var lbl2 = storeAs32(o2, o2_type)

    var data = {
        escape: generateAutoLabel(), // escape from this if
    }

    // CHANGE "jne" TO OPPOSITE OF COMPARE FORM | HERE 123456 ABCDEF
    asm.text.push(
        `// note: maybe we should have push ecx and edx here? Possible source of error...`,
        `mov %ecx, ${lbl1} # if - load first value`,
        `mov %edx, ${lbl2} # if - load first value`
    )

    if (JSON.stringify(o1_type) == JSON.stringify(types.i32)) {
        asm.text.push(
            `push %ecx`,
            `push %edx`,
            `_shift_stack_left_`,
            `call sequals`,
            `_shift_stack_right_`,
            `cmpb _return_i8_, 0`,
            `jne ${data.escape} # if - if not what we want then escape`,
            `// if - begin if statement `
        )
    } else {
    asm.text.push(
        `cmp %ecx, %edx`,
        `jne ${data.escape} # if - if not what we want then escape`,
        `// if - begin if statement `
    )
    }

    return data
}
*/
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
    checkVariableExists,
    allocateArray,
    nameFromType,
    storeAs32,
    createIfStatement
}