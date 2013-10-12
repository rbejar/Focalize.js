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


$(document).ready(function() {
  Focalize.startPresentation();  
});

/*
 Find out how to test full Screen...
 
test("In full screen", function() {
  ok($.fullscreen.isFullScreen());
});
*/

test("Number of sequences", function() {
  equal( Focalize.numSeqs, ExpectedValues.numSeqs);
});


test("Number of slides", function() {
  equal( Focalize.numSlides, ExpectedValues.numSlides);
});

test("Sequence of slides", function() {
  equal( Focalize.seqOfSlide(0), ExpectedValues.seqOfSlides[0]);
  equal( Focalize.seqOfSlide(1), ExpectedValues.seqOfSlides[1]);
});

