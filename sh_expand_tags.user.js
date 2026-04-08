// ==UserScript==
// @name         [SH] Expand Tags
// @version      1.80
// @description  Show all tags instead of "+1" on SH
// @author       alphabetsoup
// @match        https://steamhunters.com/apps/*/achievements*
// @match        https://steamhunters.com/*/apps/*/achievements*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_expand_tags.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_expand_tags.user.js
// ==/UserScript==

(function() {
    'use strict';
    function expandTags() {
        document.querySelectorAll('span.hidden-xs.title').forEach(span => {
            let tooltipContent = null;
            let nextIcon = span.nextElementSibling;
            if (nextIcon && nextIcon.tagName === 'I' && nextIcon.hasAttribute('title')) {
                tooltipContent = nextIcon.getAttribute('title');
            }
            if (tooltipContent) {
                let parser = new DOMParser();
                let doc = parser.parseFromString(tooltipContent, 'text/html');
                let tags = [...doc.querySelectorAll('div span')]
                    .map(el => el.textContent.trim().replace(/\s*\(\d+\s*votes?\)/, ''))
                    .filter(tag => tag.length > 0);
                if (tags.length > 0) {
                    let icon = span.querySelector('i.fa-tag');
                    span.textContent = tags.join(' -- ') + ' ';
                    if (icon) span.appendChild(icon);
                }
            }
        });
    }

    const observer = new MutationObserver(() => {
        if (document.querySelector('span.hidden-xs.title')) {
            observer.disconnect(); // Stop observing once found
            expandTags();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
