// ==UserScript==
// @name         [Steam] Steam Hunters Button on Guides
// @version      1.0
// @description  Adds a Steam Hunters button to Steam Community Guide pages.
// @match        https://steamcommunity.com/sharedfiles/filedetails/?id=*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/steam_sh_button_on_guides.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/steam_sh_button_on_guides.user.js
// ==/UserScript==

window.addEventListener('load', function() {
    'use strict';

    // Look for the Guides tab with the "active" class
    const guidesTab = document.querySelector('.apphub_sectionTab.active');
    if (!guidesTab) {
        console.log("Active Guides tab not found.");
        return;
    }

    // Extract the appId from the link
    const appIdMatch = guidesTab.href.match(/https:\/\/steamcommunity\.com\/app\/(\d+)\//);
    if (!appIdMatch) {
        console.log("appId not found in the href:", guidesTab.href);
        return;
    }
    const appId = appIdMatch[1];

    // Look for the div where we want to insert the button
    const targetDiv = document.querySelector('.apphub_OtherSiteInfo.responsive_hidden');
    if (!targetDiv) {
        console.log("Target div for button not found.");
        return;
    }

    // Create the Steam Hunters button
    const huntersButton = document.createElement('a');
    huntersButton.className = 'btnv6_blue_hoverfade btn_medium';
    huntersButton.href = `https://steamhunters.com/stats/${appId}`;
    huntersButton.title = 'View on Steam Hunters';
    huntersButton.target = '_blank';

    // Add a tooltip with icon for the button
    huntersButton.innerHTML = `<span data-tooltip-text="View on Steam Hunters">
        <img class="ico16" style="vertical-align:-10px;background: none;" src="data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9IkxheWVyIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDE2IDE2Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIyIiByeT0iMiIgZmlsbD0iIzFiMjgzOCIvPjxnIGRhdGEtbmFtZT0iUGF0aGZpbmRlciBHcm91cCAoMSBwdCkiPjxwYXRoIGZpbGw9IiM3YmI2ZmYiIGQ9Ik0wIDdoMTJWMy41bDQgNC00IDRWOEgwVjd6Ii8+PHBhdGggZD0iTTggOWgydjVIOHptMC03aDJ2NEg4em00IDExdjFoMnYtMy4wMkwxMyAxMmwtMSAxem0yLTguOThWMmgtMmwxIDEgMSAxLjAyek0zIDVhMS4yNCAxLjI0IDAgMCAxIDEtMSAxLjMzIDEuMzMgMCAwIDEgMSAxaDJhMy4yMyAzLjIzIDAgMCAwLTMtMyAzLjE4IDMuMTggMCAwIDAtMyAzIDIuNDIgMi40MiAwIDAgMCAuMTggMWgyLjU3QzMuMzEgNS42NiAzIDUuMzQgMyA1em0yIDUuMDlhMi4zNiAyLjM2IDAgMCAxLS41OCAxLjYzQS43My43MyAwIDAgMSA0IDEyYy0uMzEgMC0xLS42LTEtMUgxYTIuOSAyLjkgMCAwIDAgLjkzIDJBMy4wOSAzLjA5IDAgMCAwIDQgMTRhMi42MSAyLjYxIDAgMCAwIDEuODktLjkzQTQuMzUgNC4zNSAwIDAgMCA3IDkuOTEgMy4yMiAzLjIyIDAgMCAwIDYuNzcgOUg0LjM4QTEuNzQgMS43NCAwIDAgMSA1IDEwLjA5eiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=">
        </span>`;

    // Insert the button and add a whitespace after it
    targetDiv.insertBefore(huntersButton, targetDiv.firstChild);
    targetDiv.insertBefore(document.createTextNode(' '), huntersButton);
    targetDiv.insertBefore(document.createTextNode(' '), huntersButton.nextSibling);

    console.log("Steam Hunters button added successfully.");
});
