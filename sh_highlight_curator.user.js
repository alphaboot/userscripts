// ==UserScript==
// @name         [SH] Highlight Curator
// @version      2.1
// @description  Highlight curated games on SteamHunters
// @author       alphabetsoup
// @match        https://steamhunters.com/games*
// @match        https://steamhunters.com/*/games*
// @match        https://steamhunters.com/dlc*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_highlight_curator.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_highlight_curator.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Retrieve curator data from GM storage
    const curatorData = JSON.parse(GM_getValue('curatorData', '[]'));

    // Define curators with colors in one array
    const curators = [
        { id: '31507748', name: 'Achievement Scouts', color: '#7aff0e' },
        { id: '33207241', name: 'Achievement Scouts 2', color: '#7aff0e' },
        { id: '33219357', name: 'Achievement Scouts 3', color: '#7aff0e' },
        { id: '33219361', name: 'Achievement Scouts 4', color: '#7aff0e' },
        { id: '34752873', name: 'Achievement Scouts Restricted', color: '#ff650c' },
        { id: '35709504', name: 'Achievement Scouts Restricted 2', color: '#ff650c' },
        { id: '35709530', name: 'Achievement Scouts Restricted 3', color: '#ff650c' },
        { id: '35709536', name: 'Achievement Scouts Restricted 4', color: '#ff650c' },
        { id: '44900522', name: 'Achievement Scouts Broken', color: '#dc1110' },
        { id: '44900614', name: 'Achievement Scouts Broken Restricted', color: '#c76236' },
        { id: '44900624', name: 'Achievement Scouts NSFW', color: '#a60bdb' },
        { id: '44900660', name: 'Achievement Scouts NSFW Restricted', color: '#dc0dc5' }
    ];

    const page_size = 500;
    const pages = 4;

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
        createStyledButton('Import Data', 80, fetchCuratorData);
    }

    let statusBox;

    function updateStatus(msg) {
        if (!statusBox) {
            statusBox = document.createElement("div");
            statusBox.style.position = "fixed";
            statusBox.style.bottom = "10px";
            statusBox.style.right = "10px";
            statusBox.style.zIndex = 10000;
            statusBox.style.background = "rgba(0,0,0,0.8)";
            statusBox.style.color = "white";
            statusBox.style.padding = "8px 12px";
            statusBox.style.borderRadius = "6px";
            statusBox.style.fontSize = "14px";
            document.body.appendChild(statusBox);
        }
        statusBox.textContent = msg;
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
                    const curatorColorMap = Object.fromEntries(curators.map(c => [c.id, c.color]));
                    let color = curatorColorMap[curator.curator];
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

    async function fetchCuratorData() {
        let allData = []; // clear old data

        for (const curator of curators) {
            for (let i = 0; i < pages; i++) {
                const start = i * page_size;
                const url = `https://store.steampowered.com/curator/${curator.id}/admin/ajaxgetrecommendations/?query&start=${start}&count=${page_size}`;

                updateStatus(`Fetching ${curator.name} (page ${i+1}/${pages}) …`);

                await new Promise((resolve) => {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: url,
                        withCredentials: true,
                        onload: function(res) {
                            try {
                                const data = JSON.parse(res.responseText);
                                if (data && data.recommendations) {
                                    for (const rec of data.recommendations) {
                                        const appid = rec.appid;
                                        const clanid = rec.recommendation?.clanid;
                                        if (appid && clanid) {
                                            allData.push({
                                                appid: appid,
                                                curator: clanid
                                            });
                                        }
                                    }
                                }
                            } catch (e) {
                                console.error("Parse error:", e);
                            }
                            resolve();
                        },
                        onerror: function(err) {
                            console.error("Request failed:", url, err);
                            resolve();
                        }
                    });
                });
            }
        }

        GM_setValue("curatorData", JSON.stringify(allData));
        console.log("Stored curatorData:", allData);

        updateStatus(`✅ Done! Stored ${allData.length} entries`);
        setTimeout(() => { if (statusBox) statusBox.remove(); }, 5000);
    }


    // Add the button when the page loads
    addHighlightButton();
    addImportButton();
})();
