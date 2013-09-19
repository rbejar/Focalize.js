/*
    Focalize.js - Dynamic HTML5 presentations
    Copyright (C) 2013 Rubén Béjar {http://www.rubenbejar.com/}

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see {http://www.gnu.org/licenses/}.
 */

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
  
  /**
   * Used to start the presentation from a style JSON file. As this
   * causes trouble with Chrome/ium on local files (a common use
   * case) this should not be used. I am keeping it just as a
   * reference and a reminder, but I show it as deprecated
   * @param styleJSON_URL
   * @deprecated
   */
  Focalize.loadPresentation = function(styleJSON_URL) {
    // I can't put this code inside the start function because
    // if I try to call fullScreen inside the getJSON callback
    // (to make sure the JSON is loaded before creating anything)
    // the browser says fullScreen has not been called in a
    // function triggered by a user event
    
    $(document).ready(function(){
    // This code is just to prevent Firefox from reporting a not 
    // well formedJSON file, even when the JSON is OK.
    $.ajaxSetup({beforeSend: function(xhr){
      if (xhr.overrideMimeType) {
        xhr.overrideMimeType("application/json");
      }
    }});

    // This does not work in Chromium, as its default policy is not
    // allowing AJAX request on local files. I haven't found a good solution
    $.getJSON(styleJSON_URL, function(data) {
      Focalize.styleConfiguration = data;
      // And after the JSON file is loaded, we actually allow the user
      // to load the presentation
      Focalize.load();
    });
    });
  };
  
  Focalize.load = function() {      
    $(document).ready(function(){
      $("body").append("<button id='view-fullscreen' onclick='Focalize.start()'>Click me to start your full screen presentation!</button>");
    });
  };
  
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
     * Chromium, but it is far better than nothing, and seems to work reasonably fine
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
  
  
  Focalize.layoutContent = function(slideIdx, content) {
    
    // Content is an array, because order does matter
    //var content = [
    //{
    //  type: "h2", /* h2, h3, h4, p, ... THINK ABOUT THIS */
    //  $element: {}, /* jQuery object */      
    //}                   
    //];
    
    var $bulletPointDiv = null;
    var $contentBulletPoints = $();
    
    var numRows = content.length;
    // CHECK MAGIC NUMBERS IN THE CODE...
    for (var i = 0; i < numRows; i++) {
      $bulletPointDiv = $("<div></div>")
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
      $bulletPointDiv.append(content[i].$element
                              .addClass(Focalize.slideConfigData(slideIdx).cssClass));
      $contentBulletPoints = $contentBulletPoints.add($bulletPointDiv);
    }
    

    
    return $contentBulletPoints;
    
    
  };
  
  Focalize.$createContentDiv = function(slideIdx) {
    var $contentDiv = $("<div></div>")
                    .addClass(Focalize.slideConfigData(slideIdx).contentLayerCSSClass);
    var $contentTextAreaDiv = $("<div></div>")
                            .addClass(Focalize.slideConfigData(slideIdx).contentTextAreaCSSClass);
    
    var content = [];
    
    var $h2 = Focalize.$slides[Focalize.numSlides].find("h2");
    var numH2 = $h2.length;    
    for (var i = 0; i < numH2; i++) {
      content[i] = {};
      content[i].type = "h2";
      content[i].$element = $h2.eq(i);      
    }
    
    var $contentContents = Focalize.layoutContent(slideIdx, content);
    $contentTextAreaDiv.append($contentContents);
    
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
      removeCurrentSlide();    
      
      $(".seqToDisplay").append($slideToDisplay);
      
      /*$("."+Focalize.slideConfigData(newSlideIdx).cssClass)
        .jSlabify({fixedHeight:true, constrainHeight: true, 
                   hCenter: true, vCenter: true,                                                
                   maxWordSpace: 0.9,
                   maxLetterSpace: 1.2 });*/
      /* maxWordSpace defaults to 3 and maxLetterSpace defaults to 1.5, 
       * and I think that is too much, at least for
       * the titles. Maybe this could be configured in the style json file.
       * However, I can't tweak it very well: it always seems too much or too little...
       */
      
      // I have also briefly tried FitText, BigText and SlabText.
      // Neither of them takes into consideration 
      // vertical space, so they do not seem to offer
      // anything better for my needs than jSlabify.
      
      // RESPONSIVE MEASURE must be applied to selectors that include a single element
      //$("h1").
      //  responsiveMeasure({
        // Variables you can pass in:
        /*idealLineLength: (defaults to 66),
        minimumFontSize: (defaults to 16),
        maximumFontSize: (defaults to 300),
        ratio: (defaults to 4/3)*/
      //})
      
      // PARECE QUE EL QUE MÁS ME GUSTA ES ESTE (HACE LO
      // MISMO QUE JSLABIFY, INCLUYENDO ADAPTARSE A ANCHO Y ALTO
      // PERO EL RESULTADO ME GUSTA MÁS (PERO DESDE LUEGO DISTA
      // MUCHO DE SER PERFECTO PARA LO QUE BUSCO. POR EJEMPLO
      // ES CAPAZ DE DEJAR UNA PALABRA SUELTA EN UNA LÍNEA DESPUÉS
      // DE HABER LLENADO LA ANTERIOR)
      textFit($("h1"));
      textFit($("h2"));
      
      // Tras aplicar el textFit a los H2, ver cual tiene
      // el font-size menor, y aplicárselo a todos, para que todos
      // tengan el mismo tamaño...
      
      var $h2textFitSpan = $("h2 > .textFitted");      
      var min = Number.MAX_VALUE;
      var currSize;
      for (var i = 0; i < $h2textFitSpan.length; i++) {
        currSize = parseFloat($h2textFitSpan.eq(i).css("font-size")); 
        if (currSize < min) {
          min = currSize;
        }      
      }
      $h2textFitSpan.css({"font-size":min+"px"});
      

 
    };
    
    var removeCurrentSlide = function() {
      $slideToRemove.remove();      
    };
 
    
    if ($slideToRemove.length === 0) {
      // In first slide...
      addSlideToDisplay(); 
    } else { 

     
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
