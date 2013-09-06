(function($) {
  $.physix2d = {
    world : null,    
    
    init: function(opts) {      
      var defaults = {
        scale : 30, /* Pixels per meter. Depends on the kind of stuff that you are drawing */
        gravity : new Box2D.b2Vec2(0, -10)  
      };
    
      var options = $.extend(defaults, opts);
                  
      $.physix2d.world = new Box2D.b2World(options.gravity);
    },
    
    // This is not really necessary. Wrapping the world object is not what I need now
    changeGravity: function(newGravity) {      
      $.physix2d.world.SetGravity(newGravity);
    },
    
    
    createGround: function(opts) {

      var bd_ground = new Box2D.b2BodyDef();
      var ground = _world.CreateBody(bd_ground);
      
      return ground;
    }
  };
      
  /**
   * Make these elements react to the world
   */
  $.fn.physix2d_XX = function(opts) {    
    var defaults = {
      type : "dynamic", /* dynamic or static */
      density : 1.5, /* 0.. n */
      restitution : 0.3, /* 0..1 */
      friction : 0.3, /* 0..1 */
      shape : "box" /* box or circle. More complex stuff for another day... */
    };
    
    var options = $.extend(defaults, opts);

    return this.each(function() {
      var $currentElement = $(this);
      
      
      
      var shape, body, fd, bd;
      // Do something with $currentElement
      
      
      // Calculate position, height and width (taking into acount the scale of the world)
      
      // POR HACER, SACAR SIZE THE CURRENTELEMENT
      
      
      // Create physic body (fixture+shape) and add to the world...
      if (options.shape === "box") {
        shape = new Box2D.b2PolygonShape();
        shape.SetAsBox(size, size);
      } else { // for now, we assume it is a circle if not a box 
        shape = new Box2D.b2CircleShape();
        shape.set_m_radius(size);        
      }
      
      bd = new Box2D.b2BodyDef();
      if (type === "dynamic") {
        bd.set_type(Box2D.b2_dynamicBody);  
      } else { // we assume it is static if not dynamic
        bd.set_type(Box2D.b2_staticBody);
      }
      
      body = $.physix2d.world.CreateBody(bd);
      
      fd = new Box2D.b2FixtureDef();
      fd.set_density(options.density);
      fd.set_friction(options.friction);
      fd.set_shape(shape);
      body.CreateFixture(fd);
      
      
      
    });     
  };
})(jQuery);