// ==UserScript==
// @name         [SH] Playlist Links
// @version      1.1
// @description  Adds user and global links to playlist page.
// @author       alphabetsoup
// @match        https://steamhunters.com/playlists*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_playlist_links.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_playlist_links.user.js
// ==/UserScript==

(function () {
  'use strict';

  function addHeaders(table) {
    const headerRow = table.querySelector('thead tr');
    if (!headerRow) return;

    // Prevent duplicate headers
    if (headerRow.querySelector('.mygames-header')) return;

    const myTh = document.createElement('th');
    myTh.textContent = "";
    myTh.classList.add("mygames-header");

    const allTh = document.createElement('th');
    allTh.textContent = "";
    allTh.classList.add("allgames-header");

    const firstTh = headerRow.querySelector('th:first-of-type');
    firstTh.insertAdjacentElement('afterend', allTh);
    firstTh.insertAdjacentElement('afterend', myTh);
  }

  function addLinksToRow(row) {
    if (row.dataset._playlistLinksAdded === '1') return;

    const nameCell = row.querySelector('td:first-child a[href*="playlist="]');
    if (!nameCell) return;

    const url = new URL(nameCell.href, location.origin);
    const playlistId = url.searchParams.get("playlist");
    if (!playlistId) return;

    // Build new cells
    const myTd = document.createElement('td');
    myTd.className = 'mygames-cell';
    const allTd = document.createElement('td');
    allTd.className = 'allgames-cell';

    const myLink = document.createElement('a');
    myLink.href = `https://steamhunters.com/my/games?playlist=${playlistId}&state=all`;
    myLink.textContent = "My";

    const allLink = document.createElement('a');
    allLink.href = `https://steamhunters.com/games?playlist=${playlistId}&state=all`;
    allLink.textContent = "All";

    myTd.appendChild(myLink);
    allTd.appendChild(allLink);

    // Insert after first cell
    const firstTd = row.querySelector('td:first-of-type');
    firstTd.insertAdjacentElement('afterend', allTd);
    firstTd.insertAdjacentElement('afterend', myTd);

    row.dataset._playlistLinksAdded = '1';
  }

  function enhanceTable() {
    const table = document.querySelector('table.table:not(.table-clone)');
    if (!table) return;

    addHeaders(table);
    table.querySelectorAll('tbody tr').forEach(addLinksToRow);
  }

  // Run once
  enhanceTable();

  // Watch for table changes (sorting/filtering redraws headers/rows)
  const observer = new MutationObserver(enhanceTable);
  observer.observe(document.body, { childList: true, subtree: true });
})();
