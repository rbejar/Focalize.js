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

// Expected values for the test. These must be updated as changes are
// made to the presentation used for testing
ExpectedValues = {};
ExpectedValues.numSeqs = 1;
ExpectedValues.numSlides = 7;
ExpectedValues.seqOfSlides = [];
ExpectedValues.seqOfSlides[0] = 0;
ExpectedValues.seqOfSlides[1] = 0;
ExpectedValues.slideTitleLayerCSSClasses = [];
ExpectedValues.slideTitleLayerCSSClasses[0] = "foreground-billboard";
ExpectedValues.slideTitleLayerCSSClasses[6] = "";


// Aux values for the test. You can change them for different
// contexts. This values imply that the tests are not deterministic,
// and they should, but for now I can't be sure of how long takes
// a slide to transition to the next etc., and I do not have another
// way (e.g. callbacks) to be sure that e.g. transitions have actually
// finished.
AuxValues = {};
AuxValues.waitInitSeconds = 3;
AuxValues.waitSlideChangeSeconds = 2;
AuxValues.waitThumbsDisplaySeconds = 2;
AuxValues.waitThumbsHideSeconds = 1;

// This way we start loading the presentation and wait
// for AuxValues.waitInitSeconds seconds before starting the tests
QUnit.config.autostart = false;
Focalize.notFullScreenStart();
setTimeout(function() {
  QUnit.start();
}, AuxValues.waitInitSeconds*1000);


test("Presentation properly loaded", function() {
  deepEqual( Focalize.numSeqs, ExpectedValues.numSeqs);
  deepEqual( Focalize.numSlides, ExpectedValues.numSlides);   
  deepEqual( Focalize.seqOfSlide(0), ExpectedValues.seqOfSlides[0]);
  deepEqual( Focalize.seqOfSlide(1), ExpectedValues.seqOfSlides[1]);  
});

test("Slide style data properly loaded and accessible", function(){
  deepEqual(Focalize.slideConfigData(0).titleLayerCSSClass, 
            ExpectedValues.slideTitleLayerCSSClasses[0]);  
  deepEqual(Focalize.slideConfigData(6).titleLayerCSSClass, 
            ExpectedValues.slideTitleLayerCSSClasses[6]);
  // If slideIdx out of range, it must throw an error
  throws(function() {Focalize.slideConfigData(-1);});
  throws(function() {Focalize.slideConfigData(ExpectedValues.numSlides);});
});

/*
 * This is a long test, but I need it to test sequential actions and I need
 * to wait for things to happen (e.g. transition between slides).
 * There is no way and no point to make this a number of separate
 * tests, as they will not be independent, and there is no way
 * to make Qunit execute tests in a given sequence if these
 * tests have to wait for each other to finish.
 * I need to use asyncTest and call start() at the end of the 
 * last test in order to prevent the "assertion outside test context"
 * exception. 
 * Maybe I should write some code to make this test pattern easier
 * to modify...
 */
asyncTest("Presentation works interactively", function() {
  // Key next, and key back
  $(document).trigger($.Event("keyup", {which: 39})); // right arrow
  deepEqual(Focalize.currSlideIdx, 1);
  // Keys are disabled until the slide has changed.
  // So we wait for a time before trying the left arrow  
  setTimeout(function() {
    $(document).trigger($.Event("keyup", {which: 37})); // left arrow
    deepEqual(Focalize.currSlideIdx, 0);
    // I need to wait for the slide transition to end before
    // the next test, or strange things happen (which couln't happen
    // in a real presentation as keys etc. are disabled during
    // transitions)
    setTimeout(function() {    
      goToSlideAndKeyBack();  
    }, AuxValues.waitSlideChangeSeconds * 1000);             
  }, AuxValues.waitSlideChangeSeconds * 1000);
  
  var goToSlideAndKeyBack = function() {
    // Go to slide with index 6
    Focalize.displaySlide(6, false);
    deepEqual(Focalize.currSlideIdx, 6);
    // And key back to 5
    setTimeout(function() {
      $(document).trigger($.Event("keyup", {which: 8})); // backspace
      deepEqual(Focalize.currSlideIdx, 5);
      // Again, wait for the back transition to finish
      // before the next test
      setTimeout(function() {    
        showHideThumbs();  
      }, AuxValues.waitSlideChangeSeconds * 1000);                    
    }, AuxValues.waitSlideChangeSeconds * 1000);
  };
  
  var showHideThumbs = function() {  
    Focalize.showThumbs();
    deepEqual(Focalize.status, Focalize.ValidStates.onThumbnails);
    setTimeout(function() {
      $(document).trigger($.Event("keyup", {which: 84})); // T
      deepEqual(Focalize.status, Focalize.ValidStates.onPresentation);
      setTimeout(function() {    
        chooseSlideOnThumbs();  
      }, AuxValues.waitThumbsHideSeconds * 1000);      
    }, AuxValues.waitThumbsDisplaySeconds*1000); 
  };
  
  var chooseSlideOnThumbs = function() {  
    Focalize.showThumbs();    
    setTimeout(function() {
      Focalize.thumbs.$divs[0][0].trigger($.Event("click"));
      deepEqual(Focalize.status, Focalize.ValidStates.onPresentation);
      deepEqual(Focalize.currSlideIdx, 0);
      start();
    }, AuxValues.waitThumbsDisplaySeconds*1000); 
  };
  
});




/*
 Find out how to test full Screen...
 
test("In full screen", function() {
  ok($.fullscreen.isFullScreen());
});
*/