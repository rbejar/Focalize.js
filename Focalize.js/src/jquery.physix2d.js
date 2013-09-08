//////////////////////////////////////////////////////////////////////
// This is to use requestAnimationFrame the same in different browsers 
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
//////////////////////////////////////////////////////////////////////

(function($) {
  $.physix2d = {
    world : null,   
    bodies : [],
    $elements : [],
    time : 0,
    timeStepS : (1/60), /* Constant, for the world.step function */
    timeStepMs : (1/60)*1000, /* Constant, for the world.step function */
    dtRemaining : 0,
    scale : 30,
    
    init: function(opts) {      
      var defaults = {
        scale : 30, /* Pixels per meter. The "right" number depends on the kind of 
                       stuff that you are drawing */
        gravity : new Box2D.b2Vec2(0, -10)  
      };
    
      var options = $.extend(defaults, opts);
      $.physix2d.scale = options.scale;
      $.physix2d.world = new Box2D.b2World(options.gravity);
    },
  
    startSimulation: function(opts) {
      
    },
    
    stopSimulation : function(opts) {
      
    },
       
    simulate : function() {      
      requestAnimationFrame($.physix2d.simulate);
      var now = new Date().getTime(),
          dt = now - ($.physix2d.time || now);     
      $.physix2d.time = now;      
      
      // We want the world step to be constant (recommendation by Box2D)
      // so we may need to make more than one step if delta time (time since
      // our previous call to this function) is bigger
      // than this constant world step
      $.physix2d.dtRemaining += dt;
      while ($.physix2d.dtRemaining > $.physix2d.timeStepMs) {
        $.physix2d.dtRemaining -= $.physix2d.timeStepMs;
        $.physix2d.world.Step($.physix2d.timeStepS, 8, 3); // Step requires seconds. 8 velocityIterations, 3 positionIterations
      }
     
      
      // FOR EACH BODY IN THE WORLD, UPDATE POS AND ROTATION OF ITS CORRESPONDING ELEMENT          
      for (var i = 0; i < $.physix2d.bodies.length; i++) {
        var currentBody = $.physix2d.bodies[i];
        var $currentElement = $.physix2d.$elements[i];
        var bodyPos = currentBody.GetPosition();
        var elementPos = $.physix2d._fromWorld(bodyPos.get_x(), bodyPos.get_y(), currentBody.GetAngle());
        //$currentElement.transition({ x: elementPos.x, y: elementPos.y, rotate : elementPos.rotate, duration : 0});
        // I am rounding the rotation because otherwise this is not working well... :-/
        $currentElement.css({ translate: [elementPos.x, elementPos.y], rotate : Math.round(elementPos.rotate)});
       
      }
       
    },
    
    /**
     * x, y and rotation as provided by box2d
     * @param x
     * @param y
     * @param rotation
     */
    _fromWorld : function(x, y, rotate) {
      return {x : x * $.physix2d.scale, y : -(y * $.physix2d.scale), rotate : rotate*180/Math.PI};
    }
};
      
  /**
   * Make these elements bodies in the world
   */
  $.fn.physix2d_ToBody = function(opts) {    
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

      // Using jQuery width and height (not taking into account border or padding)
      // and taking into account the scale of the physic world
      var width = $currentElement.width() * $.physix2d.scale;
      var height = $currentElement.height() * $.physix2d.scale;
      
      // Create physic body (fixture+shape) and add to the world...
      if (options.shape === "box") {
        shape = new Box2D.b2PolygonShape();
        shape.SetAsBox(width, height);
      } else { // for now, we assume it is a circle if not a box        
        shape = new Box2D.b2CircleShape();
        // width and height should not be very different if we want
        // to treat the element as circle
        shape.set_m_radius(width > height ? width : height);        
      }
      
      bd = new Box2D.b2BodyDef();
      if (options.type === "dynamic") {
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
      
      body.SetUserData($currentElement);
      
      $.physix2d.bodies.push(body);
      $.physix2d.$elements.push($currentElement);
    });     
  };
})(jQuery);