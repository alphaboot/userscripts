// ==UserScript==
// @name         [Steam] Add Achievement Links
// @version      1.5
// @description  Adds achievements links to Steam store reviews and Steam community
// @author       alphabetsoup
// @match        https://store.steampowered.com/app/*
// @match        https://steamcommunity.com/app/*
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/steam_add_achievement_links.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/steam_add_achievement_links.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Extract the appid from the URL
    const appidMatch = window.location.pathname.match(/\/app\/(\d+)/);
    const appid = appidMatch ? appidMatch[1] : null;

    if (!appid) return;

    function addAchievementsLinkToReviews() {
        const observer = new MutationObserver(() => {
            document.querySelectorAll('.leftcol').forEach(review => {
                if (!review.querySelector('.num_achievements')) {
                    const profileLink = review.querySelector('.persona_name a');
                    if (profileLink) {
                        const profileURL = profileLink.href;
                        const achievementsURL = `${profileURL}stats/${appid}/achievements/`;
                        const achievementLink = document.createElement('div');
                        achievementLink.className = 'num_reviews num_achievements';
                        achievementLink.innerHTML = `<a href="${achievementsURL}" target="_blank">View Achievements</a>`;
                        achievementLink.style.marginLeft = '44px';

                        review.appendChild(achievementLink);
                    }
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function addAchievementsLinkToPopup() {
        function processPopups() {
            document.querySelectorAll('.popup_body.popup_menu').forEach(node => {
                if (!node.querySelector('.achievements_link')) {
                    const profileLink = node.querySelector('a[href*="steamcommunity.com/id/"], a[href*="steamcommunity.com/profiles/"]');
                    if (profileLink) {
                        const profileURL = profileLink.href;
                        const achievementsURL = `${profileURL}/stats/${appid}/achievements/`;
                        const achievementMenuItem = document.createElement('a');
                        achievementMenuItem.href = achievementsURL;
                        achievementMenuItem.className = 'popup_menu_item tight achievements_link';
                        achievementMenuItem.textContent = 'View Achievements';
                        node.appendChild(achievementMenuItem);
                    }
                }
            });
        }

        processPopups();
    }

    function addAchievementsLinkToAppHubFriends() {
        const observer = new MutationObserver(() => {
            document.querySelectorAll('.apphub_friend_block').forEach(friendBlock => {
                if (!friendBlock.querySelector('.apphub_achievements_link')) {
                    const profileLink = friendBlock.querySelector('a[href*="steamcommunity.com/id/"], a[href*="steamcommunity.com/profiles/"]');
                    if (profileLink) {
                        const profileURL = profileLink.href;
                        const achievementsURL = `${profileURL}stats/${appid}/achievements/`;
                        const achievementLink = document.createElement('div');
                        achievementLink.className = 'apphub_CardContentMoreLink apphub_achievements_link';
                        achievementLink.innerHTML = `<a href="${achievementsURL}" target="_blank">View Achievements</a>`;

                        friendBlock.appendChild(achievementLink);
                    }
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Function to apply the class to the last matching element inside each .apphub_friend_block
    function updateLastChildClass() {
        document.querySelectorAll('.apphub_friend_block').forEach(block => {
            const links = block.querySelectorAll('.apphub_CardContentMoreLink');
            if (links.length > 1) {
                links.forEach(link => link.classList.remove('last-child-conditional')); // Remove existing class
                links[links.length - 1].classList.add('last-child-conditional'); // Apply to last one
            }
        });
    }

    // Create a MutationObserver to watch for changes in the document
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' || mutation.type === 'subtree') {
                updateLastChildClass(); // Reapply class when elements are added
            }
        }
    });

    // Start observing the entire document for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Run the function initially in case elements already exist
    updateLastChildClass();

    GM_addStyle(`
        .apphub_CardContentMoreLink {
            display: inline-flex; /* Use inline-flex to prevent affecting the parent layout */
            align-items: center;  /* Vertically align the content */
            justify-content: flex-start; /* Align items to the left (or adjust as needed) */
            margin-right: 10px; /* Adjust spacing between links */
            vertical-align: top;
        }

        .apphub_CardContentMoreLink.last-child-conditional {
            padding-left: 0; /* Remove margin from the last link */
            margin-right: 0; /* Remove margin from the last link */
        }

        .apphub_friend_block_container {
            max-width: 100%;
        }
    `);

    if (window.location.hostname.includes('store.steampowered.com')) {
        addAchievementsLinkToReviews();
    } else if (window.location.hostname.includes('steamcommunity.com')) {
        addAchievementsLinkToPopup();
        addAchievementsLinkToAppHubFriends();
    }
})();
