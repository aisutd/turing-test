
$(function () {
	var socket = io();
					
	socket.on('connect', function() {
			//  Identify as operator
			socket.emit('identify', 'operator');
	});

	socket.on('disconnect', function() {
			$('#desc').html('Disconnected from server. Attempting to reconnect...');
			$('#button-response').prop('disabled', true);
	});
	
	$('form').submit(function(){
		let human_msg = $('#human-response-text').val();
		let bot_msg = $('#cleverbot-response-text').val();
		
		socket.emit('message', { bot: bot_msg, person: human_msg });
		$('#human-messages').append($('<li>').text('Operator: ' + $('#human-response-text').val()));
		$('#human-response-text').val('');
		
		$('#cleverbot-messages').append($('<li>').text('Cleverbot: ' + $('#cleverbot-response-text').val()));
		$('#cleverbot-response-text').val('');
		return false;
	});
	
	socket.on('chat message', function(msg){
		
	});

	socket.on('message', function(messages){
			let human_msg = messages.person;
			let bot_msg = messages.bot;
			
			if(messages.person != undefined) {
				$('#human-messages').append($('<li>').text('Participant: ' + human_msg));
				$('#cleverbot-messages').append($('<li>').text('Participant: ' + human_msg));
			}
			
			if(messages.bot != undefined) {
				$('#cleverbot-response-text').val(bot_msg);
			}
	});

	socket.on('status', function(s) {
			if(typeof s.ready == 'boolean') {
					$('#button-response').prop('disabled', !s.ready);
			}
			if(typeof s.message == 'string') {
					$('#desc').html(s.message);
			}
	});

	socket.on('reset', function() {
			 $('#human-messages').html('');
			 $('#cleverbot-messages').html('');
			 
			 $('#human-response-text').val('');
			 $('#cleverbot-response-text').val('');
	});
});
