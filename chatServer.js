/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;
var jokeNum;
var jokeStart = [
    'A broken pencil',
    'Owls say',
    'Boo',
    'Europe',
    'Theodore',
    'Amos',
    'Cow\'s go',
    'Little old lady',
    'Nunya',
    'Etch'
];
var jokeEnd = [
    'Never mind, it\'s pointless.',
    'Yes, they do.',
    'Aw, don\'t cry!',
    'No, you\'re a poo!',
    'Theodore wasn\'t open, so I knocked.',
    'A mosquito.',
    'No, silly. Cows go moo!',
    'I didn\'t know you could yodel.',
    'Nunya business!',
    'Bless you!'
];

//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  jokeNum = 0;
  socket.on('loaded', function(){// we wait until the client has loaded and contacted us that it is ready to go.

  socket.emit('answer',"Hello, I am \"-*KNOCKBOT*-\" a simple chat bot example."); //We start with the introduction;
  setTimeout(timedQuestion, 2500, socket,"What is your name?"); // Wait a moment and respond with a question.
});
  socket.on('message', (data) => { // If we get a new message from the client we process it;
        console.log(data);
        questionNum= bot(data,socket,questionNum);	// run the bot function with the new message
      });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data,socket,questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;

/// These are the main statments that make up the conversation.
  if (questionNum == 0) {
      answer = 'Hello ' + input + ' :-)';// output response
      waitTime = 2000;
      question = 'Knock! Knock!';
  }
  else if (questionNum == 1) {
      if (input.toLowerCase().includes('who\'s there')) {
        question = jokeStart[jokeNum];
      }
      else {
          answer = 'You\'re supposed to say \"Who\'s there?\"!';
          waitTime = 2000;
          question = 'Try again!';
          questionNum--;
      }
  }
  else if (questionNum == 2) {
    if (input.toLowerCase().includes(jokeStart[jokeNum].toLowerCase() + ' who')) {
      answer = jokeEnd[jokeNum] + ' :-)';
      waitTime = 3000;
      question = 'Would you like another joke?';
    }
    else {
      answer = 'You\'re supposed to say \"' + jokeStart[jokeNum] + ' who?\" !';
      waitTime = 3000;
      question = 'Try again!';
      questionNum--;
    }
  }
  else{
    if(input.toLowerCase()==='yes' || input.toLowerCase()==='y') {
      jokeNum++;
      if (jokeNum >= jokeStart.length) {
        answer = 'Sorry, those are all the jokes I have. Thanks for participating! :-)';
        question = '';
      }
      else {
        answer = 'Great!';// output response
        waitTime = 0;
        question = 'Press [Enter] to restart!';
        questionNum = -1;
      }
    }
    else if (input.toLowerCase()==='no' || input.toLowerCase()==='n') {
      answer = 'Thanks for participating!';
      question = '';
    }
    else {
      answer = 'Please enter \"Yes\" or \"No\".';
      waitTime = 3000;
      question = 'Try again!';
      questionNum--;
    }

  }


/// We take the changed data and distribute it across the required objects.
  socket.emit('answer',answer);
  setTimeout(timedQuestion, waitTime,socket,question);
  return (questionNum+1);
}

function timedQuestion(socket,question) {
  if(question!=''){
  socket.emit('question',question);
}
  else{
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
