// ==UserScript==
// @name         [SH] AScouts Curation Fetcher
// @namespace    http://tampermonkey.net/
// @version      2.3
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

                        if (targetCuratorIDs.includes(curatorID)) {
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
                                                document.body.appendChild(container);
                                            }
                                            container.innerHTML += curatorDetail.outerHTML;

                                            let bodyWidth = document.body.getBoundingClientRect().width;
                                            let width = (document.querySelector('.container-table') || document.querySelector('.container')).getBoundingClientRect().width - (document.querySelector('.container-table') ? 0 : 30);

                                            // Apply CSS after the content is added
                                            GM_addStyle(`
                                                #curatorDetailContainer {
                                                    position: fixed;
                                                    bottom: 10px;
                                                    left: 10px;
                                                    width: calc((${bodyWidth}px - ${width}px)/2 - 20px); /* half the screen minus sh content, minus 10 on each side for padding */
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
