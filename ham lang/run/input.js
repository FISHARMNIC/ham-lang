// waits until 'ADDR' appears in firts 4 bytes of memory
// loads next 4 bytes as 

var fs = require('fs');
var address;

var input_data = process.argv[3]

fs.open(String(process.argv[2]), 'r+', function (status, fd) {
    var buffer = Buffer.alloc(8);
    do 
    {
        fs.readSync(fd, buffer, 0, 8, 0);
        var s = buffer.toString('utf8', 0, 4);
    } while(s != "ADDR");

    address = buffer.readUInt32LE(4);
    console.log("GOT ADDR", address)
    fs.writeSync(fd, input_data, address, 'ascii');
    fs.writeSync(fd, "RDY", 0, 'ascii' );
})