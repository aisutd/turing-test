const API_KEY = 'CC6wqVttRBK3yNkQMrN7sbSqSjA';
const PORT = 3000

const Cleverbot = require('cleverbot');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var bot = new Cleverbot({
    key: API_KEY
});

var bot_response = '';
var human_response = '';

// Server pages
app.get('/', function(req, res){
	res.sendFile(path.resolve(__dirname + '/../frontend/index.html'));
});

app.get('/operator', function(req, res){
	res.sendFile(path.resolve(__dirname + '/../frontend/operator.html'));
});

// Events
io.on('connection', function(socket){
  console.log('user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  
  socket.on('chat message', function(msg){
		console.log('question: ' + msg);
		io.emit('chat message', msg);
		//bot_response = msg;
		
		bot.query(msg).then(function(res) {
			console.log('Cleverbot: ' + res.output);
			bot_response = res.output;
			respond(bot_response, human_response);
		});
  });
	
	socket.on('human response', function(msg) {
		console.log('human message: ' + msg);
		human_response = msg;
		respond(bot_response, human_response);
	});
});

http.listen(PORT, function(){
  console.log('listening on *:' + PORT);
});


function respond(bot_response, human_response) {
	if(bot_response != '' && human_response != '') {
		io.emit('chat response', bot_response, human_response);
		bot_response = '';
		human_response = '';
	}
}
