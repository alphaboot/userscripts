// ==UserScript==
// @name         [SH] Steam API
// @version      1.1
// @description  Display Various Steam API links
// @author       alphabetsoup
// @match        https://steamhunters.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_steam_api.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_steam_api.user.js
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('load', function() {
        const apiKey = GM_getValue('steamApiKey');
        const appId = sh.model.app ? sh.model.app.appId : null;
        const steamId = sh.model.steamUser ? sh.model.steamUser.steamId : null;

        // Only proceed if there's an appId or steamId
        if (!appId && !steamId) return;

        // Create a container for the buttons and links
        const linkContainer = document.createElement('div');
        linkContainer.style.position = 'fixed';
        linkContainer.style.top = '10px';
        linkContainer.style.left = '10px';
        linkContainer.style.backgroundColor = '#16202d';
        linkContainer.style.color = '#000';
        linkContainer.style.padding = '10px';
        linkContainer.style.border = '1px solid #000';
        linkContainer.style.zIndex = '1030';

        // Create buttons for changing and deleting API Key
        const changeApiKeyButton = document.createElement('button');
        changeApiKeyButton.textContent = apiKey ? 'Change API Key' : 'Add API Key';
        changeApiKeyButton.onclick = promptForApiKey;

        const deleteApiKeyButton = document.createElement('button');
        deleteApiKeyButton.textContent = 'Delete API Key';
        deleteApiKeyButton.onclick = deleteApiKey;

        // Add buttons to the container
        function addButtons() {
            linkContainer.appendChild(changeApiKeyButton);
            linkContainer.appendChild(document.createTextNode(' ')); // Add a space
            linkContainer.appendChild(deleteApiKeyButton);
        }

        // Add headings and links to the container
        function addLinks(apiKey) {
            const headingsAndLinks = createHeadingsAndLinks(apiKey, steamId, appId);
            headingsAndLinks.forEach(el => linkContainer.appendChild(el));
        }

        addButtons();
        addLinks(apiKey);
        document.body.appendChild(linkContainer);

        // Prompt for API key
        function promptForApiKey() {
            const currentApiKey = GM_getValue('steamApiKey', '');
            const newApiKey = prompt('Enter Steam API Key:', currentApiKey);
            if (newApiKey) {
                GM_setValue('steamApiKey', newApiKey);
                refreshLinks();
            }
        }

        // Delete API key
        function deleteApiKey() {
            GM_deleteValue('steamApiKey');
            alert('API Key deleted.');
            refreshLinks();
        }

        // Create a link
        function createLink(text, url) {
            const link = document.createElement('a');
            link.href = url;
            link.textContent = text;
            link.target = '_blank';
            link.style.display = 'block';
            link.style.marginLeft = '10px';
            return link;
        }

        // Create a heading
        function createHeading(text) {
            const heading = document.createElement('strong');
            heading.textContent = text;
            heading.style.color = '#fff';
            heading.style.display = 'block';
            heading.style.marginTop = '5px';
            return heading;
        }

        // Create headings and links
        function createHeadingsAndLinks(apiKey, steamId, appId) {
            const elements = [];

            if (apiKey) {
                // Steam API Profile Links
                if (steamId) {
                    elements.push(createHeading('Steam API Profile'));
                    elements.push(createLink('Profile Summary', `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?steamids=${steamId}&key=${apiKey}`));
                    elements.push(createLink('Played Recently', `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?steamid=${steamId}&key=${apiKey}`));
                    elements.push(createLink('Owned Games', `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?steamid=${steamId}&include_appinfo=1&skip_unvetted_apps=0&include_free_sub=1&include_played_free_games=1&key=${apiKey}`));
                    elements.push(createLink('Community Data Games', `https://steamcommunity.com/profiles/${steamId}/games?xml=1`));
                }

                // Steam API Player Links
                if (appId && steamId) {
                    elements.push(createHeading('Steam API Player'));
                    elements.push(createLink('Player Achievements', `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&steamid=${steamId}&key=${apiKey}&l=english`));
                    elements.push(createLink('User Stats', `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?appid=${appId}&steamid=${steamId}&key=${apiKey}`));
                    elements.push(createLink('Community Data Stats', `https://steamcommunity.com/profiles/${steamId}/stats/appid/${appId}/?tab=achievements&xml=1`));
                }

                // Steam API Game Links
                if (appId) {
                    elements.push(createHeading('Steam API Game'));
                    elements.push(createLink('Achievements', `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}`));
                    elements.push(createLink('Schema', `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?appid=${appId}&key=${apiKey}&l=english`));
                    elements.push(createLink('Details', `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=null`));
                    elements.push(createLink('Reviews', `https://store.steampowered.com/appreviews/${appId}?filter=recent&num_per_page=0&language=all&review_type=all&purchase_type=all&filter_offtopic_activity=1&json=1`));
                    elements.push(createLink('User Details', `https://store.steampowered.com/api/appuserdetails/?appids=${appId}&l=english&v=1`));
                    elements.push(createLink('News', `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${appId}`));
                }
            }

            return elements;
        }

        // Refresh the links when the API key is updated or deleted
        function refreshLinks() {
            const apiKey = GM_getValue('steamApiKey');
            linkContainer.innerHTML = '';
            addButtons();
            addLinks(apiKey);
        }
    });
})();
