const fs = require("fs");

var symbols = "()-{}[]*!@#$%^&*()`~+,/<>?:\\=. \0"

function parse(_this, colon = true) {
    var build = ""
    var num = false
    var curr
    var inq = ""

    var parsed = []
    var chop = function () {
        //console.log("LLLL", build, "::", curr)
        if (inq == "") {
            if (build != "")
                parsed.push(build)
            if (curr != "" && curr != " ")
                parsed.push(curr)
            build = ""
        }
    }

    for (var i = 0; i < _this.length; i++) {
        //console.log(build)
        curr = _this[i]
        if (colon ? symbols.includes(curr) : (symbols.includes(curr) && curr != ':')) {
            if (inq != "") {
                build += curr
            }
            chop()
            num = parseInt(curr) == curr
        } else {
            if (parseInt(curr) == curr) {
                if (num) {
                    build += curr
                }
                else {
                    num = true
                    //chop()
                    build += curr
                }
            } else { // not reading number
                if (curr == "'" || curr == '"') {
                    if (inq == "") // not already in quotes
                    {
                        if (build != "") parsed.push(build)
                        build = curr
                        //build += _this[i+1]
                        inq = curr
                    } else {
                        if (inq == curr) {
                            inq = ""
                            build += curr
                            parsed.push(build)
                            build = ""
                        }
                    }
                }
                if (!(curr == "'" || curr == '"')) {
                    build += curr
                }
            }
        }
    }
    parsed.push(build)
    return parsed
}

console.log(parse("i-2"))
module.exports = { parse }