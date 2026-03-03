// ==UserScript==
// @name         [SH] AScouts Curation Fetcher
// @version      2.7
// @description  Display curations on SteamHunters
// @author       alphabetsoup
// @match        https://steamhunters.com/apps/*
// @match        https://steamhunters.com/id/*/apps/*
// @match        https://steamhunters.com/profiles/*/apps/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      store.steampowered.com
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_curation_fetcher.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_curation_fetcher.user.js
// ==/UserScript==

(function() {
    'use strict';

    const predefinedCurators = [
        { id: '31507748', name: 'Achievement Scouts' },
        { id: '33207241', name: 'Achievement Scouts 2' },
        { id: '33219357', name: 'Achievement Scouts 3' },
        { id: '33219361', name: 'Achievement Scouts 4' },
		{ id: '33219363', name: 'Achievement Scouts 5' },
        { id: '34752873', name: 'Achievement Scouts: Restricted' },
        { id: '35709504', name: 'Achievement Scouts: Restricted 2' },
        { id: '35709530', name: 'Achievement Scouts: Restricted 3' },
        { id: '35709536', name: 'Achievement Scouts: Restricted 4' },
        { id: '44900522', name: 'Achievement-Scouts: Broken' },
        { id: '44900614', name: 'Achievement-Scouts: Broken Restricted' },
        { id: '44900624', name: 'Achievement-Scouts: NSFW' },
        { id: '44900660', name: 'Achievement-Scouts: NSFW Restricted' },
        { id: '29354216', name: 'VR Achievement Hunters ' }
    ];

    const targetCuratorIDs = [
        '31507748', '33207241', '33219357', '33219361', '34752873',
        '35709504', '35709530', '35709536', '44900522', '44900614',
        '44900624', '44900660', '29354216'
    ];

    const appIdMatch = window.location.pathname.match(/\/apps\/(\d+)\//);
    const appId = appIdMatch ? appIdMatch[1] : null;

    if (!appId) return;

    const steamUrl = `https://store.steampowered.com/app/${appId}/`;

    let curatorDetailFound = false;
    let container;

    GM_addStyle(`
        @import url('https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
    `);

    GM_xmlhttpRequest({
        method: 'GET',
        url: steamUrl,
        onload: function(response) {
            if (response.status === 200) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.responseText, 'text/html');
                const steamCuratorsBlock = doc.querySelector('.steam_curators_block');

                if (steamCuratorsBlock) {
                    const links = steamCuratorsBlock.querySelectorAll('a[href*="/curator/"]');

                    links.forEach(link => {
                        const url = new URL(link.href);
                        const pathParts = url.pathname.split('/');
                        const fullCuratorID = pathParts[2];
                        const curatorID = fullCuratorID.split('-')[0];

                        if (predefinedCurators.some(c => c.id === curatorID)) {
                            const curatorUrl = `https://store.steampowered.com/app/${appId}/?curator_clanid=${curatorID}`;

                            GM_xmlhttpRequest({
                                method: 'GET',
                                url: curatorUrl,
                                onload: function(response) {
                                    if (response.status === 200) {
                                        const doc = parser.parseFromString(response.responseText, 'text/html');
                                        const curatorDetail = doc.querySelector('.curator_detail_right_ctn');

                                        if (curatorDetail) {
                                            if (!curatorDetailFound) {
                                                curatorDetailFound = true;
                                                container = document.createElement('div');
                                                container.id = 'curatorDetailContainer';

                                                // Create the hide/show button
                                                const toggleButton = document.createElement('button');
                                                toggleButton.innerHTML = '<i class="fa fa-chevron-down" aria-hidden="true"></i>'; // Minimize icon
                                                toggleButton.id = 'toggleButton';

                                                // Create a wrapper for the curation content
                                                const contentWrapper = document.createElement('div');
                                                contentWrapper.id = 'curationContent';

                                                toggleButton.addEventListener('click', () => {
                                                    if (container.classList.contains('minimized')) {
                                                        // Maximize content
                                                        container.classList.remove('minimized');
                                                        toggleButton.innerHTML = '<i class="fa fa-chevron-down" aria-hidden="true"></i>'; // Minimize icon
                                                        contentWrapper.style.display = '';
                                                    } else {
                                                        // Minimize content
                                                        container.classList.add('minimized');
                                                        toggleButton.innerHTML = '<i class="fa fa-chevron-up" aria-hidden="true"></i>'; // Maximize icon
                                                        contentWrapper.style.display = 'none';
                                                    }
                                                });

                                                // Append the button and content wrapper to the container
                                                container.appendChild(toggleButton);
                                                container.appendChild(contentWrapper);

                                                // Add the container to the document body
                                                document.body.appendChild(container);
                                            }

                                            // Append curatorDetail content without overwriting existing elements
                                            const curatorContent = document.createElement('div');
                                            curatorContent.innerHTML = curatorDetail.outerHTML;
                                            document.getElementById('curationContent').appendChild(curatorContent);

                                            let bodyWidth = document.body.getBoundingClientRect().width;
                                            let width = (document.querySelector('.container-table') || document.querySelector('.container')).getBoundingClientRect().width - (document.querySelector('.container-table') ? 0 : 30);

                                            // Apply CSS after the content is added
                                            GM_addStyle(`
                                                #curatorDetailContainer {
                                                    position: fixed;
                                                    bottom: 10px;
                                                    left: 10px;
                                                    width: calc((${bodyWidth}px - ${width}px)/2 - 20px); /* half the screen minus sh content, minus 10 on each side for padding */
                                                    min-width: 350px;
                                                    max-height: 400px;
                                                    overflow-y: auto;
                                                    background: rgb(22, 32, 45);
                                                    border: 1px solid black;
                                                    padding: 10px;
                                                    border-radius: 5px;
                                                    z-index: 9999;
                                                    color: white;
                                                    display: flex;
                                                    flex-direction: column;
                                                    gap: 20px;
                                                }
                                                .minimized {
                                                    border: 1px dashed gray !important;
                                                    height: 40px !important;
                                                    width: 41px !important;
                                                    min-width: unset !important;
                                                }
                                                div[data-panel*="flow-children"] {
                                                    display: flex;
                                                    flex-wrap: wrap;
                                                }
                                                #curatorDetailContainer .notes {
                                                    position: absolute;
                                                    right: 10px;
                                                }
                                                #curatorDetailContainer .avatar {
                                                    width: 50px;
                                                    height: 50px;
                                                    border-radius: 4px;
                                                    display: inline-block;
                                                    position: relative;
                                                    flex: 0 0 1%
                                                }
                                                #curatorDetailContainer .avatar img {
                                                    width: 50px;
                                                    height: 50px;
                                                    border-radius: 4px;
                                                }
                                                #curatorDetailContainer .curator_info_ctn {
                                                    display: inline-block;
                                                    position: relative;
                                                    padding-left: 8px;
                                                    flex: 1 0 1%
                                                }
                                                #curatorDetailContainer .review_title {
                                                    text-transform: uppercase;
                                                    font-size: 17px;
                                                    display: block;
                                                    letter-spacing: 1.1px;
                                                    font-weight: 700;
                                                    font-style: normal;
                                                }
                                                #curatorDetailContainer .color_recommended {
                                                    color: #66c0f4;
                                                }
                                                #curatorDetailContainer .color_informational {
                                                    color: #f5df67;
                                                }
                                                #curatorDetailContainer .color_not_recommended {
                                                    color: #f49866;
                                                }
                                                #curatorDetailContainer .referringSteamCurator {
                                                    font-size: 12px;
                                                    color: rgba(255,255,255,.5);
                                                }
                                                #curatorDetailContainer .curator_review_date {
                                                    margin-left: 8px;
                                                    white-space: nowrap;
                                                }
                                                #curatorDetailContainer p {
                                                    margin: 6px 0px 6px 0px;
                                                    flex: 1 0 100%
                                                }
                                                #curatorDetailContainer .curator_review_actions_ctn {
                                                    font-size: 12px;
                                                    gap: 20px;
                                                    flex: 1 0 100%
                                                }
                                                #toggleButton {
                                                    position: absolute;
                                                    top: 10px;
                                                    right: 10px;
                                                    font-size: 10px;
                                                    background-color: #444;
                                                    color: white;
                                                    border: none;
                                                    padding: 2px 5px;
                                                    border-radius: 3px;
                                                    cursor: pointer;
                                                    z-index: 1;
                                                }
                                                #toggleButton:hover {
                                                    background-color: #666;
                                                }
                                            `);
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }
    });
})();
