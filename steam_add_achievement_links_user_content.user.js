// ==UserScript==
// @name         [Steam] Add Achievement Links to User Content
// @version      1.2
// @description  Adds "View Achievements" link under each creator
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
            link.textContent = 'View Achievements';
            link.className = 'viewAchievementsLink';
            link.target = '_blank'; // optional: open in new tab

            // Basic styling
            link.style.display = 'block';
            link.style.marginTop = '-4px';
            link.style.marginBottom = '6px';
            link.style.fontSize = '11px';
            link.style.color = '#66c0f4';
            link.style.textDecoration = 'none';
            link.style.fontFamily = 'Motiva Sans, Arial, sans-serif';

            link.addEventListener('mouseover', () => link.style.textDecoration = 'underline');
            link.addEventListener('mouseout', () => link.style.textDecoration = 'none');

            // Insert the link after each .friendBlock
            creator.insertAdjacentElement('afterend', link);
        });
    });
})();
