// ==UserScript==
// @name         [SH] Copy Tables
// @version      1.0
// @description  Copy SH table with ease (hopefully)
// @author       alphabetsoup
// @match        https://steamhunters.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_copy_tables.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_copy_tables.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Get the parent element where the buttons will be placed
    const parentElement = document.querySelector('div.table-wrapper');

    // Create a div to contain the buttons and align them to the right
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.textAlign = 'right';

    // Create the button to copy all columns except the first
    const copyAllColumnsButton = document.createElement('button');
    copyAllColumnsButton.classList.add('btn', 'btn-default', 'btn-xs', 'collapsed');
    copyAllColumnsButton.type = 'button';
    copyAllColumnsButton.textContent = 'Copy All';

    // Create the button to copy only the text inside the class "text-body"
    const copyTextBodyButton = document.createElement('button');
    copyTextBodyButton.classList.add('btn', 'btn-default', 'btn-xs', 'collapsed');
    copyTextBodyButton.type = 'button';
    copyTextBodyButton.textContent = 'Copy Names';

    // Append both buttons to the buttons container
    buttonsContainer.appendChild(copyAllColumnsButton);
    buttonsContainer.appendChild(copyTextBodyButton);

    // Insert the buttons container at the beginning of the parent element
    parentElement.prepend(buttonsContainer);

    // Add an event listener to the button to copy all columns except the first when clicked
    copyAllColumnsButton.addEventListener('click', function() {
        copyColumns(false);
    });

    // Add an event listener to the button to copy only the text inside the class "text-body" when clicked
    copyTextBodyButton.addEventListener('click', function() {
        copyColumns(true);
    });

    // Function to copy columns based on the parameter (true for text-body, false for all columns)
    function copyColumns(textBodyOnly) {
        // Get the table wrapper element
        const tableWrapper = document.querySelector('div.table-wrapper');

        // Get all table rows inside the table wrapper
        const rows = tableWrapper.querySelectorAll('tbody tr');

        // Initialize an empty string to store the tab-separated values
        let result = '';

        // Loop through each row
        rows.forEach(row => {
            // Get all cells in the row
            const cells = Array.from(row.querySelectorAll('td'));

            // Loop through each cell and append its text content to the result string separated by tabs
            cells.forEach(cell => {
                if (textBodyOnly && cell.classList.contains('text-body')) {
                    result += cell.textContent.trim() + '\t';
                } else if (!textBodyOnly && !cell.hasAttribute('aria-hidden')) {
                    result += cell.textContent.trim() + '\t';
                }
            });

            // Add a new line after each row
            result += '\n';
        });

        // Remove leading tabs, blank lines, and trailing tabs
        result = result.replace(/^\s*[\r\n]+|\t+$/gm, '');

        // Copy the result to the clipboard
        navigator.clipboard.writeText(result);
    }
})();
