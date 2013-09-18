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
  Focalize.seqNames = [];
  Focalize.seqNumSlides = []; 
  Focalize.$slideDivs = [];
  Focalize.slideNames = [];
  Focalize.styleConfiguration = {};
  
  Focalize.loadPresentation = function(styleJSON_URL) {
    // I can't put this code inside the start function because
    // if I try to call fullScreen inside the getJSON callback
    // (to make sure the JSON is loaded before creating anything)
    // the browser says fullScreen has not been called in a
    // function triggered by a user event
    
    
    // This code is just to prevent Firefox from reporting a not 
    // well formedJSON file, even when the JSON is OK.
    $.ajaxSetup({beforeSend: function(xhr){
      if (xhr.overrideMimeType) {
        xhr.overrideMimeType("application/json");
      }
    }});
    // ------------------
    
    // PRELOAD IMAGES...
    
    // TODO: this does not work in Chromium, as its default policy is not
    // allowing AJAX request on local files. I haven't found a good solution,
    // probably I will end up wrapping the JSON in a JavaScript file and
    // loading it before Focalize.js
    $.getJSON(styleJSON_URL, function(data) {
      Focalize.styleConfiguration = data;
      // And after everything is loaded, we allow the user to start
      $("body").append("<button id='view-fullscreen' onclick='Focalize.start()'>Click me to start your full screen presentation!</button>")
    });
  }
  
  /**
   * Returns the index of the sequence that contains the slide slideIdx
   * (slide indexes start at 0)
   * @param slideIdx
   */
  Focalize.seqOfSlide = function(slideIdx) {        
    for (var i = 1; i < Focalize.seqChanges.length; i++) {
      if (slideIdx < Focalize.seqChanges[i]) {
        return i-1;
      }  
    }
    return 0;
  };
  
  /**
   * Returns the configuration data for the sequence which index is seqIdx
   * @param seqIdx
   */
  Focalize.seqConfigData = function(seqIdx) {
    for (var i = 0; i < Focalize.styleConfiguration.sequences.length; i++) {
      if (Focalize.styleConfiguration.sequences[i].name === Focalize.seqNames[seqIdx]) {
        return Focalize.styleConfiguration.sequences[i];
      }
    }
    throw "Sequence configuration data not found for seqIdx " + seqIdx;
    return null;
  };

  /**
   * Returns the configuration data for the slide which index is slideIdx
   * @param slideIdx
   */
  Focalize.slideConfigData = function(slideIdx) {
    for (var i = 0; i < Focalize.styleConfiguration.slides.length; i++) {      
      if (Focalize.styleConfiguration.slides[i].name === Focalize.slideNames[slideIdx]) {
        return Focalize.styleConfiguration.slides[i];
      }
    }
    throw "Slide configuration data not found for slideIdx " + slideIdx;
    return null;
  };
  
  Focalize.start = function () {   
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
   * @param seqIdx Which sequence? 
   */
  Focalize.$createSeqDiv = function(seqIdx) {
    var seqConfigData = Focalize.seqConfigData(seqIdx);    
    
    //var seqWidthPx = Focalize.seqNumSlides[currSeqIdx] * $("html").width();
    var seqWidthPercent = Focalize.seqNumSlides[seqIdx]*100;  
    
    var $seqDiv = $("<div></div>").addClass("seqToDisplay " + seqConfigData.containerCSSClass);
    
    var $backgroundDiv = $("<div></div>").addClass("backgroundDiv");
    
    /* Explanation regarding background-size: height is 100% so it always takes
     * the full div, which height should be the right one in percentage to the page.
     * Width is trickier. I am using a percentage, because it is the only way I have 
     * found to prevent really ugly issues when the user plays (or has played) with
     * the zoom in the browser. The background width in percentage is relative to the 
     * div, which is seqWidthPercent. But seqWidthPercent depends on the number of
     * slides, so the background width has to depend on them too. Finally, I need the
     * pagesWide coefficient to keep the proper aspect ratio.
     * 
     * This solution is not perfect, and seems to work slightly better in Firefox than in
     * Chrome, but it is far better than nothing, and seems to work reasonably fine
     * unless the zoom levels are very big or very small.*/
    for (var i = 0; i < seqConfigData.backgroundLayers.length; i++) {
      var $backLayerDiv =  $("<div></div>").addClass(seqConfigData.backgroundLayers[i].cssClass
                                                     +" backToScroll"+i)
      .css({width: seqWidthPercent+"%",
        "background-size":seqConfigData.backgroundLayers[i].pagesWide*100/Focalize.seqNumSlides[seqIdx]+"% 100%"});
       $seqDiv.append($backLayerDiv);
    }
    $seqDiv.append($backgroundDiv);    
   
        
    //var $backgroundDiv = $("<div></div>").addClass("scrollback-seq-templ-1");
    // spritely scrolls fine with a width of 100%, but I need this for the
    // changes between slides
    //var $scrollElementDiv = $("<div></div>").addClass("scrollingBack scrollback-seq-templ-1")
    //                     .css({width: seqWidthPx, "background":"transparent url(assets/hill2.png) repeat-x"});
    

    //$backgroundDiv.append($scrollElementDiv);
    //$scrollElementDiv.pan({fps: 30, speed: 1, dir: 'left'});
    return $seqDiv;
  };
  
  Focalize.$createSlideDiv = function($slideChildren, seqIdx) {
    var $slideDiv = $("<div></div>")
                    .addClass(Focalize.seqConfigData(seqIdx).slideCommonsCSSClass);
    $slideDiv.append($slideChildren);
    return $slideDiv;
  };
  
  Focalize.$createTitleDiv = function($slideChildren, slideIdx) {
    var $titleDiv = $("<div></div>")
                    .addClass(Focalize.slideConfigData(slideIdx).titleLayerCSSClass);       
    var $titleTextAreaDiv = $("<div></div>")
                            .addClass(Focalize.slideConfigData(slideIdx).titleTextAreaCSSClass);
    
    $titleTextAreaDiv.append($slideChildren);
    $titleDiv.append($titleTextAreaDiv);
    return $titleDiv;  
  };
  
  Focalize.$createContentDiv = function(slideIdx) {

    
    
    var $contentDiv = $("<div></div>")
                    .addClass(Focalize.slideConfigData(slideIdx).contentLayerCSSClass);
    
    var $contentTextAreaDiv = $("<div></div>")
                            .addClass(Focalize.slideConfigData(slideIdx).contentTextAreaCSSClass);
    
    var $h2h3h4 = Focalize.$slides[Focalize.numSlides].find("h2,h3,h4")
      .addClass(Focalize.slideConfigData(slideIdx).cssClass);
    
    var numRows = $h2h3h4.length;
    
    for (var i = 0; i < numRows; i++) {
      var $bulletPointDiv = $("<div></div>")
        .css({
          position: "absolute",
          top: i*100/numRows+"%",   
          left: 0,     
          width: "100%",      
          height: (100/numRows)-4+"%",
          overflow: "hidden",
          "z-index": 201,
          background: "transparent",  
        });
      $bulletPointDiv.append($h2h3h4.eq(i));
      $contentTextAreaDiv.append($bulletPointDiv);
    }
    
    // Could I use a layout plugin? My first tests with jLayout have
    // not been very successful, and my needs do not seem complex...
    
    
    $contentDiv.append($contentTextAreaDiv);
    return $contentDiv;  
  }; 
  
  /**
   * Show slide with index newSlideIdx. The exact behaviour will depend
   * on if there is a change of sequence, and if it is a "next" or "previous"
   * slide, or a different one
   * @param newSlideIdx 
   */
  Focalize.displaySlide = function(newSlideIdx) {    
    if (newSlideIdx < 0 || newSlideIdx > (Focalize.numSlides - 1)) {
      // The slide newSlideIdx does not exist. Do nothing.
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
    // "destroying" the originals (allowing thus to return to
    // any previous slide in its "start" state)
    var $slideToDisplay = Focalize.$slideDivs[newSlideIdx].clone();
    
    $slideToDisplay.addClass("slideToDisplay");    
    var $slideToRemove = $(".slideToDisplay");    
    
    
    var addSlideToDisplay = function() {      
      $(".seqToDisplay").append($slideToDisplay);
      
      $("."+Focalize.slideConfigData(newSlideIdx).cssClass)
        .jSlabify({fixedHeight:true, constrainHeight: true, 
                   hCenter: true, vCenter: true,                                                
                   maxWordSpace: 0.9,
                   maxLetterSpace: 1.2 });
      /* maxWordSpace defaults to 3 and maxLetterSpace defaults to 1.5, 
       * and I think that is too much, at least for
       * the titles. Maybe this could be configured in the style json file.
       * However, I can't tweak it very well: it always seems too much or too little...
       */
      
      // I have also briefly tried FitText, BigText and SlabText.
      // Neither of them takes into consideration 
      // vertical space, so they do not seem to offer
      // anything better for my needs than jSlabify.

      removeCurrentSlide();      
    };
    
    var removeCurrentSlide = function() {
      $slideToRemove.remove();      
    };
 
    
    if ($slideToRemove.length === 0) {
      // In first slide...
      addSlideToDisplay(); 
    } else { 

     
      var ahalf = Math.floor($("html").width()/2);
      var seqConfigData = Focalize.seqConfigData(newSeqIdx);
      
      if (nextSlideInSeq) {
        for (var i = 0; i < seqConfigData.backgroundLayers.length; i++) {
          $(".backToScroll"+i).transition({ x: "-="+
                                Math.floor($("html").width()*
                                 seqConfigData.backgroundLayers[i].scrollSpeed)
                                +"px" }, "slow");
        }  
         
        /*$scrollingBack.transition({ x: "-="+$("html").width()/4+"px" }, "slow", function() {
          $scrollingBack.spStart();
        });*/       
        
        $slideToRemove.css({position : "absolute", width : "100%"})
                      .transition({ x: "-="+$("html").width()+"px" }, "slow", addSlideToDisplay);        
      } else if (prevSlideInSeq) {       
        for (var i = 0; i < seqConfigData.backgroundLayers.length; i++) {
          $(".backToScroll"+i).transition({ x: "+="+
                                Math.floor($("html").width()*
                                 seqConfigData.backgroundLayers[i].scrollSpeed)
                                +"px" }, "slow");
        }  
                
        /*$scrollingBack.transition({ x: "+="+$("html").width()/4+"px" }, "slow", function() {
          $scrollingBack.spStart();
        });*/

        $slideToRemove.css({position : "absolute", width : "100%"})
        .transition({ x: "+="+$("html").width()+"px" }, "slow", addSlideToDisplay);
      } else { // IS A NEW SEQUENCE        
      }
    }
    
    
    Focalize.currSlideIdx = newSlideIdx;
    Focalize.currSeqIdx = newSeqIdx;
  };
  
  Focalize.presentationHandler = function(event) {
    var newSlideIdx = Focalize.currSlideIdx;    
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
    var $allSeqs = $(".focalize-sequence");
    
    Focalize.$slides = [];
    Focalize.numSlides = 0;
    Focalize.seqChanges = []; // indexes of the slides that start a new sequence
    Focalize.numSeqs = $allSeqs.size();
    Focalize.$seqs = [];
    Focalize.seqNames = [];
    Focalize.seqNumSlides = []; // number of slides in each sequence
    // Only for the first slide, current slide and seq are -1
    Focalize.currSlideIdx = -1;
    Focalize.currSeqIdx = -1;
    
    Focalize.$slideDivs = [];
    
    for (var i = 0; i < Focalize.numSeqs; i++) {
      var $currSeq = $(".focalize-sequence").eq(i);
      var $currSeqSlides = $currSeq.find(".focalize-slide");
      Focalize.$seqs[i] = $currSeq;
      Focalize.seqNames[i] = $currSeq.data('seq-name');      
      Focalize.seqChanges[i] = Focalize.numSlides;
      Focalize.seqNumSlides[i] = $currSeqSlides.length;
      for (var j = 0; j < $currSeqSlides.size(); j++) {
        Focalize.$slides[Focalize.numSlides] = $currSeq.find(".focalize-slide").eq(j);
        Focalize.slideNames[Focalize.numSlides] = Focalize.$slides[Focalize.numSlides].data('slide-name');  
        
        var $titleH1 = Focalize.$slides[Focalize.numSlides].find("h1")
                        .addClass(Focalize.slideConfigData(Focalize.numSlides).cssClass);              
        var $titleDiv = Focalize.$createTitleDiv($titleH1, Focalize.numSlides);        
        var $slideChildren = $titleDiv;
        
        //Focalize.$slides[Focalize.numSlides].find("ul,li")
        //                  .addClass(Focalize.slideConfigData(Focalize.numSlides).cssClass);        
        // This takes the first ul in the current slid and makes a deep copy (that
        // includes every children). without the clone() this does not keep the
        // children, only the ul itself seems to be selected. That is the reason why
        // this clone is not need with elements without children, like the H1
        // I DO NOT UNDERSTAND THIS VERY WELL...
        //var $contentUL = Focalize.$slides[Focalize.numSlides].find("ul").eq(0).clone();
        
        
        var $contentDiv = Focalize.$createContentDiv(Focalize.numSlides);        
        
        
        $slideChildren = $slideChildren.add($contentDiv);
        
        //var $slideChildren23 = Focalize.$slides[Focalize.numSlides].find("h2,h3").addClass("simple-city-seq1-slide1");        

        Focalize.$slideDivs[Focalize.numSlides] = Focalize.$createSlideDiv($slideChildren, i);        
        Focalize.numSlides += 1;
      }     
    }
    
    
    // Display first slide to start the "presentation loop"
    Focalize.displaySlide(0);
    
    $(document).keyup(Focalize.presentationHandler);
    
    
    // QUICK PHYSICX2D TEST... 
    
    //$.physix2d.init();
    //$("h1,h2,h3").physix2d_ToBody();
    //$.physix2d.simulate();
    
 
  };
  

  return Focalize;
}());
