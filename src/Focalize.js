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

function FocalizeModule() {
  var Focalize = {};
  
  //var privateVariable = 1;

  //function privateMethod() {
    // ...
  //}

  Focalize.currSlideIdx = 0;
  Focalize.currSeqIdx = 0;
  Focalize.$slides = [];
  Focalize.numSlides = 0;
  Focalize.seqChanges = [];
  Focalize.numSeqs = 0;
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
      $("body").append("<h1 class='remove-before-start' " +
      		             "style='position: fixed; margin: 0 auto; top: 0; left:0; right: 0;'>This is a <a href='https://github.com/rbejar/Focalize.js' target='_blank'>Focalize.js</a> presentation</h1>");      
      $("body").append("<button class='remove-before-start' " +
      		              "style='position: fixed; margin:0 auto; top:15%; left:0; right:0; width:40%; height:25%;' " +
      		              "onclick='Focalize.fullScreenStart()'>" +
      		              "<h2>Start full screen presentation</h2></button>");
      $("body").append("<button class='remove-before-start' " +
          "style='position: fixed; margin:0 auto; bottom: 5%; left:0; right:0; width: 40%; height:25%;' " +
          "onclick='Focalize.notFullScreenStart()'>" +
          "<h2>Start presentation (not full screen)</h2></button>");
    });
  };
  
  /**
   * Returns the index of the sequence that contains the slide slideIdx
   * (slide indexes start at 0)
   * @param slideIdx
   */
  Focalize.seqOfSlide = function(slideIdx) {
    var i;
    for (i = 1; i < Focalize.seqChanges.length; i++) {
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
    var i;
    for (i = 0; i < Focalize.styleConfiguration.sequences.length; i++) {
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
    var i;
    for (i = 0; i < Focalize.styleConfiguration.slides.length; i++) {      
      if (Focalize.styleConfiguration.slides[i].name === Focalize.slideNames[slideIdx]) {
        return Focalize.styleConfiguration.slides[i];
      }
    }
    throw "Slide configuration data not found for slideIdx " + slideIdx;
    return null;
  };
  
  Focalize.fullScreenStart = function () {   
    $(document).ready(function(){
      // Go to full screen
      $(document).fullScreen(true);
      $(document).bind("fullscreenchange", function() {
        if ($(document).fullScreen()) {       
          $('.remove-before-start').remove();         
          
          // CREO QUE SIMPLEMENTE RETRASANDO LA LLAMADA A START HASTA
          // QUE EL BOTTON HA SIDO EFECTIVAMENTE ELIMINADO HARÁ QUE
          // SE COJA EL TAMAÑO FULL SCREEN SIN MÁRGENES. PARECE
          // QUE SI NO, EL NAVEGADOR ESTÁ TODAVÍA "RECOLOCÁNDOSE" Y
          // PUEDEN SALIR MÁRGENES INDESEADOS...
          
            // CON ESTA PAUSA DE 2 SEGUNDOS A PIÑÓN VA BIEN, PERO SERÍA MEJOR
          // QUE ESTO FUERA POR EVENTO...
          setTimeout(Focalize.startPresentation, 2000);
        } else {
          // Si salimos de full screen, de momento no hago nada
            // Debería poner la presentación en un estado "continuable" o bien
          // "resetearla" y explicar al usuario lo que puede hacer
        }    
      });  
    });
  };
  
  Focalize.notFullScreenStart = function () {   
    $(document).ready(function(){
      $('.remove-before-start').remove();         
          
          // CREO QUE SIMPLEMENTE RETRASANDO LA LLAMADA A START HASTA
          // QUE EL BOTTON HA SIDO EFECTIVAMENTE ELIMINADO HARÁ QUE
          // SE COJA EL TAMAÑO FULL SCREEN SIN MÁRGENES. PARECE
          // QUE SI NO, EL NAVEGADOR ESTÁ TODAVÍA "RECOLOCÁNDOSE" Y
          // PUEDEN SALIR MÁRGENES INDESEADOS...
          
            // CON ESTA PAUSA DE 2 SEGUNDOS A PIÑÓN VA BIEN, PERO SERÍA MEJOR
          // QUE ESTO FUERA POR EVENTO...
          setTimeout(Focalize.startPresentation, 2000); 
    });
  };
  
  /**
   * Attach event handlers to the presentation. Only those related
   * to user input (moving between slides etc.)
   */
  Focalize.attachEventHandlers = function() {    
    $(document).keyup(Focalize.keyPresentationHandler);
    // click event does not get right click in Chromium; mousedown gets left
    // and right clicks properly in both Firefox and Chromium
    $(document).mousedown(Focalize.mousePresentationHandler);
    // Swipes are not working yet...
    /*$(document).hammer().on("swipeleft", function(ev) {
      ev.gesture.preventDefault(); // Prevent standard scrolling behaviour
      Focalize.nextSlide();
      ev.stopPropagation();
    });
    $(document).hammer().on("swiperight", function(ev) {
      ev.gesture.preventDefault(); // Prevent standard scrolling behaviour
      Focalize.previouSlide();
      ev.stopPropagation();
    });*/  
  };
  
  /**
   * Detach event handlers from the presentation. Only those related
   * to user input (moving between slides etc.)
   */
  Focalize.detachEventHandlers = function() {
    $(document).unbind("keyup");
    $(document).unbind("mousedown");
    
    // Detach hammer gestures...
  };
  
  /**
   * Creates background and other elements common for a sequence of slides
   * @param seqIdx Which sequence? 
   */
  Focalize.$createSeqDiv = function(seqIdx) {
    var i;
    var seqConfigData = Focalize.seqConfigData(seqIdx);    
    
    //var seqWidthPx = Focalize.seqNumSlides[currSeqIdx] * $("html").width();
    var seqWidthPercent = Focalize.seqNumSlides[seqIdx]*100;  
    
    var $seqDiv = $("<div></div>").addClass("seqToDisplay " + seqConfigData.containerCSSClass);
    
    var $backgroundDiv = $("<div></div>").addClass("backgroundDiv");
    
    var $backLayerDiv;
    
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
    for (i = 0; i < seqConfigData.backgroundLayers.length; i++) {
      $backLayerDiv =  $("<div></div>").addClass(seqConfigData.backgroundLayers[i].cssClass
                                                     +" backToScroll"+i)
      .css({width: seqWidthPercent+"%",
        "background-size":seqConfigData.backgroundLayers[i].pagesWide*100/Focalize.seqNumSlides[seqIdx]+"% 100%"});
      $backgroundDiv.append($backLayerDiv);
    }
        
   
    for (i = 0; i < seqConfigData.animatedBackgroundLayers.length; i++) {
      $backLayerDiv =  $("<div></div>").addClass(seqConfigData.animatedBackgroundLayers[i].cssClass
                                                     +" backToScroll"+i+" backToPan"+i)
        .css({width: seqWidthPercent+"%",
        "background-size":seqConfigData.animatedBackgroundLayers[i].pagesWide*100/Focalize.seqNumSlides[seqIdx]+"% 100%"});        
      $backgroundDiv.append($backLayerDiv);
    }
    
    $seqDiv.append($backgroundDiv);
          
    return $seqDiv;
  };
  
  Focalize.$createSlideDiv = function($slideChildren, seqIdx) {
    var $slideDiv = $("<div></div>")
                    .addClass(Focalize.seqConfigData(seqIdx).slideCommonsCSSClass);
    $slideDiv.append($slideChildren);
    return $slideDiv;
  };
  
  /**
   * Creates and returns a div for the title of the slide. It may
   * be an empty div if the slide has no title (i.e. if its
   * titleLayerCSSClass is an empty string).
   */
  Focalize.$createTitleDiv = function($titleContents, slideIdx) {
    var $titleDiv;
    var $titleTextAreaDiv;
    if (Focalize.slideConfigData(slideIdx).titleLayerCSSClass !== "") {
      $titleDiv = $("<div></div>")
                    .addClass(Focalize.slideConfigData(slideIdx).titleLayerCSSClass);       
      $titleTextAreaDiv = $("<div></div>")
                            .addClass(Focalize.slideConfigData(slideIdx).titleTextAreaCSSClass);    
      $titleTextAreaDiv.append($titleContents);
      $titleDiv.append($titleTextAreaDiv);     
    } else { // No title
      $titleDiv = $("<div></div>"); 
    } 
    
    return $titleDiv;  
  };

  /**
   * Lays out certain content (i.e. certain allowed HTML elements)
   * in a div.
   * 
   * @param slideIdx Index of the slide which content we are laying out
   * @param content An array of objects (order is important). Example:
   * [{type: "H2", // must be uppercase 
   *    $element: a jQueryObject},
   *  {type: "H3",
   *    $element: a jQueryObject}...];
   * @param $contentDiv a jQueryObject with a div where the content will be appended
   * @returns $contentDiv with content properly laid out and appended
   */
  Focalize.layoutContent = function(slideIdx, content, $contentDiv) {
    var $contentElementDivs = [];
    var $allContentElements = $();
    
    var numElements = content.length;
    if (numElements <= 0) {
      return $contentDiv;
    }
    
    // If we actually have elements to lay out... 

    // Returns the layout type to use depending on the elements in content array
    var chooseLayoutType = function() {
      // 0: layout undefined for the current content
      // 1: every element is h2, h3 or h4, more than one element
      // 2: a single element, of type h2, h3 or h4
      // 3: a single img
      // 4: a single img along with a single figcaption (I assume they are enclosed
      //    in a figure element, but I do not take that into account)
      // ...      
      
      var i;
      
      if (numElements <= 0) {
        return 0;
      }

      var numOfEachElement = {
          H2:0,H3:0,H4:0,IMG:0,FIGURE:0,
          FIGCAPTION:0, UNSUPPORTED:0
      };
      var elementTypeArray = [];
     
      var currentTag = "";
      for (i = 0; i < numElements; i++) {
        currentTag = content[i].type.toUpperCase();  // toUpperCase, just in case ;-)        
        switch (currentTag) {
          case "H2":          
          case "H3":
          case "H4":
          case "IMG":  
          case "FIGCAPTION":
            elementTypeArray[i] = currentTag;            
            numOfEachElement[currentTag] += 1;
            break;          
          default:
            elementTypeArray[i] = "UNSUPPORTED";
            numOfEachElement["UNSUPPORTED"] += 1;
            break;
        }         
      }
      
      var numH2H3H4 = numOfEachElement["H2"] +
                      numOfEachElement["H3"] +
                      numOfEachElement["H4"];
      
      if (numOfEachElement["UNSUPPORTED"] > 0) {
        return {layoutType:0, elementArray: elementTypeArray};
      } else if (numH2H3H4 === 1 && numOfEachElement["IMG"] === 0) {
        return {layoutType:2, elementArray: elementTypeArray};
      } else if (numH2H3H4 > 1 && numOfEachElement["IMG"] === 0) {
        return {layoutType:1, elementArray: elementTypeArray};
      } else if (numH2H3H4 === 0 && numOfEachElement["IMG"] === 1 &&
                 numOfEachElement["FIGCAPTION"] === 0) {
        return {layoutType:3, elementArray: elementTypeArray};
      } else if (numOfEachElement["FIGCAPTION"]===1 && numOfEachElement["IMG"] === 1) {
        return {layoutType:4, elementArray: elementTypeArray};
      } else {
        return {layoutType:0, elementArray: elementTypeArray};
      }     
    };    
    
    /**
     * Each layoutFunction takes an elementArray (an array of HTML tag names
     * as strings in upperCase) and a content (the same content array received
     * by Focalize.layoutContent) and returns an array of divs with those elements
     * laid out somehow (ever function is specialized in a layout for
     * certain elements; if the wrong elements are include in the elementArray,
     * the result is unpredictable, and possibly very wrong.
     * As a guideline, the returned divs should be absolute positioned, with sizes
     * in percentages if needed, and with a z-index right for the style (e.g.
     * the same z-index as the foreground area for the contents.) 
     * These divs will be added (in order) to the content div for the slide.
     */
    var layoutFunctions = [];
    
    // Layout function 0: No layout available. Show an error instead of the content
    layoutFunctions[0] = function(elementArray, content) {
      var $contentElementDivs = [];
      
      $contentElementDivs[0] = $("<div></div>");
      $contentElementDivs[0].append($("<h2>NO LAYOUT AVAILABLE FOR THIS SLIDE. CHECK ITS CONTENTS.</h2>")          
        .css({
          position: "absolute",
          top: 0,   
          left: 0,     
          width: "100%",      
          height: "100%",
          overflow: "hidden",
          color: "red",
          "z-index": 200000,
          background: "transparent"  
        }));

      return $contentElementDivs;
    };
    
    // Layout function 1: all elements are h2, h3, h4 (show like an unordered list)
    layoutFunctions[1] = function(elementArray, content) {
      var i;
      var $contentElementDivs = [];
      
      // elementWeights are relative to each other
      var elementWeights = {"H2": 1,
                            "H3": 0.75,
                            "H4": 0.6};  
      // elementIndents are in percentage of the available width
      var elementIndents = {"H2": 0,
                            "H3": 3,
                            "H4": 6};
      
      var totalRelativeHeight = 0;
      var numElements = elementArray.length;
      if (numElements === 0) {
        return;
      }      
      
      for (i = 0; i < numElements; i++) {
        totalRelativeHeight += elementWeights[elementArray[i]];
      }  
      
      var numberOfGaps = numElements - 1;
      var gapSize = 2; /*Percentage*/
      var totalPercentHeight = 100 - (gapSize * numberOfGaps);
      
      var currentElementHeight;
      var currentElementTop = 0;
      for (i = 0; i < numElements; i++) {     
        currentElementHeight = (elementWeights[elementArray[i]] / totalRelativeHeight) 
                               * totalPercentHeight;        
        $contentElementDivs[i] = $("<div></div>")
          .css({
            position: "absolute",
            top: currentElementTop+"%",   
            left: (0 + elementIndents[elementArray[i]])+"%",     
            right: 0,                   
            height: currentElementHeight+"%",
            overflow: "visible",
            "z-index": 201,
            background: "transparent",  
          });        
        $contentElementDivs[i].append(content[i].$element
                                .addClass(Focalize.slideConfigData(slideIdx).cssClass)
                                .css({"text-align":"left"}));
        currentElementTop = currentElementTop + currentElementHeight + gapSize;
      }   
      return $contentElementDivs;     
    };
    
    // Layout function 2: a single element H2, H3 or H4
    layoutFunctions[2] = function(elementArray, content) {
      var $contentElementDivs = [];
      
      $contentElementDivs[0] = $("<div></div>").addClass("simple-city-layout-single-h");               
      $contentElementDivs[0].append(content[0].$element
                                  .addClass(Focalize.slideConfigData(slideIdx).cssClass))
                                  .css({"text-align":"center"});
      return $contentElementDivs;
    };
    
    // Layout function 3: a single element img
    layoutFunctions[3] = function(elementArray, content) {
      var $contentElementDivs = [];
      $contentElementDivs[0] = $("<div></div>").addClass("simple-city-layout-single-img");                
      
      // Image centered, takes all availabe height while keeping
      // aspect ratio. This seems a sensible choice as long as the 
      // presentation is in landscape, as should be on any desktop
      // screen. For smarthpones or tablets, if they are held
      // in portrait, this could lead to images which are not 
      // entirely shown (fill 100% vertical space, and keep aspect
      // ratio, may mean that the whole picture is not shown). Landscape 
      // should be used in mobile devices anyway.
      // The display block + margins are necessary for the centering
      $contentElementDivs[0].append(content[0].$element
                                  .addClass(Focalize.slideConfigData(slideIdx).cssClass + 
                                            " simple-city-layout-single-img"));
      
      return $contentElementDivs;
    };
    
    // Layout function 4: a single element img with a figcaption. If the
    // figcaption comes first, it will be on top of the img. Otherwise,
    // at the bottom
    layoutFunctions[4] = function(elementArray, content) {      
      var $contentElementDivs = [];
      var theFigCaption;
      var theImg;
      var aspectRatio;
      
      if (content[0].type === "IMG") { // Image on top
        theImg = content[0];
        theFigCaption = content[1];        
        // Image
        $contentElementDivs[0] = $("<div></div>").addClass("simple-city-layout-img-figcaption")
          .css({top:0,left:0,right:0, bottom:"15%"});                 
        // I use the same CSS style for the img than in the layout with single img
        $contentElementDivs[0].append(theImg.$element
          .addClass(Focalize.slideConfigData(slideIdx).cssClass + 
                      " simple-city-layout-single-img"));                               
        // FigCaption
        $contentElementDivs[1] = $("<div></div>").addClass("simple-city-layout-img-figcaption")
          .css({top:"86%",left:0,right:0,bottom:0});                 
        $contentElementDivs[1].append(theFigCaption.$element
          .addClass(Focalize.slideConfigData(slideIdx).cssClass).css({"text-align":"center"}));                              
        
      } else { // Caption on top
        theImg = content[1];
        theFigCaption = content[0];

        // FigCaption
        $contentElementDivs[0] = $("<div></div>").addClass("simple-city-layout-img-figcaption")
          .css({top:0,left:0,right:0,bottom:"86%"});                 
        $contentElementDivs[0].append(theFigCaption.$element
          .addClass(Focalize.slideConfigData(slideIdx).cssClass).css({"text-align":"center"}));
        
        // Image
        $contentElementDivs[1] = $("<div></div>").addClass("simple-city-layout-img-figcaption")
          .css({top:"15%",left:0,right:0, bottom:0});                 
        // I use the same CSS style for the img than in the layout with single img
        $contentElementDivs[1].append(theImg.$element
          .addClass(Focalize.slideConfigData(slideIdx).cssClass + 
                      " simple-city-layout-single-img"));                               
      }
      
      return $contentElementDivs;
    };
    
    var chosenLayout = chooseLayoutType();
    $contentElementDivs = layoutFunctions[chosenLayout.layoutType](chosenLayout.elementArray, 
                                                                   content);
    
    for (i = 0; i < $contentElementDivs.length; i++) {
      $allContentElements = $allContentElements.add($contentElementDivs[i]);  
    }
       
    return $contentDiv.append($allContentElements);
  };
  
  /**
   * Fit texts, images etc. to their calculated divs.
   * Must be called after the $slideToDisplay has been appended
   * to its final div, so the sizes are right and the
   * fitting may work properly
   */
  Focalize.adjustContents = function($slideToDisplay) {
    // 200 as maxFontSize means: make it as big as it gets
    // alignHoriz: true is not working for me in Firefox (though it does in Chromium)
    textFit($slideToDisplay.find("h1"), {alignVert: true, minFontSize: 5, maxFontSize: 200});
    textFit($slideToDisplay.find("h2,h3,h4"),{alignVert: true, minFontSize: 5, maxFontSize: 200});
    textFit($slideToDisplay.find("figCaption"),{alignVert: true, minFontSize: 5, maxFontSize: 200});
    
    // Tras aplicar el textFit a los elementos, ver cual tiene
    // el font-size menor en cada categoría, y aplicárselo a todos, para que todos
    // tengan el mismo tamaño dentro de una misma categoría      
    var minimumSize = function (elementType, currentMin) {
      var i;
      var $textFitSpan = $(elementType + " > .textFitted");
      var min = currentMin;
      var currSize;
      for (i = 0; i < $textFitSpan.length; i++) {
        currSize = parseFloat($textFitSpan.eq(i).css("font-size")); 
        if (currSize < min) {
          min = currSize;
        }      
      }

      // If min is "too big" it will not be very different from
      // the previous elements, so we force it to be smaller.
      // 0.15 is a magic number. Should be a style decision
      if (min > Math.floor(currentMin - 0.15 * currentMin)) {
        min = Math.floor(currentMin - 0.15 * currentMin);
      }
      // We never allow the minimum font size below 5
      // (magic number, seems minimum enough)
      if (min < 5) {
        min = 5;
      }
      $textFitSpan.css({"font-size":min+"px"});  
      return min;
    };
    
    // Llamamos en orden y así cada elemento será menor que el 
    // de la categoría anterior
    var currentMin = Number.MAX_VALUE;
    currentMin = minimumSize("h2", currentMin);
    currentMin = minimumSize("h3", currentMin);
    currentMin = minimumSize("h4", currentMin);  
    
    /* Alternatives to fitText that I've tried with
     * worse results.
     */
    
//    $("."+Focalize.slideConfigData(newSlideIdx).cssClass)
//    .jSlabify({fixedHeight:true, constrainHeight: true, 
//               hCenter: true, vCenter: true,                                                
//               maxWordSpace: 0.9,
//               maxLetterSpace: 1.2 });
//     maxWordSpace defaults to 3 and maxLetterSpace defaults to 1.5, 
//      and I think that is too much, at least for
//      the titles. Maybe this could be configured in the style json file.
//        However, I can't tweak it very well: it always seems too much or too little...
       
  // I have also briefly tried FitText, BigText and SlabText.
  // Neither of them takes into consideration 
  // vertical space, so they do not seem to offer
  // anything better for my needs than jSlabify.
  
  // RESPONSIVE MEASURE must be applied to selectors that include a single element
  //$("h1").
  //  responsiveMeasure({
    // Variables you can pass in:
//    idealLineLength: (defaults to 66),
//    minimumFontSize: (defaults to 16),
//    maximumFontSize: (defaults to 300),
//    ratio: (defaults to 4/3)
  //})
  
  // PARECE QUE EL QUE MÁS ME GUSTA ES texFit (HACE LO
  // MISMO QUE JSLABIFY, INCLUYENDO ADAPTARSE A ANCHO Y ALTO
  // PERO EL RESULTADO ME GUSTA MÁS (PERO DESDE LUEGO DISTA
  // MUCHO DE SER PERFECTO PARA LO QUE BUSCO. POR EJEMPLO
  // ES CAPAZ DE DEJAR UNA PALABRA SUELTA EN UNA LÍNEA DESPUÉS
  // DE HABER LLENADO LA ANTERIOR)

  };
  
  
  Focalize.$createContentDiv = function(slideIdx) {
    var i;
    var $contentDiv = $("<div></div>")
                    .addClass(Focalize.slideConfigData(slideIdx).contentLayerCSSClass);
    var $contentTextAreaDiv = $("<div></div>")
                            .addClass(Focalize.slideConfigData(slideIdx).contentTextAreaCSSClass);
    
    var $currElem;
    var content = [];
    
    // I am not interested in figure elements, I will assume they
    // are there; I want imgs and figcaptions
    var $validContentElements = Focalize.$slides[Focalize.numSlides].find("h2,h3,h4,img,figcaption");
    
    for (i = 0; i < $validContentElements.length; i++) {
      $currElem = $validContentElements.eq(i);  
      content[i] = {};
      content[i].type = $currElem.get(0).tagName.toUpperCase(); // toUpperCase, just in case... ;-)
      content[i].$element = $currElem;      
    }
    $contentTextAreaDiv = Focalize.layoutContent(slideIdx, content, $contentTextAreaDiv);    
    
    // Could I use a layout plugin? My first tests with jLayout have
    // not been very successful, and my needs do not seem complex...
    
    $contentDiv.append($contentTextAreaDiv);
    return $contentDiv;  
  }; 
  
  /**
   * Show slide with index newSlideIdx. The exact behavior will depend
   * on if there is a change of sequence, and if it is a "next" or "previous"
   * slide, or a different one.
   * callBackFunction will be called (if present) after the new slide
   * has been appended to the page (not necessarily after everything is completely
   * adjusted and rendered) 
   * @param newSlideIdx 
   * @param callBackFunction 
   */
  Focalize.displaySlide = function(newSlideIdx, callBackFunction) {  
    if (newSlideIdx < 0 || newSlideIdx > (Focalize.numSlides - 1)) {
      // The slide newSlideIdx does not exist. Do nothing.
      if (callBackFunction)
        callBackFunction();
      return;
    }
    
    var i;
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
      
      // Animate the animated layers of the new sequence      
      var newSeqConfigData = Focalize.seqConfigData(newSeqIdx);
      for (i = 0; i < newSeqConfigData.animatedBackgroundLayers.length; i++) {
        // spritely scrolls fine with a width of 100%, but I need this width for the
        // "scroll transitions" between slides     
        $(".backToPan"+i).pan({fps: newSeqConfigData.animatedBackgroundLayers[i].framesPerSecond, 
                          speed: newSeqConfigData.animatedBackgroundLayers[i].panSpeed, dir: 'left'});
      }

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
      Focalize.adjustContents($slideToDisplay);
      if (callBackFunction)
        callBackFunction();
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
        for (i = 0; i < seqConfigData.backgroundLayers.length; i++) {
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
        for (i = 0; i < seqConfigData.backgroundLayers.length; i++) {
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
  
  Focalize.keyPresentationHandler = function(event) {        
    // console.log(event.which);
    // which is normalized among browsers, keyCode is not

    // The idea behind the detachEventHandlers() is to prevent a 
    // new event from being captured 
    // before the action triggered by this one is over    
    
    switch (event.which) {
      case 39: // right arrow
      case 40: // down arrow
      case 78: // n
      case 34: // page down
      case 13: // return
      case 32: // space        
        Focalize.detachEventHandlers();
        Focalize.nextSlide();
        event.preventDefault();
        event.stopPropagation();
        break;
      case 37: // left arrow
      case 38: // up arrow
      case 80: // p
      case 33 : // page up
      case 8: // backspace
        Focalize.detachEventHandlers();
        Focalize.previousSlide();
        event.preventDefault();
        event.stopPropagation();
        break;
      default:
        // Nothing. I have found it important not to interfere at all 
        // with keys I do not use.
    }
  };
  
  Focalize.mousePresentationHandler = function(event) {        
    // jQuery which is normalized among browsers
    
    // The idea behind the detachEventHandlers() is to prevent a 
    // new event from being captured 
    // before the action triggered by this one is over    
    
    switch (event.which) {
      case 1: // left button
        Focalize.detachEventHandlers();
        Focalize.nextSlide();
        event.preventDefault();
        event.stopPropagation();
        break;
      case 3: // right button
        Focalize.detachEventHandlers();
        Focalize.previousSlide();
        event.preventDefault();
        event.stopPropagation();
        break;
      default:
        // Nothing. I have found it important not to interfere at all 
        // with clicks I do not use.
    }   
  };
  
  Focalize.nextSlide = function() {
    var newSlideIdx = Focalize.currSlideIdx;      
    newSlideIdx = Focalize.currSlideIdx + 1;
    Focalize.displaySlide(newSlideIdx, Focalize.attachEventHandlers);
  };
  
  Focalize.previousSlide = function() {
    var newSlideIdx = Focalize.currSlideIdx;      
    newSlideIdx = Focalize.currSlideIdx - 1;
    Focalize.displaySlide(newSlideIdx, Focalize.attachEventHandlers); 
  };
  
  
  Focalize.startPresentation = function () {
    var i,j;     
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
    
    for (i = 0; i < Focalize.numSeqs; i++) {
      var $currSeq = $(".focalize-sequence").eq(i);
      var $currSeqSlides = $currSeq.find(".focalize-slide");
      Focalize.$seqs[i] = $currSeq;
      Focalize.seqNames[i] = $currSeq.data('seq-name');      
      Focalize.seqChanges[i] = Focalize.numSlides;
      Focalize.seqNumSlides[i] = $currSeqSlides.length;
      for (j = 0; j < $currSeqSlides.size(); j++) {
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
    
    // Disable right click menu just before starting 
    $(document).bind("contextmenu", function(event) {
      return false;
    });
    
    Focalize.attachEventHandlers();
    
    // Display first slide to start the "presentation loop"
    Focalize.displaySlide(0);
    
    
    
    
    // QUICK PHYSICX2D TEST... 
    
    //$.physix2d.init();
    //$("h1,h2,h3").physix2d_ToBody();
    //$.physix2d.simulate();
    
 
  };
  return Focalize;
};

var Focalize = FocalizeModule();