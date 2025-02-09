// ==UserScript==
// @name         [SH] Copy Achievement Text
// @version      1.0
// @description  Copy achievement names and descriptions to clipboard with a button
// @match        https://steamhunters.com/*/achievements*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_copy_achievement_text.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_copy_achievement_text.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Find the target div to prepend the button
    var targetDiv = document.querySelector('.col-md-4.col-lg-3[style="padding-top: 10px;"]');

    // Create a button to copy text to clipboard
    var copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'btn btn-default btn-xs';
    copyButton.style.display = 'inline-block';
    copyButton.textContent = 'Copy Achievements';
    targetDiv.prepend(copyButton);

    // Add event listener to the button
    copyButton.addEventListener('click', function() {
        // Find all elements with class 'check-item' and extract achievement names and descriptions
        var checkItems = document.querySelectorAll('.check-item');
        var content = '';

        checkItems.forEach(function(item) {
            var achievementNameElement = item.querySelector('.media-body p.achievement-name');
            var achievementName = achievementNameElement.textContent.trim().replace('Steam Community link', '').trim();
            var achievementDescriptionElement = item.querySelector('.media-body p.small');
            var achievementDescription = achievementDescriptionElement.textContent.trim();

            // Remove "This achievement is hidden." from description
            achievementDescription = achievementDescription.replace('This achievement is hidden.', '').trim();

            // Exclude achievements with "This achievement has no description."
            if (achievementDescription !== 'This achievement has no description.') {
                content += `${achievementName} -- ${achievementDescription}\n`;
            } else {
                content += `${achievementName}\n`;
            }
        });

        // Copy the extracted content to the clipboard
        navigator.clipboard.writeText(content)
            .then(function() {
                console.log('Achievements copied to clipboard!');
                var copiedMessage = document.createElement('span');
                copiedMessage.textContent = 'Copied!';
                copiedMessage.style.marginLeft = '10px';
                targetDiv.insertBefore(copiedMessage, copyButton.nextSibling);

                // Remove the "Copied!" message after a few seconds
                setTimeout(function() {
                    targetDiv.removeChild(copiedMessage);
                }, 3000);
            })
            .catch(function(err) {
                console.error('Failed to copy achievements to clipboard:', err);
            });
    });
})();
