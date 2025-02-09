// ==UserScript==
// @name         Holodex Video Topic Filter
// @version      2.0
// @description  Adds a menu to filter videos by topic on Holodex
// @author       alphabetsoup
// @match        https://holodex.net/*
// @exclude      https://holodex.net/multiview
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/holodex_topic_filter.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/holodex_topic_filter.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 1. Create a <link> tag to load the font from Google Fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap'; // Replace with the font of your choice
    document.head.appendChild(link);

    // 2. Create a <style> tag to apply the font to everything
    const style = document.createElement('style');
    style.textContent = `
      * {
        font-family: 'Roboto', sans-serif;  // Apply your font to all elements
      }
    `;
    document.head.appendChild(style);


    // Variables to store topics
    let liveTopics = [];
    let upcomingTopics;

    // Function to collect video topics
    function collectTopics() {
        const containers = document.querySelectorAll('div.container.py-0.container--fluid');
        const liveContainer = containers[0] || null;
        const upcomingContainer = containers[1] || null;

        // Ensure containers exist before collecting topics
        if (liveContainer) {
            liveTopics = Array.from(liveContainer.querySelectorAll('div.video-topic'))
                .map(el => el.textContent.trim())
        }

        if (upcomingContainer) {
            upcomingTopics = Array.from(upcomingContainer.querySelectorAll('div.video-topic'))
                .map(el => el.textContent.trim())
        }

        // Remove duplicates and sort
        liveTopics = [...new Set(liveTopics)].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        upcomingTopics = [...new Set(upcomingTopics)].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Log topics for debugging
        // console.log("Live Topics:", liveTopics);
        // console.log("Upcoming Topics:", upcomingTopics);
    }

    // Function to initialize the MutationObserver
    function observeTopics() {
        const targetNode = document.body; // Observe the entire document or a specific parent node
        const observerOptions = {
            childList: true, // Watch for direct children being added/removed
            subtree: true // Include all descendants in the observation
        };

        const observer = new MutationObserver(() => {
            collectTopics(); // Recollect topics whenever a mutation is detected
        });

        observer.observe(targetNode, observerOptions);
    }

    // Run the observer on page load
    window.addEventListener('load', () => {
        observeTopics();
    });




    let menuVisible = false;

    // Helper function to create the pop-out menu
    function createMenu(liveTopics, upcomingTopics) {
        // Sort topics alphabetically, ignoring case
        liveTopics.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        upcomingTopics.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Check if the menu already exists
        let menu = document.getElementById('videoTopicMenu');
        if (menu) {
            menu.remove();
            menuVisible = false;
            return;
        }

        // Create the menu container
        menu = document.createElement('div');
        menu.id = 'videoTopicMenu';
        menu.style.position = 'fixed';
        menu.style.top = '50px';
        menu.style.right = '3px';
        menu.style.backgroundColor = '#fff';
        menu.style.border = '1px solid #ccc';
        menu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        menu.style.zIndex = '1000';
        menu.style.maxHeight = '750px';
        menu.style.display = 'flex';
        menu.style.flexDirection = 'column';

        //Inner div
        const innerDiv = document.createElement('div');
        innerDiv.id = 'innerDivId';
        innerDiv.style.overflowY = 'auto';
        innerDiv.style.borderTop = "thick solid #FFFFFF";
        innerDiv.style.borderBottom = "thick solid #FFFFFF";
        innerDiv.style.borderLeft = "thick solid #FFFFFF";
        innerDiv.style.fontSize = "small";
        menu.appendChild(innerDiv);

        // Add a fixed header section for special checkboxes and buttons
        const header = document.createElement('div');
        header.style.position = 'sticky';
        header.style.top = '0px';
        header.style.backgroundColor = '#fff';
        header.style.zIndex = '1010';
        header.style.paddingBottom = '10px';
        header.style.borderBottom = '1px solid #ccc';

        // Add a title
        const title = document.createElement('h4');
        title.textContent = 'Filter by Topic';
        title.style.margin = '0 0 10px 0';
        header.appendChild(title);

        // Add checkboxes for special features
        const liveCheckbox = document.createElement('input');
        liveCheckbox.type = 'checkbox';
        liveCheckbox.checked = true;
        liveCheckbox.setAttribute('data-special', 'true');
        liveCheckbox.addEventListener('change', () => {
            document.querySelectorAll('div.container.py-0.container--fluid')[0].style.display = liveCheckbox.checked ? '' : 'none';
        });
        const liveLabel = document.createElement('label');
        liveLabel.textContent = ' Show/Hide Live';
        liveLabel.prepend(liveCheckbox);
        header.appendChild(liveLabel);
        header.appendChild(document.createElement('br'));

        const upcomingCheckbox = document.createElement('input');
        upcomingCheckbox.type = 'checkbox';
        upcomingCheckbox.checked = true;
        upcomingCheckbox.setAttribute('data-special', 'true');
        upcomingCheckbox.addEventListener('change', () => {
            document.querySelectorAll('div.container.py-0.container--fluid')[1].style.display = upcomingCheckbox.checked ? '' : 'none';
        });
        const upcomingLabel = document.createElement('label');
        upcomingLabel.textContent = ' Show/Hide Upcoming';
        upcomingLabel.prepend(upcomingCheckbox);
        header.appendChild(upcomingLabel);
        header.appendChild(document.createElement('br'));

        // Add check/uncheck all option
        const checkAll = document.createElement('button');
        checkAll.textContent = 'Check All';
        checkAll.style.marginRight = '5px';
        checkAll.addEventListener('click', () => {
            menu.querySelectorAll('input[type="checkbox"]:not([data-special="true"])').forEach(checkbox => {
                checkbox.checked = true;
                toggleVisibility(checkbox.value, true);
            });
        });

        const uncheckAll = document.createElement('button');
        uncheckAll.textContent = 'Uncheck All';
        uncheckAll.addEventListener('click', () => {
            menu.querySelectorAll('input[type="checkbox"]:not([data-special="true"])').forEach(checkbox => {
                checkbox.checked = false;
                toggleVisibility(checkbox.value, false);
            });
        });

        header.appendChild(checkAll);
        header.appendChild(uncheckAll);
        innerDiv.appendChild(header);

        // Add checkboxes for live topics
        if (liveTopics.length > 0) {
            const liveTitle = document.createElement('h5');
            liveTitle.textContent = 'Live Topics';
            liveTitle.style.margin = '10px 0 5px 0';
            innerDiv.appendChild(liveTitle);

            const liveTopicContainer = document.createElement('div');
            liveTopics.forEach(topic => {
                const label = document.createElement('label');
                label.style.display = 'block';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = topic;
                checkbox.checked = true;
                checkbox.addEventListener('change', () => {
                    toggleVisibility(topic, checkbox.checked);
                    syncCheckboxes(topic, checkbox.checked);
                });

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${topic}`));
                liveTopicContainer.appendChild(label);
            });

            innerDiv.appendChild(liveTopicContainer);
        }

        // Add checkboxes for upcoming topics
        if (upcomingTopics.length > 0) {
            const upcomingTitle = document.createElement('h5');
            upcomingTitle.textContent = 'Upcoming Topics';
            upcomingTitle.style.margin = '10px 0 5px 0';
            innerDiv.appendChild(upcomingTitle);

            const upcomingTopicContainer = document.createElement('div');
            upcomingTopics.forEach(topic => {
                const label = document.createElement('label');
                label.style.display = 'block';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = topic;
                checkbox.checked = true;
                checkbox.addEventListener('change', () => {
                    toggleVisibility(topic, checkbox.checked);
                    syncCheckboxes(topic, checkbox.checked);
                });

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${topic}`));
                upcomingTopicContainer.appendChild(label);
            });

            innerDiv.appendChild(upcomingTopicContainer);
        }

        // Add the menu to the page
        document.body.appendChild(menu);
        menuVisible = true;
    }

    // Helper function to toggle visibility of elements with a specific topic
    function updateFinalVisibility(element) {
        if (element.classList.contains('hidden-topic') || element.classList.contains('hidden-language')) {
            element.style.setProperty('display', 'none', 'important');
        } else {
            element.style.removeProperty('display');
        }
    }

    function toggleVisibility(topic, show) {
        const elements = document.querySelectorAll('div.video-col.flex-column.col');
        elements.forEach(el => {
            const topicElement = el.querySelector('div.video-topic');
            if (topicElement && topicElement.textContent.trim() === topic) {
                if (show) {
                    el.classList.remove('hidden-topic');
                } else {
                    el.classList.add('hidden-topic');
                }
            }
            updateFinalVisibility(el); // Recalculate final visibility
        });
    }

    // Helper function to synchronize checkboxes for the same topic
    function syncCheckboxes(topic, checked) {
        document.querySelectorAll(`input[value="${topic}"]`).forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    // Add a button to trigger the menu generation
    const button = document.createElement('button');
    button.textContent = 'Topic';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '154px';
    button.style.zIndex = '1000';
    button.style.padding = '10px';
    button.style.backgroundColor = '#007bff';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    button.style.borderRadius = '4px';
    button.addEventListener('click', () => {
        createMenu(liveTopics, upcomingTopics);
    });

    document.body.appendChild(button);
    collectTopics();
})();
