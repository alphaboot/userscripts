// ==UserScript==
// @name         [SH] Wide 'Points Over Time' Graph
// @version      1.2
// @description  Changes the 'Points Over Time' graph width to 100%
// @author       alphabetsoup
// @match        https://steamhunters.com/id/*/stats
// @match        https://steamhunters.com/profiles/*/stats
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_wide_points_graph.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_wide_points_graph.user.js
// ==/UserScript==

// for browser console (requires changing display to something else as well):
// document.getElementById('pointCanvas').parentElement.style.width = '100%'; document.getElementById('pointCanvas').style.display = 'inline-block';

(function() {
    'use strict';

    // Find the canvas element by its ID
    var canvasElement = document.getElementById('pointCanvas');

    if (canvasElement) {
        // Get the parent element of the canvas
        var parentDiv = canvasElement.parentElement;

        if (parentDiv && parentDiv.classList.contains('col-sm-6') && parentDiv.classList.contains('col-lg-4')) {
            // Change the width of the parent div to 100%
            parentDiv.style.width = '100%';
        }
    }
})();
