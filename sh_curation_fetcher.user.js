// ==UserScript==
// @name         [SH] AScouts Curation Fetcher
// @version      4.00
// @description  Display curations on SteamHunters
// @author       alphabetsoup
// @match        https://steamhunters.com/apps/*
// @match        https://steamhunters.com/id/*/apps/*
// @match        https://steamhunters.com/profiles/*/apps/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      store.steampowered.com
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_curation_fetcher.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/sh_curation_fetcher.user.js
// ==/UserScript==

(function () {
  "use strict";

  const appIdMatch = window.location.pathname.match(/\/apps\/(\d+)\//);
  const appId = appIdMatch ? appIdMatch[1] : null;

  if (!appId) return;

  const steamUrl = `https://store.steampowered.com/app/${appId}/`;
  const parser = new DOMParser();

  let container;
  let contentWrapper;
  let stylesInjected = false;

  const RECOMMENDATION_LABELS = {
    0: { text: "RECOMMENDED", className: "recommendation_recommended" },
    1: { text: "NOT RECOMMENDED", className: "recommendation_not_recommended" },
    2: { text: "INFORMATIONAL", className: "recommendation_informational" },
  };

  GM_addStyle(`
    @import url('https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
  `);

  // ---------------------------------------------------------------------
  // Container / toggle button
  // ---------------------------------------------------------------------

  function ensureContainer() {
    if (container) return;

    container = document.createElement("div");
    container.id = "curatorDetailContainer";

    const toggleButton = document.createElement("button");
    toggleButton.id = "toggleButton";
    toggleButton.innerHTML = '<i class="fa fa-chevron-down" aria-hidden="true"></i>'; // Minimize icon

    contentWrapper = document.createElement("div");
    contentWrapper.id = "curationContent";

    toggleButton.addEventListener("click", () => {
      if (container.classList.contains("minimized")) {
        // Maximize content
        container.classList.remove("minimized");
        toggleButton.innerHTML = '<i class="fa fa-chevron-down" aria-hidden="true"></i>'; // Minimize icon
        contentWrapper.style.display = "";
      } else {
        // Minimize content
        container.classList.add("minimized");
        toggleButton.innerHTML = '<i class="fa fa-chevron-up" aria-hidden="true"></i>'; // Maximize icon
        contentWrapper.style.display = "none";
      }
    });

    container.appendChild(toggleButton);
    container.appendChild(contentWrapper);
    document.body.appendChild(container);

    injectStyles();
  }

  function injectStyles() {
    const bodyWidth = document.body.getBoundingClientRect().width;
    const containerTable = document.querySelector(".container-table");
    const contentEl = containerTable || document.querySelector(".container");
    const width = contentEl
      ? contentEl.getBoundingClientRect().width - (containerTable ? 0 : 30)
      : 0;

    GM_addStyle(`
    @import url("https://store.akamai.steamstatic.com/public/shared/css/motiva_sans.css");

    #curatorDetailContainer {
        position: fixed;
        bottom: 10px;
        left: 10px;
        width: calc((${bodyWidth}px - ${width}px)/2 - 20px); /* half the screen minus sh content, minus 10 on each side for padding */
        min-width: 350px;
        max-height: 400px;
        overflow-y: auto;
        background: rgb(22, 32, 45);
        border: 1px solid black;
        border-radius: 5px;
        z-index: 9999;
        color: white;
        display: flex;
        flex-direction: column;
        font-family: "Motiva Sans", sans-serif;
        color: #c6d4df;
      }

      #curatorDetailContainer.minimized {
        border: 1px dashed gray !important;
        height: 40px !important;
        width: 41px !important;
        min-width: unset !important;
      }

      #toggleButton {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 10px;
        background-color: #444;
        color: white;
        border: none;
        padding: 2px 5px;
        border-radius: 3px;
        cursor: pointer;
        z-index: 1;
      }

      #toggleButton:hover {
        background-color: #666;
      }

      #curatorDetailContainer .referring_curator {
        display: flex;
        flex-direction: column;

        padding: 10px;

        width: auto;
        height: auto;

        background: unset;
        margin: unset;
        box-shadow: unset;
      }

      #curatorDetailContainer .curator_top {
        display: flex;
        flex-direction: row;
        align-items: flex-start;

        width: 100%;
      }

      #curatorDetailContainer .curator_avatar_link {
        display: block;
        flex-shrink: 0;

        margin-right: 8px;
      }

      #curatorDetailContainer .curator_avatar {
        width: 40px;
        height: 40px;

        display: block;

        border-radius: 2px;
      }

      #curatorDetailContainer .curator_info {
        display: flex;
        flex-direction: column;

        min-width: 0;
      }

      #curatorDetailContainer .curator_recommendation_status {
        text-transform: uppercase;
        font-size: 17px;
        letter-spacing: 1.5px;
        font-weight: 500;
        font-style: normal;
      }

      #curatorDetailContainer .recommendation_recommended {
        color: #66c0f4;
      }

      #curatorDetailContainer .recommendation_not_recommended {
        color: #f49866;
      }

      #curatorDetailContainer .recommendation_informational {
        color: #f5df67;
      }

      #curatorDetailContainer .curator_details {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        flex-wrap: wrap;
      }

      #curatorDetailContainer .curator_name {
        font-weight: bold;
      	text-decoration: none;
        color: #ffffff;
      }

      #curatorDetailContainer .curator_name:hover {
        text-decoration: none;
        color: #66c0f4;
      }

      #curatorDetailContainer .curator_date {
        font-size: 11px;
        color: #8f98a0;
      }

      #curatorDetailContainer .curator_blurb {
        font-size: 13px;
        line-height: normal;

        margin: 8px 0 0 0;
        padding: 0;

        text-indent: 0;
      }

      #curatorDetailContainer .curator_buttons {
        display: flex;
        flex-direction: row;
        gap: 5px;

        margin-top: 5px;
      }

      #curatorDetailContainer .curator_button {
        display: inline-block;

        padding: 4px 8px;

        background: #2a475e;
        border: 1px solid #000000;

        color: #c7d5e0;
        text-decoration: none;

        font-size: 12px;
      }

      #curatorDetailContainer .curator_button:hover {
        background: #417a9b;
        color: #ffffff;
      }
    `);
  }

  // ---------------------------------------------------------------------
  // Curator review element builder
  // ---------------------------------------------------------------------

  function createButton(href, label) {
    const button = document.createElement("a");
    button.className = "curator_button";
    button.href = href;
    button.target = "_blank";
    button.rel = "noopener noreferrer";
    button.textContent = label;
    return button;
  }

  function buildCuratorElement(curatorData) {
    const { curator, recommendation, curator_preferences: preferences } = curatorData;

    if (!curator || !recommendation) {
      return null;
    }

    const curatorElement = document.createElement("div");
    curatorElement.className = "referring_curator";

    const curatorTop = document.createElement("div");
    curatorTop.className = "curator_top";

    if (curator.avatar_sha) {
      const avatarLink = document.createElement("a");
      avatarLink.href = curator.link;
      avatarLink.target = "_blank";
      avatarLink.className = "curator_avatar_link";

      const avatar = document.createElement("img");
      avatar.className = "curator_avatar";
      avatar.src = `https://avatars.akamai.steamstatic.com/${curator.avatar_sha}_full.jpg`;
      avatar.alt = curator.name;

      avatarLink.appendChild(avatar);
      curatorTop.appendChild(avatarLink);
    }

    const curatorInfo = document.createElement("div");
    curatorInfo.className = "curator_info";

    const label = RECOMMENDATION_LABELS[recommendation.recommendation_state];
    if (label) {
      const status = document.createElement("div");
      status.className = `curator_recommendation_status ${label.className}`;
      status.textContent = label.text;
      curatorInfo.appendChild(status);
    }

    const curatorDetails = document.createElement("div");
    curatorDetails.className = "curator_details";

    const curatorName = document.createElement("a");
    curatorName.className = "curator_name";
    curatorName.href = curator.link;
    curatorName.target = "_blank";
    curatorName.textContent = curator.name;
    curatorDetails.appendChild(curatorName);

    if (recommendation.time_recommended) {
      const date = new Date(recommendation.time_recommended * 1000);
      const dateElement = document.createElement("span");
      dateElement.className = "curator_date";
      dateElement.textContent = ` · ${date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric"
      })}`;
      curatorDetails.appendChild(dateElement);
    }

    curatorInfo.appendChild(curatorDetails);
    curatorTop.appendChild(curatorInfo);
    curatorElement.appendChild(curatorTop);

    if (recommendation.blurb) {
      const blurb = document.createElement("p");
      blurb.className = "curator_blurb";
      blurb.textContent = recommendation.blurb;
      curatorElement.appendChild(blurb);
    }

    const curatorButtons = document.createElement("div");
    curatorButtons.className = "curator_buttons";

    if (recommendation.link_url) {
      curatorButtons.appendChild(createButton(recommendation.link_url, "Full Review"));
    }

    if (preferences && preferences.website_url) {
      curatorButtons.appendChild(createButton(preferences.website_url + "apps/" + recommendation.appid + "#curation", "View on AScouts"));
    }

    if (preferences && preferences.discussion_url) {
      curatorButtons.appendChild(createButton(preferences.discussion_url, "Discord"));
    }

    if (curatorButtons.children.length > 0) {
      curatorElement.appendChild(curatorButtons);
    }

    return curatorElement;
  }

  // ---------------------------------------------------------------------
  // Fetch pipeline
  // ---------------------------------------------------------------------

  function fetchCuratorReview(curatorID) {
    GM_xmlhttpRequest({
      method: "GET",
      url: `${steamUrl}?curator_clanid=${curatorID}`,
      onload: function (response) {
        if (response.status !== 200) {
          console.warn(`AScouts: unexpected status fetching curator ${curatorID}:`, response.status);
          return;
        }

        const doc = parser.parseFromString(response.responseText, "text/html");
        const referringCurators = doc.querySelectorAll(
          '[data-featuretarget="referring-curator-review"]',
        );

        if (referringCurators.length === 0) return;

        referringCurators.forEach((node) => {
          const props = node.getAttribute("data-props");
          if (!props) return;

          try {
            const curatorData = JSON.parse(props);
            const curatorElement = buildCuratorElement(curatorData);
            if (curatorElement) {
              ensureContainer();
              contentWrapper.appendChild(curatorElement);
            }
          } catch (e) {
            console.error("AScouts: error parsing curator data:", e, props);
          }
        });
      },
      onerror: function (err) {
        console.error(`AScouts: failed to fetch curator ${curatorID} review:`, err);
      },
    });
  }

  function init(predefinedCurators) {
    const predefinedIds = new Set(predefinedCurators.map((c) => c.id));
    const fetchedIds = new Set();

    GM_xmlhttpRequest({
      method: "GET",
      url: steamUrl,
      onload: function (response) {
        if (response.status !== 200) return;

        const doc = parser.parseFromString(response.responseText, "text/html");
        const steamCuratorsBlock = doc.querySelector(".steam_curators_block");
        if (!steamCuratorsBlock) return;

        const links = steamCuratorsBlock.querySelectorAll('a[href*="/curator/"]');

        links.forEach((link) => {
          const url = new URL(link.href);
          const fullCuratorID = url.pathname.split("/")[2];
          const curatorID = fullCuratorID.split("-")[0];

          if (predefinedIds.has(curatorID) && !fetchedIds.has(curatorID)) {
            fetchedIds.add(curatorID);
            fetchCuratorReview(curatorID);
          }
        });
      },
      onerror: function (err) {
        console.error("AScouts: failed to fetch store page:", err);
      },
    });
  }

  GM_xmlhttpRequest({
    method: "GET",
    url: "https://raw.githubusercontent.com/alphaboot/userscripts/refs/heads/main/curators.json",
    onload: function (response) {
      let predefinedCurators;
      try {
        predefinedCurators = JSON.parse(response.responseText);
      } catch (e) {
        console.error("AScouts: error parsing curators.json:", e);
        return;
      }
      init(predefinedCurators);
    },
    onerror: function (err) {
      console.error("AScouts: failed to fetch curators.json:", err);
    },
  });
})();
