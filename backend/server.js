const API_KEY = 'CC6wqVttRBK3yNkQMrN7sbSqSjA';
const PORT = 50340;

const net = require('net');
const Cleverbot = require('cleverbot');

var bot = new Cleverbot({
    key: API_KEY
});

var server = net.createServer(connected);

server.on('end', disconnected);
server.on('error', handleError);
server.listen(PORT, () => {
    console.log('Server is now listening on port ' + PORT);
});


function connected(socket) {
    console.log('Connection from ' + socket.localAddress);

    let address = socket.localAddress;

    socket.setKeepAlive(true, 15000);
    socket.on('end', function() {
        disconnected(address);
    });
    socket.on('data', function(buffer) {
        try {
            let res = JSON.parse(buffer.toString());
            console.log('Received this from ' + socket.localAddress);
            console.log(JSON.stringify(res, null, 2));
        } catch (e) {
            handleError(e);
        }
    });
}

function disconnected(address) {
    console.log(address + ' disconnected.');
}

function handleError(err) {
    console.log(err);
}
















/*
bot .query('Hey Cleverbot, how you doin?')
    .then(function(res) {
        let text = 'Cleverbot says "' + res.output + '"';
        console.log(text);

        bot .query(text, { cs: res.cs })
            .then(function(res2) {
            text = 'Cleverbot says "' + res2.output + '"';
            console.log(text);
        });
});

*/
