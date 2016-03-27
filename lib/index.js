var Bot = require('./bot'),
  config = require('../config');

var Core = function() {
  //Singleton
  if (!(this instanceof Core) || Core.prototype._instance)
    return Core.prototype._instance;
  Core.prototype._instance = this;
  var self = this;

	console.log('**************\n* Killer Bot *\n**************');
	console.log('Connecting...');

  //Connect and authenticate
  this.bot = new Bot(config.twitter, 
  	function(data) {
    	console.log('Running.');
    	self.start();
  	},
  	function(error) {
      console.log('Couldn\'t authenticate.\n');
      process.exit();
    }
  );
}

Core.prototype = {
  bot: null,
  players: [],

  //Bot Start
  start: function() {
  	var self = this;

		this.bot.getFollowers(function(data) {
			players = data.users;
			var playerNames = self.getPlayerNames(), 
			    names = "";
			if(playerNames.length >= 1) {
				var names = "@" + playerNames.join(" @");
			}
			console.log("Players: "+names);
			self.bot.tweet("Game started! "+names);
		});

		this.bot.onFollowed(function(event) {
			if(!players.find(function(element, index, array) {
				return element.id == event.source.id;
			})) {
				console.log("Player " + event.source.name + " joined.");
				players.push(event.source);
			}

		});

		this.bot.onUnfollowed(function(event) {
			console.log("Player " + event.source.name + " left.");
		});
  },

  getPlayerNames: function() {
  	return players.map(function(player) {
  		return player.screen_name;
  	});
  }
}

module.exports = Core;


//Handlers
function handleError(err) {
  console.error('Error(' + err.statusCode + "): " + err.data);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//UTIL
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}
