// ==UserScript==
// @name         [SH] Wide 'Points Over Time' Graph
// @version      1.1
// @description  Changes the 'Points Over Time' graph width to 100%
// @author       alphabetsoup
// @match        https://steamhunters.com/id/*/stats
// @match        https://steamhunters.com/profiles/*/stats
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_wide_points_graph.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_wide_points_graph.user.js
// ==/UserScript==

document.getElementById('pointCanvas').parentElement.style.width = '100%';

// for browser console (requires changing display to something else as well):
// document.getElementById('pointCanvas').parentElement.style.width = '100%'; document.getElementById('pointCanvas').style.display = 'inline-block';
