// ==UserScript==
// @name         [SH] Show AppIDs and SteamIDs
// @version      2.2
// @description  Display AppID and SteamIDs on game and user pages
// @author       alphabetsoup
// @match        https://steamhunters.com/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_show_appid_steamid.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_show_appid_steamid.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to copy text to the clipboard
    function copyToClipboard(text) {
        const tempInput = document.createElement('textarea');
        document.body.appendChild(tempInput);
        tempInput.value = text;
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
    }

    // Function to handle the "Copied!" text display with a resettable timer
    function showCopiedMessage(element) {
        let copiedText = element.querySelector('.copied-message');

        // If no "Copied!" message exists, create one
        if (!copiedText) {
            copiedText = document.createElement('span');
            copiedText.textContent = 'Copied!';
            copiedText.style.color = 'red';
            copiedText.style.marginLeft = '5px';
            copiedText.classList.add('copied-message');
            element.appendChild(copiedText);
        }

        // Reset the timer for the "Copied!" message
        clearTimeout(copiedText.timeout);
        copiedText.timeout = setTimeout(() => {
            if (element.contains(copiedText)) {
                element.removeChild(copiedText);
            }
        }, 3000);
    }

    // Wait for the page to load fully
    window.addEventListener('load', function() {
        // Check if the sh.model object exists
        if (typeof sh !== 'undefined' && sh.model) {
            let infoHtml = '';

            // Check and display appId if available
            if (sh.model.app && sh.model.app.appId) {
                const appId = sh.model.app.appId;
                infoHtml += `<strong>AppID:</strong> <span class="clickable-id" data-id="${appId}">${appId}</span><br>`;
            }

            // Check and display steamId if available
            if (sh.model.steamUser && sh.model.steamUser.steamId) {
                const steamId = sh.model.steamUser.steamId;
                infoHtml += `<strong>SteamID:</strong> <span class="clickable-id" data-id="${steamId}">${steamId}</span><br>`;
            }

            // If we have any info to display, create a new div
            if (infoHtml !== '') {
                const infoDiv = document.createElement('div');
                infoDiv.innerHTML = infoHtml;
                // infoDiv.style.margin = '10px';

                // Find the target div
                const targetDiv = document.querySelector('.media-heading');

                if (targetDiv) {
                    targetDiv.after(infoDiv);
                    // targetDiv.insertBefore(infoDiv, targetDiv.firstChild);
                    // targetDiv.appendChild(infoDiv);
                }

                // Add event listener to copy text when clicked
                document.querySelectorAll('.clickable-id').forEach(function(el) {
                    el.style.cursor = 'pointer'; // Make it clickable

                    el.addEventListener('click', function() {
                        const idToCopy = el.getAttribute('data-id');
                        copyToClipboard(idToCopy);
                        showCopiedMessage(el); // Show "Copied!" next to the clicked element and reset timer
                    });
                });
            }
        } else {
            console.log('sh.model or necessary properties are not available.');
        }
    });
})();
