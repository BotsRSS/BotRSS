//
//  Bot
//  class for performing various twitter actions
//
var Twit = require('twit');
var Promise 

var Bot = function(config, success, failure) {
  this.twit = new Twit(config);
  this.config = config;

  var self = this;
  this.connected = false;

  this.twit.get('account/verify_credentials', { skip_status: true })
  .catch(function (err) {
    console.log('caught error', err.stack)
  })
  .then(function (result) {
    var data = result.data;
    if(data.errors != null) {
      if(failure) failure(data.errors);
    }

    self.connected = true;
    self.name = data.name;
    self.screen_name = data.screen_name;

    if(success) success(data);
  });
};

/*
 *  post a tweet
 */
Bot.prototype = {
  config: null,
  connected: false,
  name: "",
  screen_name: "",

  userStream: undefined,

  tweet: function(status, callback) {
    if (typeof status !== 'string') {
      return callback(new Error('tweet must be of type String'));
    } else if (status.length > 140) {
      return callback(new Error('tweet is too long: ' + status.length));
    }
    this.twit.post('statuses/update', {
      status: status
    }, callback);
  },

  retweet: function(id, callback) {
    this.twit.post('statuses/retweet/:id', {
      id: id
    }, callback);
  },

  tweetRandom: function(query) {
    var self = this;
    var params = {
      q: query,
      lang: this.config.lang || "es",
      since: datestring(),
      result_type: 'mixed'
    };

    this.twit.get('search/tweets', params, function(err, data, response) {
      if (err) return handleError(err);

      var max = 0;

      var tweets = data.statuses;

      var tweet = randIndex(tweets);
      console.log(tweet);
      self.tweet(tweet.text, function(err, reply) {
        if (err) return handleError(err);

        console.log('\nTweet: ' + (reply ? reply.text : reply));
      });
    });
  },

  retweetRandom: function(query) {
    var self = this;
    var params = {
      q: query,
      lang: "es",
      since: datestring(),
      result_type: 'mixed'
    };

    this.twit.get('search/tweets', params, function(err, data, response) {
      if (err) return handleError(err);

      var max = 0;

      var tweets = data.statuses;

      var tweet = randIndex(tweets);
      if (tweet) {
        self.retweet(tweet.id_str, function(err, data, retweet) {
          if (err) return handleError(err);

          console.log('\nRetweet: ' + (data ? data.text : data));
        });
      }
    });
  },



  //
  //  choose a random friend of one of your followers, and follow that user
  //
  followRandom: function(callback) {
    var self = this;

    this.twit.get('followers/ids', function(err, reply) {
      if (err) {
        return callback(err);
      }

      var followers = reply.ids,
        randFollower = randIndex(followers);

      self.twit.get('friends/ids', {
        user_id: randFollower
      }, function(err, reply) {
        if (err) {
          return callback(err);
        }

        var friends = reply.ids,
          target = randIndex(friends);

        self.follow(target, callback);
      });
    });
  },

  follow: function(target, callback) {
    this.twit.post('friendships/create', {
      id: target
    }, callback);
  },

  unfollow: function(target, callback) {
    this.twit.post('friendships/destroy', {
      id: target
    }, callback);
  },

  isFollowingMe: function(user_id, callback) {
    this.twit.get('friendships/lookup', {
      user_id: user_id
    }, function(err, reply) {
      var result = true;
      if (err) {
        console.log("IsFollowingMe error: "+err);
        result = false;
      } else if (reply) {
        result = false;
      }
      callback(result);
    });
  },

  //
  //  prune your followers list; unfollow a friend that hasn't followed you back
  //
  unfollowRandom: function(callback) {
    var self = this;

    this.twit.get('followers/ids', function(err, reply) {
      if (err) return callback(err);

      var followers = reply.ids;

      self.twit.get('friends/ids', function(err, reply) {
        if (err) return callback(err);

        var friends = reply.ids,
          pruned = false;

        while (!pruned) {
          var target = randIndex(friends);

          if (!~followers.indexOf(target)) {
            pruned = true;
            self.unfollow(target, callback);
          }
        }
      });
    });
  },

  //Getters
  getFollowers: function(callback) {
    this.twit.get('followers/list', { screen_name: this.screen_name })
    .catch(function (err) {
      console.log('caught error', err.stack)
    })
    .then(function (result) {
      if(typeof(callback) == "function")
        callback(result.data);
    });
  },

  onNamedTweet: function(filters, callback) {
    if(!filters || !(filters instanceof Array)) {
      filters = [];
    }
    filters.push("@"+this.screen_name);

    this.onTweet(filters, callback);
  },

  onTweet: function(filters, callback) {
    if(!filters || !(filters instanceof Array)) {
      filters = [];
    }

    var stream = this.twit.stream('statuses/filter', { track: filters });
    stream.on('tweet', callback);
  },

  //Events
  onFollowed: function(callback) {
    var self = this;

    if(!this.userStream)
      this.userStream = this.twit.stream('user', {with: "user"});

    this.userStream.on('follow', function (event) {
      if(event.source.screen_name != self.screen_name) {
        if(callback) callback(event);
      }
    });
  },

  onUnfollowed: function(callback) {
    var self = this;
    
    if(!this.userStream)
      this.userStream = this.twit.stream('user', {with: "user"});

    this.userStream.on('unfollow', function (event) {
      //if(event.source.screen_name != self.screen_name) {
        if(callback) callback(event);
      //}
    });
  },


  /*
  * Message Handling
  */
  sendMessage: function(user, msg) {
    this.twit.post('direct_messages/new', { screen_name: this.screen_name }, function(ev) {
       
    });
  },

  onMessage: function(callback) {
    var self = this;
    
    if(!this.userStream)
      this.userStream = this.twit.stream('user', {with: "user"});

    this.userStream.on('message', function (event) {
      //if(event.source.screen_name != self.screen_name) {
        if(callback) callback(event);
      //}
    });
  }

}

module.exports = Bot;


function randIndex(arr) {
  var index = Math.floor(arr.length * Math.random());
  return arr[index];
};

//get date string for today's date (e.g. '2011-01-01')
function datestring() {
  var d = new Date(Date.now() - 5 * 60 * 60 * 1000); //est timezone - 5 hours
  return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getDate();
};

function handleError(err) {
  console.error('Error(' + err.statusCode + "): " + err.data);
}