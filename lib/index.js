var Bot = require('./bot'),
  config = require('../config');

var Core = function() {
  //Singleton
  if (!(this instanceof Core) || Core.prototype._instance)
    return Core.prototype._instance;
  Core.prototype._instance = this;

  this.bot = new Bot(config.twitter);

  console.log('CTBot: Running.');

  //MARKOV Tweet
  var queries = [
    '#Gamification'
  ];

  /* Tweet querries
  var stream = bot.twit.stream('statuses/filter', {
    track: queries.join(", "),
    language: config.lang || 'es, en'
  });

  stream.on('tweet', function(tweet) {
    //Skip retweets
    if (!tweet.text.startsWith("RT")) {
      //Read Tweet
    }
  });
  */

  /* Tweet example
  setInterval(function() {
    bot.tweet("Something", function(err, data, retweet) {
      if (err) return handleError(err);
      console.log('\nTweet: ' + (data ? data.text : data));
    });
  }, getRandomInt(20 * 60, 40 * 60) * 1000);
  */

  /* Retweet random
  if (config.autoRetweet) {
    bot.retweetRandom(queries.join(' OR '));
    setInterval(function() {
      bot.retweetRandom(queries.join(' OR '));
    }, getRandomInt(30 * 60, 50 * 60) * 1000);
  }
  */
}

Core.prototype = {
  bot: null
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
