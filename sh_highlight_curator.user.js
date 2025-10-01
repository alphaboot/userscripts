// ==UserScript==
// @name         [SH] Highlight Curator
// @version      1.4
// @description  Highlight curated games
// @author       alphabetsoup
// @match        https://steamhunters.com/games*
// @match        https://steamhunters.com/*/games*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_highlight_curator.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_highlight_curator.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Retrieve curator data from GM storage
    const curatorData = JSON.parse(GM_getValue('curatorData', '[]'));

    // Define the highlight colors for different curators
    const highlightColors = {
        "S1": "#7aff0e",
        "S2": "#7aff0e",
        "S3": "#7aff0e",
        "S4": "#7aff0e",
        "R1": "#ff650c",
        "R2": "#ff650c",
        "R3": "#ff650c",
        "R4": "#ff650c",
        "B1": "#dc1110",
        "BR": "#c76236",
        "NSFW1": "#a60bdb",
        "NSFWR": "#dc0dc5",
    };

    function createStyledButton(text, top, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.position = 'fixed';
        button.style.top = top + 'px';
        button.style.right = '8px';
        button.style.zIndex = '9999';
        button.style.padding = '6px 12px';
        button.style.backgroundColor = '#273342';
        button.style.color = 'white';
        button.style.borderWidth = '1px';
        button.style.borderColor = 'black';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.addEventListener('click', onClick);
        document.body.appendChild(button);
        return button;
    }

    function addHighlightButton() {
        createStyledButton('Highlight Games', 47, highlightLinks);
    }

    function addImportButton() {
        createStyledButton('Import JSON', 80, importJsonToStorage);
    }

    function hexToRgbA(hex, alpha) {
        // Remove the hash if present
        hex = hex.replace("#", "");
        // Parse the RGB values
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        // Return the RGBA string
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Function to highlight the grandparent elements of the links
    function highlightLinks() {
        // Find all the anchor links on the page
        const links = document.querySelectorAll('a');

        links.forEach(link => {
            // Extract appid from the URL
            const match = link.href.match(/apps\/(\d+)\/achievements/);

            if (match) {
                const appid = parseInt(match[1], 10);

                // Check if the appid matches any of the curators in the stored data
                const curator = curatorData.find(c => c.appid === appid);

                if (curator) {
                    let color = highlightColors[curator.curator];
                    let transparentColor = hexToRgbA(color, 0.5); // Set transparency to 50%
                    const grandparent = link.parentElement?.parentElement;

                    if (grandparent) {
                        // Highlight the grandparent element by changing its background color
                        grandparent.style.backgroundColor = transparentColor;
                        // grandparent.style.color = "#000"; // Optional: Ensure text is readable
                    }
                }
            }
        });
    }

    async function importJsonToStorage() {
    const jsonUrl = "https://raw.githubusercontent.com/alphaboot/achievement-scouts/main/apps.json"; // replace with your actual JSON link

    try {
        // Fetch JSON
        const resp = await fetch(jsonUrl);
        const data = await resp.json();

        // Clear existing GM storage
        for (const key of GM_listValues()) {
            GM_deleteValue(key);
        }

        // Save new data
        for (const [key, value] of Object.entries(data)) {
            GM_setValue(key, value);
        }

        alert("Imported JSON and replaced GM storage!");
    } catch (err) {
        console.error("Error importing JSON:", err);
        alert("Failed to import JSON.");
    }
}

    // Add the button when the page loads
    addHighlightButton();
    addImportButton();
})();
