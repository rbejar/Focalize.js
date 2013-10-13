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
ExpectedValues.numSlides = 2;
ExpectedValues.seqOfSlides = [0 ,0];

// This way we start loading the presentation and wait
// for 2 seconds before starting the tests
QUnit.config.autostart = false;
Focalize.notFullScreenStart();
setTimeout(function() {
  QUnit.start();
}, 3000);


test("Presentation properly loaded", function() {
  deepEqual( Focalize.numSeqs, ExpectedValues.numSeqs);
  deepEqual( Focalize.numSlides, ExpectedValues.numSlides);   
  deepEqual( Focalize.seqOfSlide(0), ExpectedValues.seqOfSlides[0]);
  deepEqual( Focalize.seqOfSlide(1), ExpectedValues.seqOfSlides[1]);  
});



test("keys for next/prev slide", function() {
  $(document).trigger($.Event("keyup", {which: 39})); // right arrow
  deepEqual(Focalize.currSlideIdx, 1);
  // Keys are disabled until the slide has changed.
  // So we wait for a time before trying the left arrow
  stop();
  setTimeout(function() {
    $(document).trigger($.Event("keyup", {which: 37})); // left arrow
    deepEqual(Focalize.currSlideIdx, 0);
    start();     
  }, 2000);
});



/*
 Find out how to test full Screen...
 
test("In full screen", function() {
  ok($.fullscreen.isFullScreen());
});
*/