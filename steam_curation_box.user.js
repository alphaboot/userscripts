// ==UserScript==
// @name         [Steam] AScouts Curations Box
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Creates a dropdown box to show curator content on Steam store pages
// @author       alphabetsoup
// @match        https://store.steampowered.com/app/*
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/steam_curation_box.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/steam_curation_box.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Predefined list of curator_clanid
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

    let bodyWidth = document.body.getBoundingClientRect().width;
    let width = document.querySelector('.page_title_area.game_title_area.page_content').getBoundingClientRect().width;
    console.log('bodyWidth:', bodyWidth);
    console.log('width:', width);


    // Function to create a dropdown box
    function createDropdown(options) {
        var select = document.createElement('select');
        select.className = 'curator-dropdown';

        // Add default option
        var defaultOption = document.createElement('option');
        defaultOption.text = 'Select a Curator';
        defaultOption.value = '';
        select.appendChild(defaultOption);

        // Add curator options
        options.forEach(function(option) {
            var opt = document.createElement('option');
            opt.text = option.name;
            opt.value = option.id;
            select.appendChild(opt);
        });

        // Handle change event
        select.addEventListener('change', function() {
            if (this.value) {
                fetchCuratorContent(this.value);
            }
        });

        document.body.appendChild(select);

        // Automatically fetch and display content for the first predefined curator that exists in the extracted list
        const predefinedInExtracted = predefinedCurators.find(predefined => options.some(extracted => extracted.id === predefined.id));
        if (predefinedInExtracted) {
            fetchCuratorContent(predefinedInExtracted.id);
            select.value = predefinedInExtracted.id;
        }
    }

    // Function to fetch and display specific curator content
    function fetchCuratorContent(curatorClanID) {
        const currentURL = window.location.href;
        const baseUrl = currentURL.split('?')[0];
        const curatorURL = `${baseUrl}?curator_clanid=${curatorClanID}`;

        console.log('Fetching curator content from:', curatorURL); // Log the URL being fetched

        fetch(curatorURL)
            .then(response => response.text())
            .then(data => {
                var parser = new DOMParser();
                var doc = parser.parseFromString(data, 'text/html');
                var referringCurators = doc.getElementsByClassName('referring_curator');

                // Remove any existing curator content box
                var existingBox = document.getElementById('curatorContentBox');
                if (existingBox) {
                    existingBox.remove();
                }

                // Create a container for the curator_detail_right_ctn content
                var curatorBox = document.createElement('div');
                curatorBox.id = 'curatorContentBox';

                // Append the entire curator_detail_right_ctn content
                for (var i = 0; i < referringCurators.length; i++) {
                    var curatorDetail = referringCurators[i].getElementsByClassName('curator_detail_right_ctn');
                    if (curatorDetail.length > 0) {
                        var curatorElement = referringCurators[i].cloneNode(true);
                        curatorElement.innerHTML = '';
                        curatorElement.appendChild(curatorDetail[0].cloneNode(true));
                        curatorBox.appendChild(curatorElement);
                    }
                }

                // Append the curator box to the body
                document.body.appendChild(curatorBox);
            })
            .catch(error => console.error('Error fetching curator content:', error));
    }

    // Function to extract curators from the steam_curators_block
    function extractCurators(doc = document) {
        var curators = [];
        var curatorLinks = doc.querySelectorAll('.steam_curators_block a[href*="/curator/"]');

        curatorLinks.forEach(function(link) {
            var urlParts = link.href.split('/curator/')[1].split('/');
            var id = urlParts[0].split('-')[0];
            var name = urlParts[0]; // Use the text in the URL after curator/ and before /?appid=304430
            curators.push({ id: id, name: decodeURIComponent(name) });
        });

        return curators;
    }

    // Check if ?curator_clanid= is present in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const hasCuratorClangID = urlParams.has('curator_clanid');

    if (hasCuratorClangID) {
        // Remove the curator_clanid parameter and fetch the steam_curators_block from the URL without it
        const baseUrl = window.location.href.split('?')[0];
        console.log('Fetching base URL from:', baseUrl); // Log the URL being fetched

        fetch(baseUrl)
            .then(response => response.text())
            .then(data => {
                var parser = new DOMParser();
                var doc = parser.parseFromString(data, 'text/html');
                var curators = extractCurators(doc);
                var filteredCurators = curators.filter(curator => predefinedCurators.some(predefined => predefined.id === curator.id));

                createDropdown(curators);

                // Automatically fetch and display content for the first predefined curator that exists in the extracted list
                const predefinedInExtracted = predefinedCurators.find(predefined => filteredCurators.some(extracted => extracted.id === predefined.id));
                if (predefinedInExtracted) {
                    fetchCuratorContent(predefinedInExtracted.id);
                }
            })
            .catch(error => console.error('Error fetching base page content:', error));
    } else {
        // Extract curators from the current page
        var curators = extractCurators();
        var filteredCurators = curators.filter(curator => predefinedCurators.some(predefined => predefined.id === curator.id));

        if (curators.length > 0) {
            createDropdown(curators);
        }
    }

    // Add styles using GM_addStyle
    GM_addStyle(`
        .curator-dropdown {
            position: fixed;
            bottom: 10px;
            left: 10px;
            padding: 10px;
            z-index: 1001;
            background-color: #16202d;
            color: #c7d5e0;
            border: 1px solid #000000;
            cursor: pointer;
            width: calc((${bodyWidth}px - ${width}px) / 2 - 20px);
            min-width: 300px;
        }
        #curatorContentBox {
            position: fixed;
            bottom: 47px;
            left: 10px;
            box-sizing: border-box;
            width: calc((${bodyWidth}px - ${width}px) / 2 - 20px);
            min-width: 300px;
            height: auto;
            background: #16202d;
            border: 1px solid black;
            z-index: 1000;
            display: block;
        }
        #curatorContentBox .referring_curator {
	        background: unset;
	        margin: unset;
		    box-shadow: unset;
            width: auto;
            height: auto;
            padding: 10px;
            overflow: hidden;
        }
        #curatorContentBox p {
            font-size: 13px;
            line-height: normal;
            padding-top: unset;
            padding-bottom: 6px;
            text-indent: 0px;
        }
    `);


})();
