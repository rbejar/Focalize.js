(function($) {
  $.kripkenbox2d = {
      
  createWorld: function(array) {
    var gravity = new Box2D.b2Vec2(0.0, -10.0);
    var world = new Box2D.b2World(gravity);

    var bd_ground = new Box2D.b2BodyDef();
    var ground = world.CreateBody(bd_ground);
  },
  
  other: function() {
    // do it
  }
  
  };
  })(jQuery);