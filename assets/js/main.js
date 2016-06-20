(function() {
  // ================== globals ==================
  var COLORS = ['red', 'green', 'blue', 'yellow'];
  var START_DIFFICULTY = 3;
  var COLOR_LIGHT_TIME = 300;
  var STARTING_TIME_PER_COLOR = 1000;

  var sounds = {};

  var $colors = {};
  var $simon = null;
  var $score = null;

  var game = null;

  // ================== utility ==================
  // Returns a random integer between min (included) and max (excluded)
  // Using Math.round() will give you a non-uniform distribution!
  var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // returns a random element from an array
  var getRandomFromArray = function(arr) {
    var randIndex = getRandomInt(0, arr.length);
    return arr[randIndex];
  };

  // ================== game functions ==================

  // setup the global jquery variables
  var setup = function(){
    for(var i = 0; i < COLORS.length; i = i + 1){
      var color = COLORS[i];
      setupColor(color);
    }
    $simon = $('.simon');
    $score = $('.score');
  };

  // setup one colors jquery variable and click listener
  var setupColor = function(color){
    var $color = $('.' + color);
    $colors[color] = $color;
    sounds[color] = new Audio('assets/sound/' + color + '.mp3');
    // currying maybe too complex, alternately we can use the target
    $color.click(function() { onColorClick(color); });
  };

  // restart the game
  var restart = function(colors) {
    game = {
      pattern: null,
      score: 0,
      difficulty: START_DIFFICULTY,
      patternIndex: 0,
      clickable: false,
      timePerColor: STARTING_TIME_PER_COLOR
    };
    $score.html(game.score);
    nextPattern();
  };

  // generate he next pattern and play it
  var nextPattern = function(){
    // this is to prevent the user from clicking on stuff until it's time
    game.clickable = false;
    $simon.toggleClass('clickable', false);
    game.pattern = generatePattern(game.difficulty);
    game.patternIndex = 0;
    playPattern(game.pattern, game.timePerColor, onPlayPatternComplete);
  };

  // generate a pattern of random colors from the COLORS array
  var generatePattern = function(length){
    var pattern = [];
    for(var i = 0; i < length; i = i + 1){
      var color = getRandomFromArray(COLORS);
      pattern.push(color);
    }
    return pattern;
  };

  // play a pattern and call the callback when the pattern is done playing
  // time per color is the time it allocated for each color to play
  var playPattern = function(pattern, timePerColor, cb){
    var i = 0;
    // call the light color function every timePerColor miliseconds until
    // we've done all the colors in the pattern
    var interval = setInterval(function() {
      // if timePerColor gets to be less than COLOR_LIGHT_TIME use that instead
      lightColor(pattern[i], Math.min(timePerColor, COLOR_LIGHT_TIME));
      i++;
      if (i >= pattern.length) {
        // stop when we're done
        clearInterval(interval);
        cb();
      }
    }, timePerColor);
  };

  // light up a color for a certain amount of time
  var lightColor = function(color, time){
    var $color = $colors[color];
    $color.toggleClass('on', true);
    sounds[color].play();
    setTimeout(function() {
      $color.toggleClass('on', false);
    }, time);
  };

  // ================== user input ==================

  var onColorClick = function(color){
    // only do stuff in the game is currently clickable
    if(game.clickable){
      // light up the color that the user just clicked to show they clicked it
      lightColor(color, COLOR_LIGHT_TIME);
      var expectedColor = game.pattern[game.patternIndex];
      game.patternIndex = game.patternIndex + 1;
      if(color !== expectedColor){
        onPatternFail();
      } else if(game.pattern.length === game.patternIndex){
        onPatternComplete();
      }
    }
  };

  // ================== game event handlers ==================

  // when the pattern has completed playing
  var onPlayPatternComplete = function(){
    // when we've finished playing the pattern the user can now click things
    game.clickable = true;
    $simon.toggleClass('clickable', true);
  };

  // user successfully completes a pattern
  var onPatternComplete = function(){
    game.difficulty = game.difficulty + 1;
    game.score = game.score + 1;
    game.timePerColor = STARTING_TIME_PER_COLOR - game.score * 2;
    $score.html(game.score);
    nextPattern();
  };

  // if the user puts in the wrong color
  var onPatternFail = function(){
    onLose();
  };

  // when you lose
  var onLose = function(){
    alert('You Lose :( - final score: ' + game.score);
    restart();
  };

  // ================== ready ==================

  // when the page is done loading
  var onReady = function(){
    setup();
    restart();
  };

  $(document).ready(onReady);
})();
