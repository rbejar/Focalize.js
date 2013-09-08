var Focalize = (function () {
  var Focalize = {},
    privateVariable = 1;

  function privateMethod() {
    // ...
  }

  Focalize.currSlideIdx = 0,
  Focalize.currSeqIdx = 0,
  Focalize.$slides = [],
  Focalize.numSlides = 0,
  Focalize.seqChanges = [],
  Focalize.numSeqs = 0,
  Focalize.$seqs = [];
  Focalize.seqNumSlides = []; 
  Focalize.$slideDivs = [];
  
  Focalize.seqOfSlide = function(slideIdx) {    
    for (var i = 1; i < Focalize.seqChanges.length; i++) {
      if (slideIdx < Focalize.seqChanges[i]) {
        return i-1;
      }  
    }
    return i;
  };

  
  Focalize.start = function () {
    // PRECARGAR IMAGENES ETC.?
    
    $(document).ready(function(){
      // Go to full screen
      $(document).fullScreen(true);
      $(document).bind("fullscreenchange", function() {
        if ($(document).fullScreen()) {       
          $('#view-fullscreen').remove();         
          
          // CREO QUE SIMPLEMENTE RETRASANDO LA LLAMADA A START HASTA
          // QUE EL BOTTON HA SIDO EFECTIVAMENTE ELIMINADO HARÁ QUE
          // SE COJA EL TAMAÑO FULL SCREEN SIN MÁRGENES. PARECE
          // QUE SI NO, EL NAVEGADOR ESTÁ TODAVÍA "RECOLOCÁNDOSE" Y
          // PUEDEN SALIR MÁRGENES INDESEADOS...
          
            // CON ESTA PAUSA DE 2 SEGUNDOS A PIÑÓN VA BIEN, PERO SERÍA MEJOR
          // QUE ESTO FUERA POR EVENTO...
          setTimeout(Focalize.fullScreenStart, 2000);
        } else {
          // Si salimos de full screen, de momento no hago nada
            // Debería poner la presentación en un estado "continuable" o bien
          // "resetearla" y explicar al usuario lo que puede hacer
        }    
      });  
    });    
  };
  
  /**
   * Creates background and other elements common for a sequence of slides
   * @param $seqChildren
   */
  Focalize.$createSeqDiv = function(currSeqIdx) {    
    var seqWidthPx = Focalize.seqNumSlides[currSeqIdx] * $("html").width();    
    
    var $seqDiv = $("<div></div>").addClass("seqToDisplay seq-templ-1");            
    var $nonScrollElementDiv = $("<div></div>").addClass("backToScroll back-seq-templ-1")
                               .css({width: seqWidthPx, 
                                     "background":"transparent url(assets/hill-with-windmill.png) repeat-x"});
    
    var $backgroundDiv = $("<div></div>").addClass("scrollback-seq-templ-1");
    // spritely scrolls fine with a width of 100%, but I need this for the
    // changes between slides
    var $scrollElementDiv = $("<div></div>").addClass("scrollingBack scrollback-seq-templ-1")
                     .css({width: seqWidthPx, "background":"transparent url(assets/hill2.png) repeat-x"});
    $seqDiv.append($nonScrollElementDiv);
    $seqDiv.append($backgroundDiv);    
    $backgroundDiv.append($scrollElementDiv);
    $scrollElementDiv.pan({fps: 30, speed: 1, dir: 'left'});
    return $seqDiv;
  };
  
  Focalize.$createSlideDiv = function($slideChildren) {
    var $slideDiv = $("<div></div>").addClass("slide-style-1");
    $slideDiv.append($slideChildren);
    return $slideDiv;
  };
  
  /**
   * Show slide with index newSlideIdx. The exact behaviour will depend
   * on if there is a change of sequence, and if it is a "next" or "previous"
   * slide, or a different one
   * @param newSlideIdx 
   */
  Focalize.displaySlide = function(newSlideIdx) {    
    if (newSlideIdx < 0 || newSlideIdx > (Focalize.numSlides - 1)) {
      // The slide does not exist. Do nothing.
      return;
    }
    
    var isSeqChange = false;
    var prevSlideInSeq = false;
    var nextSlideInSeq = false;
   
    
    var newSeqIdx = Focalize.seqOfSlide(newSlideIdx);       

    if (newSeqIdx !== Focalize.currSeqIdx) {    
      isSeqChange = true;
    } else {
      if (newSlideIdx === (Focalize.currSlideIdx + 1)) {
        nextSlideInSeq = true;
      } else if (newSlideIdx === (Focalize.currSlideIdx - 1)) {
        prevSlideInSeq = true;
      }
    }
    
    if (isSeqChange) {      
      $(".seqToDisplay").remove();
      var $seqToDisplay = Focalize.$createSeqDiv(Focalize.seqOfSlide(newSlideIdx));
      $(".focalize-presentation").after($seqToDisplay);      
    }
    
    // we must use clone in order to prevent making changes to our
    // "master" slideDivs. This way we can make any changes to the
    // slideDivs (adding classes, changing position...) without
    // "destroying" the originals
    var $slideToDisplay = Focalize.$slideDivs[newSlideIdx].clone();
    $slideToDisplay.addClass("slideToDisplay");    
    var $slideToRemove = $(".slideToDisplay");    
    
    
    var addSlideToDisplay = function() {
      $(".seqToDisplay").append($slideToDisplay);     
      $(".text-seq-templ-1").fitText();
      removeCurrentSlide();      
    };
    
    var removeCurrentSlide = function() {
      $slideToRemove.remove();      
    };
 
    
    if ($slideToRemove.length === 0) {
      // In first slide...
      addSlideToDisplay(); 
    } else { 
      var $scrollingBack = $(".scrollingBack");      
      $scrollingBack.spStop();
      
      if (nextSlideInSeq) {
        $(".backToScroll").transition({ x: "-="+$("html").width()+"px" }, "slow");

        $scrollingBack.transition({ x: "-="+$("html").width()/4+"px" }, "slow", function() {
          $scrollingBack.spStart();
        });       
        
        $slideToRemove.css({position : "absolute", width : "100%"})
                      .transition({ x: "-="+$("html").width()+"px" }, "slow", addSlideToDisplay);        
      } else if (prevSlideInSeq) {       
        $(".backToScroll").transition({ x: "+="+$("html").width()+"px" }, "slow");
                
        $scrollingBack.transition({ x: "+="+$("html").width()/4+"px" }, "slow", function() {
          $scrollingBack.spStart();
        });

        $slideToRemove.css({position : "absolute", width : "100%"})
        .transition({ x: "+="+$("html").width()+"px" }, "slow", addSlideToDisplay);
      } else { // IS A NEW SEQUENCE
      }
    }
    
    
    
    
    Focalize.currSlideIdx = newSlideIdx;
    Focalize.currSeqIdx = newSeqIdx;
  };
  
  Focalize.presentationHandler = function(event) {
    var newSlideIdx;    
    //console.log(event.keyCode);
    if (event.keyCode === 39) {
      newSlideIdx = Focalize.currSlideIdx + 1;
    } else if (event.keyCode === 37) {
      newSlideIdx = Focalize.currSlideIdx - 1;
    }
        
    Focalize.displaySlide(newSlideIdx);
    
    // TODO: Prevenir que se pueda pulsar una tecla antes de cargar
    // completamente el nuevo slide, o hace cosas raras (p.ej.
    // scroll del fondo dos veces, textos desaparecidos...)
    
  };
  
  
  Focalize.fullScreenStart = function () {   
    // width será la pantalla (si en full screen). height será cero si no hay elementos
    //alert($("html").width()+","+$("html").height());
    
    var $allSeqs = $(".focalize-sequence");
    
    Focalize.$slides = [];
    Focalize.numSlides = 0;
    Focalize.seqChanges = []; // indexes of the slides that start a new sequence
    Focalize.numSeqs = $allSeqs.size();
    Focalize.$seqs = [];
    Focalize.seqNumSlides = []; // number of slides in each sequence
    // Only for the first slide, current slide and seq are -1
    Focalize.currSlideIdx = -1;
    Focalize.currSeqIdx = -1;
    
    Focalize.$slideDivs = [];
    
    for (var i = 0; i < Focalize.numSeqs; i++) {
      var $currSeq = $(".focalize-sequence").eq(i);
      var $currSeqSlides = $currSeq.find(".focalize-slide");
      Focalize.$seqs[i] = $currSeq;
      Focalize.seqChanges[i] = Focalize.numSlides;
      Focalize.seqNumSlides[i] = $currSeqSlides.length;
      for (var j = 0; j < $currSeqSlides.size(); j++) {
        Focalize.$slides[Focalize.numSlides] = $currSeq.find(".focalize-slide").eq(j);
        var $slideChildren = Focalize.$slides[Focalize.numSlides].find("h1,h2,h3").addClass("text-seq-templ-1");
        Focalize.$slideDivs[Focalize.numSlides] = Focalize.$createSlideDiv($slideChildren);        
        Focalize.numSlides += 1;
      }     
    }
    
    
    // Display first slide to start the "presentation loop"
    Focalize.displaySlide(0);
    
    $(document).keyup(Focalize.presentationHandler);
    
    
    // QUICK TEST... 
    
    $.physix2d.init();
    $("h1,h2,h3").physix2d_ToBody();
    $.physix2d.simulate();
    
 
  };
  

  return Focalize;
}());
