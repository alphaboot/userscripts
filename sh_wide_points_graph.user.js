// ==UserScript==
// @name         [SH] Wide 'Points Over Time' Graph
// @version      1.3
// @description  Changes the 'Points Over Time' graph width to 100%
// @author       alphabetsoup
// @match        https://steamhunters.com/id/*/stats
// @match        https://steamhunters.com/profiles/*/stats
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_wide_points_graph.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_wide_points_graph.user.js
// ==/UserScript==

// for browser console (requires changing display to something else as well):
// document.getElementById('pointsChartCanvas').parentElement.style.width = '100%'; document.getElementById('pointsChartCanvas').style.display = 'inline-block';

(function() {
    'use strict';

    // Find the canvas element by its ID
    var potGraph = document.getElementById('pointsChartCanvas');
    var cgotGraph = document.getElementById('completedGamesChartCanvas');
    var aotGraph = document.getElementById('achievementsChartCanvas');

    var graphs = [potGraph, cgotGraph, aotGraph];


    graphs.forEach((graph) => {
        if (graph) {
            // Get the parent element of the canvas
            var parentDiv = graph.parentElement;

            if (parentDiv && parentDiv.classList.contains('col-sm-6')) {
                // Change the width of the parent div to 100%
                parentDiv.style.width = '100%';
            }
        }
    });
})();
