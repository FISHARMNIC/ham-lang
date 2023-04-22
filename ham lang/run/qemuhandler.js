var fs = require('fs');

fs.open(String(process.argv[2]), 'r', function (status, fd) {
    var buffer = Buffer.alloc(100);
    fs.readSync(fd, buffer, 0, 100, 0);
    var address = buffer.readUInt32LE(0);
    var size = buffer.readUInt32LE(4);

    buffer = Buffer.alloc(4);
    fs.readSync(fd, buffer, 0, 4, 8);
    var pass = buffer.toString('utf8', 0, 4);
    if (pass == "PASS") {
        buffer = Buffer.alloc(size);
        fs.readSync(fd, buffer, 0, size, address);
        console.log("\x1b[32m ---- Program Returned ---- \x1b[0m\n\n", buffer.toString('utf8', 0, 100), "\n\n\x1b[32m -------------------------- \x1b[0m")
    }
    else if (pass == "FILE") {
        // to do write data as binary file
    }
    else {
        console.log("\x1b[32m ---- Program Returned Nothing ---- \x1b[0m")
    }
});