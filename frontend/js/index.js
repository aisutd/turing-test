 
 $(function () {
	var socket = io();
	var bot = 'a'
	var human = 'b'

	socket.on('connect', function() {
		//  Identify as participant
		socket.emit('identify', 'participant');
	});

	socket.on('disconnect', function() {
		$('#desc').html('Disconnected from server. Attempting to reconnect...');
		$('#button-ask').prop('disabled', true);
	});

	// Random selection of who is person A/B
	if(Math.random() > 0.5) {
		bot = 'b'
		human = 'a'
	}
	
	$('form').submit(function(){
	  socket.emit('message', $('#response-text').val());
		$('#' + bot + '-messages').append($('<li class="participant">').text('You: ' + $('#response-text').val()));
		$('#' + human + '-messages').append($('<li class="participant">').text('You: ' + $('#response-text').val()));
	  $('#response-text').val('');
	  return false;
	});

	socket.on('message', function(messages) {
		let bot_msg = messages.bot;
		let human_msg = messages.person;
	  $('#' + bot + '-messages').append($('<li class="response">').text('Response: ' + bot_msg));
		$('#' + human + '-messages').append($('<li class="response">').text('Response: ' + human_msg));
	});

	socket.on('status', function(s) {
		if(typeof s.ready == 'boolean') {
			$('#button-ask').prop('disabled', !s.ready);
		}
		if(typeof s.message == 'string') {
			$('#desc').html(s.message);
		}
	});

	socket.on('reset', function() {
		 $('#a-messages').html('');
		 $('#b-messages').html('');
	});
});
