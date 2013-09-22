/*
    Focalize.js - Dynamic HTML5 presentations
    simple-city-style.js - Simple presentation style for Focalize.js
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

/**
 * This js file must be included after Focalize.js
 * 
 * Image sizes in pixels. If SVG, size in pixels at 
 * 100 dpi. ScrollSpeed between 0 (no scroll) and 1 
 * (max speed).
 */
Focalize.styleConfiguration =
{     
  "styleName": "SimpleCity",  
  "sequences":[
    { "name": "SimpleCitySequence1",
      "containerCSSClass": "simple-city-seq1-container",
      "slideCommonsCSSClass" : "simple-city-seq1-slide",
      "backgroundLayers":[
      { "cssClass": "background-dessert",            
        "imageWidth" : 1371,
        "imageHeight" : 530,
        "scrollSpeed" : 0.1,
        "pagesWide" : 0.83},       
      { "cssClass": "background-skyscrapers",            
        "imageWidth" : 2225,
        "imageHeight" : 705,
        "scrollSpeed" : 0.18,
        "pagesWide" : 1.35},
      { "cssClass": "background-houses",            
        "imageWidth" : 2814,
        "imageHeight" : 417,
        "scrollSpeed" : 0.5,
        "pagesWide" : 1.7}
      ],  
      "animatedBackgroundLayers":[
      { "cssClass": "background-clouds",            
        "imageWidth" : 1018,
        "imageHeight" : 337,
        "scrollSpeed" : 0.14, /* Like the other background layers, relative among them */
        "framesPerSecond" : 30,
        "panSpeed" : 1, /* In pixels per frame. */ 
        "pagesWide" : 0.62}                           
      ]
    }  
  ],
  "slides":[
    {"name": "SimpleCitySlide1",
    "applicableToSeqs": ["SimpleCitySequence1"],
    "cssClass": "simple-city-seq1-slide1",
    "titleLayerCSSClass": "foreground-billboard",
    "titleTextAreaCSSClass": "foreground-billboard-textarea",
    "contentLayerCSSClass": "foreground-trafficsign",
    "contentTextAreaCSSClass": "foreground-trafficsign-textarea"}
  ]
};