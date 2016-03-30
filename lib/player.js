

var Player = function(data, points) {
  if(data) {
    this.name = data.name;
    this.screen_name = data.screen_name;
  }
  this.data = data;
  this.points = points || 0;
}

Player.prototype = {
  name: "",
  screen_name: "",
  data: [],
  points: 0,

  confirmedKiller: null,
  killer: null,

  kill: function(killer) {
    this.killer = killer
    killIfConfirmed();
  },

  confirm: function(killer) {
    this.confirmedKiller = killer;
    killIfConfirmed();
  },

  killIfConfirmed: function() {
    if(this.confirmedKiller && this.killer)
    {
      this.points -= 1;
      if(this.points < 0)
        this.points = 0;

      this.confirmedKiller.points += 1;

      this.confirmedKiller = null;
      this.killer = null;

      //Tweet a kill
      //Player.bot.tweet("Blah!");
      return true;
    }
    return false;
  }

}

Player.bot = undefined;

module.exports = Player;
