// ==UserScript==
// @name         [Steam] Add Achievement Links to User Content
// @version      1.3
// @description  Adds Achievements link to each creator
// @match        https://steamcommunity.com/sharedfiles/filedetails/?id=*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/steam_add_achievement_links_user_content.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/steam_add_achievement_links_user_content.user.js
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('load', () => {
        // Find the store page link that contains the appid
        const storeLink = document.querySelector('a[data-appid]');
        if (!storeLink) {
            console.warn('No store link with data-appid found.');
            return;
        }

        const appid = storeLink.getAttribute('data-appid');
        console.log('AppID:', appid);

        // Find all creators in the creatorsBlock
        const creators = document.querySelectorAll('.creatorsBlock .friendBlock');
        if (!creators.length) {
            console.warn('No creators found.');
            return;
        }

        creators.forEach(creator => {
            const profileLink = creator.querySelector('a.friendBlockLinkOverlay');
            if (!profileLink) return;

            const profileURL = profileLink.href;
            const achievementsURL = `${profileURL}/stats/${appid}`;

            // Create the "View Achievements" link
            const link = document.createElement('a');
            link.href = achievementsURL;
            link.textContent = '🏆';
            link.className = 'viewAchievementsLink';
            link.target = '_blank';

            // --- Proper bottom-right placement ---
            creator.style.position = 'relative'; // make parent the positioning container
            link.style.position = 'absolute';
            link.style.bottom = '3px';
            link.style.right = '3px';
            link.style.fontSize = '14px';
            link.style.color = '#66c0f4';
            link.style.textDecoration = 'none';
            link.style.fontFamily = 'Motiva Sans, Arial, sans-serif';
            link.style.zIndex = '20'; // above overlay
            link.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            link.style.padding = '4px 4px';
            link.style.borderRadius = '3px';
            link.style.pointerEvents = 'auto'; // allow clicking

            // Add inside the friendBlock so it appears over the overlay
            creator.appendChild(link);
        });
    });
})();
