// ==UserScript==
// @name         [Steam] AScouts Curations Box
// @version      2.0
// @description  Creates a dropdown box to show curator content on Steam store pages
// @author       alphabetsoup
// @match        https://store.steampowered.com/app/*
// @grant        none
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

    // Function to create a dropdown box
    function createDropdown(options) {
        var select = document.createElement('select');
        select.style.position = 'fixed';
        select.style.bottom = '10px';
        select.style.left = '10px';
        select.style.padding = '10px';
        select.style.zIndex = '1000';
        select.style.backgroundColor = '#1b2838';
        select.style.color = '#c7d5e0';
        //select.style.border = '1px solid #c7d5e0';
        select.style.cursor = 'pointer';
        select.style.width = 'calc(50vw - 490px - 20px + 1px - 10px)';


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

        console.log('Fetching curator content from:', curatorURL);  // Log the URL being fetched

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
                curatorBox.style.position = 'fixed';
                curatorBox.style.bottom = '50px';
                curatorBox.style.left = '10px';
                curatorBox.style.width = 'calc(50vw - 490px - 20px + 1px - 10px)';
                curatorBox.style.height = 'auto';
                curatorBox.style.overflowY = 'auto';
                //curatorBox.style.backgroundColor = '#16202d';
                //curatorBox.style.color = '#c7d5e0';
                //curatorBox.style.border = '1px solid #c7d5e0';
                //curatorBox.style.padding = '10px';
                curatorBox.style.zIndex = '1000';
                curatorBox.style.display = 'block';

                // Append the entire curator_detail_right_ctn content
                for (var i = 0; i < referringCurators.length; i++) {
                    var curatorDetail = referringCurators[i].getElementsByClassName('curator_detail_right_ctn');
                    if (curatorDetail.length > 0) {
                        var curatorElement = referringCurators[i].cloneNode(true);
                        curatorElement.innerHTML = '';
                        curatorElement.appendChild(curatorDetail[0].cloneNode(true));

                        // Modify the CSS of the fetched content
                        customizeCuratorCSS(curatorElement);

                        curatorBox.appendChild(curatorElement);
                    }
                }

                // Append the curator box to the body
                document.body.appendChild(curatorBox);
            })
            .catch(error => console.error('Error fetching curator content:', error));
    }

    // Function to modify the CSS of the fetched content
    function customizeCuratorCSS(element) {
        // Example: Change the background color and font size
        element.style.setProperty('background', '#16202d');       // Set a custom background color
        element.style.setProperty('border', '1px solid black');
        element.style.setProperty('box-shadow', '0px 0px 10px rgba(0, 0, 0, 0.5)');
        element.style.setProperty('padding', '10px');

        // Customize specific child elements (e.g., headers, paragraphs)
        var paragraphs = element.querySelectorAll('p');
        paragraphs.forEach(function(paragraph) {
            paragraph.style.setProperty('font-size', '13px');
            paragraph.style.setProperty('font-style', 'normal');
            paragraph.style.setProperty('font-family', 'Arial, Helvetica, sans-serif');
            paragraph.style.setProperty('line-height', 'normal');
        });
    }

    // Function to extract curators from the steam_curators_block
    function extractCurators(doc = document) {
        var curators = [];
        var curatorLinks = doc.querySelectorAll('.steam_curators_block a[href*="/curator/"]');

        curatorLinks.forEach(function(link) {
            var urlParts = link.href.split('/curator/')[1].split('/');
            var id = urlParts[0].split('-')[0];
            var name = urlParts[0];  // Use the text in the URL after curator/ and before /?appid=304430
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
        console.log('Fetching base URL from:', baseUrl);  // Log the URL being fetched

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
})();
