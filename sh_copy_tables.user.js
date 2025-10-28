// ==UserScript==
// @name         [SH] Copy Tables
// @version      1.1
// @description  Copy SH tables
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

    // Copy All button
    const copyAllColumnsButton = document.createElement('button');
    copyAllColumnsButton.classList.add('btn', 'btn-default', 'btn-xs', 'collapsed');
    copyAllColumnsButton.type = 'button';
    copyAllColumnsButton.textContent = 'Copy All';

    // Copy Names button
    const copyTextBodyButton = document.createElement('button');
    copyTextBodyButton.classList.add('btn', 'btn-default', 'btn-xs', 'collapsed');
    copyTextBodyButton.type = 'button';
    copyTextBodyButton.textContent = 'Copy Names';

    // Copy AppIDs button
    const copyAppIDsButton = document.createElement('button');
    copyAppIDsButton.classList.add('btn', 'btn-default', 'btn-xs', 'collapsed');
    copyAppIDsButton.type = 'button';
    copyAppIDsButton.textContent = 'Copy AppIDs';

    // Append buttons to container
    buttonsContainer.appendChild(copyAllColumnsButton);
    buttonsContainer.appendChild(copyTextBodyButton);
    buttonsContainer.appendChild(copyAppIDsButton);

    // Insert the buttons container at the beginning of the parent element
    parentElement.prepend(buttonsContainer);

    // Event listeners
    copyAllColumnsButton.addEventListener('click', () => copyColumns(false));
    copyTextBodyButton.addEventListener('click', () => copyColumns(true));
    copyAppIDsButton.addEventListener('click', copyAppIDs);

    // Function to copy columns based on the parameter
    function copyColumns(textBodyOnly) {
        const tableWrapper = document.querySelector('div.table-wrapper');
        const rows = tableWrapper.querySelectorAll('tbody tr');
        let result = '';

        rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            cells.forEach(cell => {
                if (textBodyOnly && cell.classList.contains('text-body')) {
                    result += cell.textContent.trim() + '\t';
                } else if (!textBodyOnly && !cell.hasAttribute('aria-hidden')) {
                    result += cell.textContent.trim() + '\t';
                }
            });
            result += '\n';
        });

        result = result.replace(/^\s*[\r\n]+|\t+$/gm, '');
        navigator.clipboard.writeText(result);
    }

    // Function to copy appids
    function copyAppIDs() {
        const tableWrapper = document.querySelector('div.table-wrapper');
        const links = tableWrapper.querySelectorAll('td.text-body a[href*="/apps/"]');
        const appIDs = [];

        links.forEach(link => {
            const match = link.href.match(/\/apps\/(\d+)\//);
            if (match) appIDs.push(match[1]);
        });

        const result = appIDs.join('\n');
        navigator.clipboard.writeText(result);
    }
})();
