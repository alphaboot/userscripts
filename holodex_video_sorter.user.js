// ==UserScript==
// @name         Holodex Video Sorter
// @version      2.0
// @description  Sort videos on Holodex by viewers or duration (without refresh)
// @author       alphabetsoup
// @match        https://holodex.net/*
// @exclude      https://holodex.net/multiview
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/holodex_video_sorter.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/holodex_video_sorter.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to parse the "live-viewers" text into a numeric value
    function parseViewers(viewerText) {
        if (!viewerText) return 0;

        // Clean the input to remove extra characters like "•" and "Watching"
        const cleanedText = viewerText.replace(/[^\d.K]/g, '').trim();

        if (cleanedText.includes('K')) {
            return parseFloat(cleanedText.replace('K', '')) * 1000;
        } else {
            return parseInt(cleanedText, 10);
        }
    }

    // Function to parse the "video-duration-live" into seconds
    function parseDuration(durationText) {
        if (!durationText) return 0;
        const parts = durationText.split(':').map(Number);
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        return parts[0]; // In case it's just seconds (unlikely but possible)
    }

    // Sort videos based on the chosen criteria
    function sortVideos(byViewers, reverse = false) {
        const videoContainer = document.querySelector('.row.video-row.row--dense');
        const videoCards = Array.from(videoContainer.querySelectorAll('.video-col'));

        videoCards.sort((a, b) => {
            const aViewers = parseViewers(a.querySelector('.live-viewers')?.textContent || '');
            const bViewers = parseViewers(b.querySelector('.live-viewers')?.textContent || '');
            const aDuration = parseDuration(a.querySelector('.video-duration-live')?.textContent || '');
            const bDuration = parseDuration(b.querySelector('.video-duration-live')?.textContent || '');

            let compare = 0;
            if (byViewers) {
                compare = bViewers - aViewers;
            } else {
                compare = bDuration - aDuration;
            }
            return reverse ? -compare : compare;
        });

        // Re-append the sorted video cards
        videoCards.forEach(card => videoContainer.appendChild(card));
    }

    // Create the sort button and checkbox
    const controlContainer = document.createElement('div');
    controlContainer.style.position = 'fixed';
    controlContainer.style.top = '10px';
    controlContainer.style.right = '335px';
    controlContainer.style.background = 'rgba(0, 0, 0, 0.7)';
    controlContainer.style.padding = '10px';
    controlContainer.style.borderRadius = '5px';
    controlContainer.style.color = 'white';
    controlContainer.style.zIndex = '1000';

    const sortButton = document.createElement('button');
    sortButton.textContent = 'Duration';
    sortButton.style.marginRight = '10px';
    sortButton.style.cursor = 'pointer';

    const reverseCheckbox = document.createElement('input');
    reverseCheckbox.type = 'checkbox';
    reverseCheckbox.id = 'reverseSort';
    const reverseLabel = document.createElement('label');
    reverseLabel.textContent = 'Reverse';
    reverseLabel.htmlFor = 'reverseSort';

    controlContainer.appendChild(sortButton);
    controlContainer.appendChild(reverseCheckbox);
    controlContainer.appendChild(reverseLabel);
    document.body.appendChild(controlContainer);

    let sortByViewers = true;

    // Add event listeners
    sortButton.addEventListener('click', () => {
        sortVideos(sortByViewers, reverseCheckbox.checked);
        sortByViewers = !sortByViewers;
        sortButton.textContent = sortByViewers ? 'Duration' : 'Viewers';
    });

    reverseCheckbox.addEventListener('change', () => {
        sortVideos(!sortByViewers, reverseCheckbox.checked);
    });
})();
