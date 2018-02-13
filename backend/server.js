const API_KEY = 'CC6wqVttRBK3yNkQMrN7sbSqSjA';
const PORT = 3000;

const Cleverbot = require('cleverbot');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var bot = new Cleverbot({
    key: API_KEY
});

var conversation = null;

var participant_question = '';
var bot_response = '';
var operator_response = '';

var participant_socket = null;
var operator_socket = null;

// Set resource paths
app.use('/css', express.static(path.resolve(__dirname + '/../frontend/css')));
app.use('/js', express.static(path.resolve(__dirname + '/../frontend/js')));
app.use('/img', express.static(path.resolve(__dirname + '/../frontend/img')));

// Server pages
app.get('/', function(req, res) {
	res.sendFile(path.resolve(__dirname + '/../frontend/index.html'));
});

app.get('/operator', function(req, res) {
	res.sendFile(path.resolve(__dirname + '/../frontend/operator.html'));
});

app.get(/\/css\/.*/, function(req, res) {
    res.sendFile(path.resolve(__dirname + '/../frontend' + req.url));
});

// Events
io.on('connection', function(socket){
  console.log('Unidentified user connected');
  socket.on('disconnect', function(){
    if(socket == participant_socket) {
        console.log('Participant disconnected.');
        if(operator_socket) {
            operator_socket.emit('status', { ready: false, message: 'The participant has disconnected.' });
        }

        participant_socket = null;
    }
    else if(socket == operator_socket) {
        console.log('Operator disconnected');
        if(participant_socket) {
            participant_socket.emit('status', { ready: false, message: 'The operator has disconnected.' });
        }

        operator_socket = null;
    }
    else {
        console.log('Unidentified user disconnected');
    }
  });

  //    Users must identify themselves according to their role in the activity
  //    before we can move on.
  socket.on('identify', function(role) {
        switch(role) {
            case 'participant':
                //  If we don't have any participant yet
                if(!participant_socket) {
                    console.log('User identified as participant.');
                    participant_socket = socket;

                    participant_socket.on('message', onParticipantMessage);

                    //  If we already have an operator
                    if(operator_socket) {
                        resetConversation();

                        participant_socket.emit('status', { ready: true, message: 'The turing test has begun! Please send a message.' });
                        operator_socket.emit('status', { ready: false, message: 'The turing test has begun! Waiting for the user to send a message.' });
                    }
                    //  Otherwise we're still waiting
                    else {
                        participant_socket.emit('status', { ready: false, message: 'You have connected to the turing test server! We\'re still waiting on your human interlocutor.' });
                    }
                }
                //  If we already have a participant connected
                else {
                    //  Let them know and then drop this connection.
                    socket.emit('status', { ready: false, message: 'There is already a participant connected to this server. Only 1 can be connected at a time.' }, function() {
                        socket.disconnect(true);
                    });

                    return;
                }

                break;
            case 'operator':
                //  If we don't have any operators yet
                if(!operator_socket) {
                    console.log('User identified as operator.');
                    operator_socket = socket;

                    operator_socket.on('message', onOperatorMessage);
                    operator_socket.on('cb-retry', onCbRetry);

                    //  If we already have a participant
                    if(participant_socket) {
                       resetConversation(); 
                        participant_socket.emit('status', { ready: true, message: 'The turing test has begun! Please send a message.' });
                        operator_socket.emit('status', { ready: false, message: 'The turing test has begun! Waiting for the user to send a message.' });
                    }
                    //  Otherwise we're still waiting
                    else {
                        operator_socket.emit('status', { ready: false, message: 'You have connected to the turing test server! We\'re still waiting on our other human participant.' });
                    }
                }
                //  If we already have an operator connected
                else {
                    //  Let them know and then drop this connection.
                    socket.emit('status', { ready: false, message: 'There is already an operator connected to this server. Only 1 can be connected at a time.' }, function() {
                        socket.disconnect(true);
                    });

                    return;
                }

                break;
            default:
                //  This only occurs if something is coded incorrectly
                console.log('User tried to identify as "' + role + '". Valid roles are "participant" and "operator".');

                //  Let them know and then drop this connection.
                socket.emit('status', { message: 'The role "' + role + '" is not understood.' }, function() {
                    socket.disconnect(true);
                });

                return;
        }
/*
        socket.on('chat message', function(msg){
            console.log('question: ' + msg);
            io.emit('chat message', msg);
            //bot_response = msg;
            
            bot.query(msg).then(function(res) {
                console.log('Cleverbot: ' + res.output);
                bot_response = res.output;
                respond();
            });
        });
	
        socket.on('human response', function(msg) {
            console.log('human message: ' + msg);
            operator_response = msg;
            respond();
        });
*/
  });
});

http.on('error', function(error) {
    console.error('Failed to start listening on port ' + PORT + '. Is the server already running?');
    console.error();
    console.error(error);
});

http.listen(PORT, function(){
    console.log('listening on *:' + PORT);
});



function respond() {
	if(bot_response != '' && operator_response != '') {
		participant_socket.emit('message', { bot: bot_response, person: operator_response });
        participant_socket.emit('status', { ready: true, message: 'Responses have arrived! Feel free to continue conversing.' });
		bot_response = '';
		operator_response = '';
	}
}

function onParticipantMessage(msg) {
    participant_question = msg;
    queryBot(msg);

    console.log('Participant: ' + msg);

    participant_socket.emit('status', { ready: false, message: 'Waiting on responses from human and bot.' });
    operator_socket.emit('message', { person: msg });
    operator_socket.emit('status', { ready: false, message: 'Waiting on CleverBot.' });
}

function queryBot(msg) {
    if(conversation != null) {
        bot.query(msg, { cs: conversation }).then(onBotMessage);
    }
    else {
        bot.query(msg).then(onBotMessage);
    }
}

function onBotMessage(res) {
    conversation = res.cs;
    console.log('Cleverbot: ' + res.output);
    bot_response = res.output;
    operator_socket.emit('message', { bot: bot_response });
    operator_socket.emit('status', { ready: true, message: 'Participant is waiting on your response.' });
    respond();
}

function onOperatorMessage(msg) {
    console.log('Operator: ' + msg.person);

	bot_response = msg.bot;
    operator_response = msg.person;
    operator_socket.emit('status', { ready: false, message: 'Waiting on participant to send another message.' });
    respond();
}

function onCbRetry() {
    console.log('Operator requested a different response from CleverBot.');

    operator_socket.emit('status', { ready: false, message: 'Waiting on CleverBot' });
    queryBot(participant_question);
}

function resetConversation() {
    io.emit('reset');
    conversation = null;
    participant_question = '';
    bot_response = '';
    operator_response = '';
}
