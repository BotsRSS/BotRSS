var Bot = require('./bot'),
	Player = require('./player');
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
  Player.bot = this.bot;
}

Core.prototype = {
  bot: null,
  players: [],

  //Bot Start
  start: function() {
  	var self = this;

  	//Get Initial Players
		this.bot.getFollowers(function(data) {
			self.players = data.users.map(function(user) {
				return new Player(user);
			});

			var playerNames = self.getPlayerNames();
			var names = "";

			if(playerNames.length >= 1) {
				names = "@" + playerNames.join(" @");
			}

			console.log("Players: "+names);
			self.bot.tweet("Game started! "+names);
		});

		//Add New Players
		this.bot.onFollowed(function(event) {
			if(!self.players.find(function(element) {
				return element.id == event.source.id;
			})) {
				console.log("Player " + event.source.name + " joined.");
				self.players.push(new Player(event.source));
			}
		});

		this.bot.onNamedTweet(null, function(event) {
			//Tweet where i'm named
			var user = event.user;
			var hashtags = event.entities.hashtags;
			var mentions = event.entities.user_mentions.filter(function(mention) {
				return mention.screen_name != self.bot.screen_name;
			});


			if(containsHashtag(hashtags, "kill")) {
				var killed = self.getPlayer(mentions[0]);
				var killer = self.getPlayer(user);

				if(killed && killer)
					killed.kill(killer);
			}
			else if(containsHashtag(hashtags, "killedby")) {
				var killer = self.getPlayer(mentions[0]);
				var killed = self.getPlayer(user);

				if(killed && killer)
					killed.confirm(killer);
			}
			/*
			{
				hashtags: [],
	      urls: [],
				user_mentions: [ 
					{ 
				    screen_name: 'rssbotalpha',
				    name: 'rssbotalpha',
				    id: 713772632475377700,
				    id_str: '713772632475377664',
				    indices: [Object]
				  },
				    screen_name: 'muitxer',
				    name: 'Miguel Fernández',
				    id: 2569752349,
				    id_str: '2569752349',
				    indices: [Object]
				  }
				],
				symbols: []
			}
			*/


		});
  },

  getPlayerNames: function() {
  	return this.players.map(function(player) {
  		return player.screen_name;
  	});
  },

  getPlayer: function(playerJson) {
  	return this.players.find(function(player) {
			return player.screen_name == playerJson.screen_name;
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


function containsHashtag(hashtags, text) {
	return hashtags.find(function(hashtag) { return hashtag.text == text}) != null;
}