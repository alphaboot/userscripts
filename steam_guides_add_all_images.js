// ==UserScript==
// @name         [Steam] Add All Images in Guides
// @version      1.9
// @description  Adds a button that generates the bbcode for all uploaded images
// @author       alphabetsoup
// @match        https://steamcommunity.com/sharedfiles/editguidesubsection/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to ensure the DOM is fully loaded before executing the script
    function runWhenDOMReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    // Function to toggle selected class on options
    function toggleSelectedOption(container, selectedOption) {
        container.querySelectorAll('.previewImageInsertOption').forEach(option => {
            option.classList.remove('selected');
        });
        selectedOption.classList.add('selected');
    }

    // Function to create the button and the box inside each panel
    function createButtonAndBox(panelId, panelTitle) {
        // Get the panel
        const panel = document.getElementById(panelId);
        if (!panel) return;

        // Create button
        const button = document.createElement('button');
        button.innerText = `Add All ${panelTitle}`;
        button.style.margin = '10px';

        // Calculate the width for the display box
        const bodyWidth = document.body.clientWidth;

        // Create box for display, positioned on the right side of the screen
        const displayBox = document.createElement('div');
        displayBox.style.display = 'none';
        displayBox.style.flexDirection = 'column';
        displayBox.style.backgroundColor = '#c2c2c2';
        displayBox.style.border = '1px solid #ccc';
        displayBox.style.padding = '10px';
        displayBox.style.position = 'fixed';
        displayBox.style.top = '10px';
        displayBox.style.left = '10px';
        displayBox.style.width = `calc((${bodyWidth}px - 940px) / 2 - 20px - 10px - 10px - 2px)`; // body width - table width - padding - right margin - left margin - border
        displayBox.style.height = '90%';    // Prevent overflow
        displayBox.style.overflowY = 'auto';   // Add scrolling if needed
        displayBox.style.zIndex = '1000';      // Make sure it appears on top
        displayBox.style.resize = 'both';      // Make the panel resizable
        displayBox.style.boxSizing = 'border-box'; // Ensure padding and border are included in width/height

        // Function to update text based on size and alignment choices
        function updateTextBox(images, sizeChoice, alignChoice) {
            const sizeMap = {
                half: 'sizeThumb',
                full: 'sizeFull',
                original: 'sizeOriginal'
            };
            const alignMap = {
                left: 'floatLeft',
                right: 'floatRight',
                inline: 'inline'
            };

            const size = sizeMap[sizeChoice];
            const alignment = alignMap[alignChoice];
            const tag = (alignChoice === 'inline') ? 'previewicon' : 'previewimg';

            return images
                .filter(img => img.id && img.id !== 'No ID') // Exclude images with "No ID"
                .map(img => {
                    const imgId = img.id;
                    const imgTitle = img.title || 'No Title';
                    return `[${tag}=${imgId};${size},${alignment};${imgTitle}][/${tag}]`;
                })
                .join('\n');
        }

        // Create global size and alignment options
        function createGlobalOptions(container, images, textBox) {
            const optionsHTML = `
                <div class="previewImageInsertColumn left" style="text-align: left; padding: 0;">
                    Size
                    <div class="previewImageInsertOption selected">
                        <input type="radio" name="previewImageSizeOption" id="imageSizeThumb" value="sizeThumb" checked="yes">
                        <label for="imageSizeThumb">half-width</label>
                    </div>
                    <div class="previewImageInsertOption">
                        <input type="radio" name="previewImageSizeOption" id="imageSizeFull" value="sizeFull">
                        <label for="imageSizeFull">full-width</label>
                    </div>
                    <div class="previewImageInsertOption">
                        <input type="radio" name="previewImageSizeOption" id="imageSizeOriginal" value="sizeOriginal">
                        <label for="imageSizeOriginal">original size</label>
                    </div>
                </div>
                <div class="previewImageInsertColumn" style="text-align: left; padding: 0;">
                    Alignment
                    <div class="previewImageInsertOption selected">
                        <input type="radio" name="previewImageLayoutOption" id="layoutLeft" value="floatLeft" checked="yes">
                        <label for="layoutLeft">left</label>
                    </div>
                    <div class="previewImageInsertOption">
                        <input type="radio" name="previewImageLayoutOption" id="layoutRight" value="floatRight">
                        <label for="layoutRight">right</label>
                    </div>
                    <div class="previewImageInsertOption">
                        <input type="radio" name="previewImageLayoutOption" id="layoutInline" value="inline">
                        <label for="layoutInline">inline</label>
                    </div>
                </div>
                <div style="clear: left"></div>
            `;
            const optionsContainer = document.createElement('div');
            optionsContainer.innerHTML = optionsHTML;
            container.appendChild(optionsContainer);

            let globalSize = 'half'; // Default size
            let globalAlignment = 'left'; // Default alignment

            // Add event listeners for size options
            optionsContainer.querySelectorAll('input[name="previewImageSizeOption"]').forEach(sizeRadio => {
                const parentDiv = sizeRadio.parentElement;
                sizeRadio.addEventListener('change', () => {
                    globalSize = sizeRadio.value === 'sizeThumb' ? 'half' : sizeRadio.value === 'sizeFull' ? 'full' : 'original';
                    toggleSelectedOption(parentDiv.parentElement, parentDiv); // Change selected class
                    textBox.value = updateTextBox(images, globalSize, globalAlignment);
                });

                // Allow clicking the label to select the radio button
                parentDiv.addEventListener('click', () => {
                    sizeRadio.checked = true;
                    sizeRadio.dispatchEvent(new Event('change'));
                });
            });

            // Add event listeners for alignment options
            optionsContainer.querySelectorAll('input[name="previewImageLayoutOption"]').forEach(alignRadio => {
                const parentDiv = alignRadio.parentElement;
                alignRadio.addEventListener('change', () => {
                    globalAlignment = alignRadio.value === 'floatLeft' ? 'left' : alignRadio.value === 'floatRight' ? 'right' : 'inline';
                    toggleSelectedOption(parentDiv.parentElement, parentDiv); // Change selected class
                    textBox.value = updateTextBox(images, globalSize, globalAlignment);
                });

                // Allow clicking the label to select the radio button
                parentDiv.addEventListener('click', () => {
                    alignRadio.checked = true;
                    alignRadio.dispatchEvent(new Event('change'));
                });
            });
        }

        // Button click event
        button.addEventListener('click', function() {
            // Close any other open display boxes
            document.querySelectorAll('.displayBox').forEach(box => {
                if (box !== displayBox) {
                    box.style.display = 'none'; // Hide other display boxes
                }
            });

            displayBox.style.display = displayBox.style.display === 'none' ? 'flex' : 'none';

            if (displayBox.innerHTML === '') {
                // Global options container
                const optionsContainer = document.createElement('div');
                displayBox.appendChild(optionsContainer);

                // Container for all images
                const images = Array.from(panel.querySelectorAll('img'));

                if (images.length === 0) {
                    // Display a message if no images are found
                    displayBox.innerHTML = 'No images found in this panel.';

                    return;
                }

                // Create a single textarea for all formatted text
                const textBox = document.createElement('textarea');
                textBox.style.width = 'calc(100% - 6px)';
                textBox.style.resize = 'none'; // Prevent resizing
                textBox.style.flex = '1';
                textBox.style.overflowX = 'clip';
                textBox.style.whiteSpace = 'pre';
                textBox.readOnly = false;
                textBox.value = updateTextBox(images, 'half', 'left'); // Default values

                // Append the text box to the display box
                displayBox.appendChild(textBox);

                // Create the global size and alignment options
                createGlobalOptions(optionsContainer, images, textBox);
            }
        });

        // Append button inside the panel
        panel.appendChild(button);
        // Append displayBox to the body so it's not confined to the panel
        displayBox.className = 'displayBox'; // Add a class for easier querying
        document.body.appendChild(displayBox);
    }

    // Apply the function to each panel when the DOM is ready
    runWhenDOMReady(() => {
        createButtonAndBox('PreviewImagesPanel', 'Images');
        createButtonAndBox('ScreenshotsPanel', 'Screenshots');
        createButtonAndBox('VideosPanel', 'Videos');
    });
})();
