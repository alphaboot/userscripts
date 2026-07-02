// ==UserScript==
// @name         [SH] Copy Achievement Text
// @version      1.1
// @description  Copy api names or achievement names and descriptions to clipboard with a button
// @match        https://steamhunters.com/*/achievements*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_copy_achievement_text.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_copy_achievement_text.user.js
// ==/UserScript==

(function () {
    "use strict";

    // Find the target div to prepend the button
    var targetDiv = document.querySelector('.col-md-4.col-lg-3[style="padding-top: 10px;"]');

    // Create the buttons
    var textButton = document.createElement("button");
    textButton.type = "button";
    textButton.className = "btn btn-default btn-xs";
    textButton.style.display = "inline-block";
    textButton.textContent = "Copy Achievements";
    textButton.style.marginRight = "5px";

    var apiButton = document.createElement("button");
    apiButton.type = "button";
    apiButton.className = "btn btn-default btn-xs";
    apiButton.style.display = "inline-block";
    apiButton.textContent = "Copy API";
    apiButton.style.marginRight = "5px";

    var allButton = document.createElement("button");
    allButton.type = "button";
    allButton.className = "btn btn-default btn-xs";
    allButton.style.display = "inline-block";
    allButton.textContent = "Copy All";
    allButton.style.marginRight = "5px";

    // Container to hold buttons and message
    var buttonContainer = document.createElement("span");
    buttonContainer.style.display = "inline-block";
    targetDiv.prepend(buttonContainer);

    // Create and add buttons
    buttonContainer.appendChild(apiButton);
    buttonContainer.appendChild(textButton);
    buttonContainer.appendChild(allButton);

    // Shared function to copy content and show "Copied!" message
    function copyToClipboard(content) {
        navigator.clipboard
            .writeText(content)
            .then(function () {
                console.log("Achievements copied to clipboard!");

                // Remove existing "Copied!" message if present
                var existingMessage = document.getElementById("copied-message");
                if (existingMessage) {
                    existingMessage.remove();
                }

                // Create a new "Copied!" message
                var copiedMessage = document.createElement("span");
                copiedMessage.id = "copied-message"; // ensures we can detect and remove it later
                copiedMessage.textContent = "Copied!";
                copiedMessage.style.marginLeft = "10px";

                buttonContainer.appendChild(copiedMessage);

                // Automatically remove after a few seconds
                setTimeout(function () {
                    if (copiedMessage.parentNode) {
                        copiedMessage.remove();
                    }
                }, 3000);
            })
            .catch(function (err) {
                console.error("Failed to copy achievements to clipboard:", err);
            });
    }

    // Shared: extract all three fields for a single achievement item
    function getAchievementData(item) {
        var apiElement = item.querySelector(".media-left.check-toggle .image.image-64px.border.border-default");
        var apiMatch = apiElement && apiElement.title.match(/API Name:\s*(.*)/);
        var apiName = apiMatch ? apiMatch[1] : "";

        var achievementNameElement = item.querySelector(".media-body p.achievement-name");
        var achievementName = achievementNameElement.textContent.trim().replace("Steam Community link", "").trim();

        var achievementDescriptionElement = item.querySelector(".media-body p.small");
        var achievementDescription = achievementDescriptionElement.textContent.trim();
        achievementDescription = achievementDescription.replace("This achievement is hidden.", "").trim();
        if (achievementDescription === "This achievement has no description.") {
            achievementDescription = "";
        }

        return { apiName: apiName, achievementName: achievementName, achievementDescription: achievementDescription };
    }

    // Shared: build content string from all items using a per-item formatter
    function buildContent(formatItem) {
        var checkItems = document.querySelectorAll(".check-item");
        var content = "";
        checkItems.forEach(function (item) {
            content += formatItem(getAchievementData(item));
        });
        return content;
    }

    // Achievement name/description copy logic
    textButton.addEventListener("click", function () {
        var content = buildContent(function (d) {
            return d.achievementDescription ? `${d.achievementName} -- ${d.achievementDescription}\n` : `${d.achievementName}\n`;
        });
        copyToClipboard(content, textButton);
    });

    // API name copy logic
    apiButton.addEventListener("click", function () {
        var content = buildContent(function (d) {
            return d.apiName ? `${d.apiName}\n` : "";
        });
        if (!content) {
            alert("No API names found.");
            return;
        }
        copyToClipboard(content, apiButton);
    });

    // API name / Achievement name / Description copy logic
    allButton.addEventListener("click", function () {
        var content = buildContent(function (d) {
            return `${d.apiName}\t${d.achievementName}\t${d.achievementDescription}\n`;
        });
        copyToClipboard(content, allButton);
    });
})();
