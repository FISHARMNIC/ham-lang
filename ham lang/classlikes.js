function put_string(x)
{
    return `put_string(${x})`
}
function str_cat(x, arg)
{
    return `_str_concat_(${x}, ${arg})`
}
function put_int(x)
{
    return `put_int(${x})`
}

module.exports =
{
    '{"bits":32,"pointer":false}': { // i32
        print: put_int
    },
    '{"bits":8,"pointer":true}': { // String
        print: put_string,
        cat: str_cat,
    }
}