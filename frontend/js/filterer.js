
$(function () {
	var socket = io();

    var botMessage = '';
					
	socket.on('connect', function() {
			//  Identify as filterer
			socket.emit('identify', 'filterer');
	});

	socket.on('disconnect', function() {
			$('#desc').html('Disconnected from server. Attempting to reconnect...');
			$('#button-response').prop('disabled', true);
	});
	
	$('form').submit(function(){
		//let bot_msg = $('#cleverbot-response-text').val();
		
		socket.emit('approve', botMessage);
		$('#human-messages').append($('<li class="response">').text('Bot: ' + botMessage));
		$('#human-response-text').val('');
        botMessage = '';
		
		//$('#cleverbot-messages').append($('<li class="response">').text('Cleverbot: ' + $('#cleverbot-response-text').val()));
		//$('#cleverbot-response-text').val('');
		return false;
	});

    $('#button-retry').click(function() {
        socket.emit('cb-retry');
        $('#human-response-text').val('');
    });

    //$('#button-cleverbot').click(function() {
    //    socket.emit('cb-retry');
    //});
	
	//socket.on('chat message', function(msg){
	//	
	//});

	socket.on('message', function(msg){
			//let human_msg = messages;
			//let bot_msg = messages.bot;
			
			//if(messages != undefined) {
            
            if(typeof msg.person === 'string') {
    			$('#human-messages').append($('<li class="participant">').text('Participant: ' + msg.person));
            }
            else if(typeof msg.bot === 'string') {
                botMessage = msg.bot;
                $('#human-response-text').val(botMessage);
            }
				//$('#cleverbot-messages').append($('<li class="participant">').text('Participant: ' + human_msg));
			//}
			
			//if(messages.bot != undefined) {
			//	$('#cleverbot-response-text').val(bot_msg);
			//}
	});

	socket.on('status', function(s) {
			if(typeof s.ready == 'boolean') {
					$('#button-approve').prop('disabled', !s.ready);
                    $('#button-retry').prop('disabled', !s.ready);
			}
			if(typeof s.message == 'string') {
					$('#desc').html(s.message);
			}
	});

	socket.on('reset', function() {
			 $('#human-messages').html('');
			 //$('#cleverbot-messages').html('');
			 
			 $('#human-response-text').val('');
			 //$('#cleverbot-response-text').val('');
	});
});
