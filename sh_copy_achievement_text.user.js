// ==UserScript==
// @name         [SH] Copy Achievement Text
// @version      1.1
// @description  Copy api names or achievement names and descriptions to clipboard with a button
// @match        https://steamhunters.com/*/achievements*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_copy_achievement_text.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_copy_achievement_text.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Find the target div to prepend the button
    var targetDiv = document.querySelector('.col-md-4.col-lg-3[style="padding-top: 10px;"]');

    // Create the buttons
    var copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'btn btn-default btn-xs';
    copyButton.style.display = 'inline-block';
    copyButton.textContent = 'Copy Achievements';

    var apiCopyButton = document.createElement('button');
    apiCopyButton.type = 'button';
    apiCopyButton.className = 'btn btn-default btn-xs';
    apiCopyButton.style.display = 'inline-block';
    apiCopyButton.textContent = 'Copy API';
    apiCopyButton.style.marginRight = '5px';

    // Container to hold buttons and message
    var buttonContainer = document.createElement('span');
    buttonContainer.style.display = 'inline-block';
    targetDiv.prepend(buttonContainer);

    // Create and add buttons
    buttonContainer.appendChild(apiCopyButton);
    buttonContainer.appendChild(copyButton);

    // Shared function to copy content and show "Copied!" message
    function copyToClipboard(content) {
        navigator.clipboard.writeText(content)
            .then(function() {
                console.log('Achievements copied to clipboard!');

                // Remove existing "Copied!" message if present
                var existingMessage = document.getElementById('copied-message');
                if (existingMessage) {
                    existingMessage.remove();
                }

                // Create a new "Copied!" message
                var copiedMessage = document.createElement('span');
                copiedMessage.id = 'copied-message'; // ensures we can detect and remove it later
                copiedMessage.textContent = 'Copied!';
                copiedMessage.style.marginLeft = '10px';

                buttonContainer.appendChild(copiedMessage);

                // Automatically remove after a few seconds
                setTimeout(function() {
                    if (copiedMessage.parentNode) {
                        copiedMessage.remove();
                    }
                }, 3000);
            })
            .catch(function(err) {
                console.error('Failed to copy achievements to clipboard:', err);
            });
    }

    // Achievement name/description copy logic
    copyButton.addEventListener('click', function() {
        var checkItems = document.querySelectorAll('.check-item');
        var content = '';

        checkItems.forEach(function(item) {
            var achievementNameElement = item.querySelector('.media-body p.achievement-name');
            var achievementName = achievementNameElement.textContent.trim().replace('Steam Community link', '').trim();
            var achievementDescriptionElement = item.querySelector('.media-body p.small');
            var achievementDescription = achievementDescriptionElement.textContent.trim();

            achievementDescription = achievementDescription.replace('This achievement is hidden.', '').trim();

            if (achievementDescription !== 'This achievement has no description.') {
                content += `${achievementName} -- ${achievementDescription}\n`;
            } else {
                content += `${achievementName}\n`;
            }
        });

        copyToClipboard(content, copyButton);
    });

    // API name copy logic
    apiCopyButton.addEventListener('click', function () {
        var apiNames = Array.from(document.querySelectorAll('.media-left.check-toggle .image.image-64px.border.border-default'))
            .map(function (el) {
                var match = el.title.match(/API Name:\s*(.*)/);
                return match ? match[1] : null;
            })
            .filter(Boolean);

        var content = apiNames.join('\n') + '\n';
        if (!content) {
            alert('No API names found.');
            return;
        }

        copyToClipboard(content, apiCopyButton);
    });

})();
