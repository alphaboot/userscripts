// ==UserScript==
// @name         [Steam] AScouts Curations Box
// @version      4.00
// @description  Creates a dropdown box to show curator content on Steam store pages
// @author       alphabetsoup
// @match        https://store.steampowered.com/app/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/alphaboot/userscripts/main/steam_curation_box.user.js
// @downloadURL  https://raw.githubusercontent.com/alphaboot/userscripts/main/steam_curation_box.user.js
// ==/UserScript==

(function () {
  "use strict";

  const CURATORS_JSON_URL =
    "https://raw.githubusercontent.com/alphaboot/userscripts/main/curators.json";

  function computeSidebarWidth() {
    const bodyWidth = document.body.getBoundingClientRect().width;
    const titleArea = document.querySelector(
      ".page_title_area.game_title_area.page_content",
    );
    const width = titleArea ? titleArea.getBoundingClientRect().width : 0;
    return `calc((${bodyWidth}px - ${width}px) / 2 - 20px)`;
  }

  let sidebarWidth = computeSidebarWidth();
  document.documentElement.style.setProperty(
    "--curator-sidebar-width",
    sidebarWidth,
  );

  window.addEventListener("resize", () => {
    const newWidth = computeSidebarWidth();
    if (newWidth !== sidebarWidth) {
      sidebarWidth = newWidth;
      document.documentElement.style.setProperty(
        "--curator-sidebar-width",
        sidebarWidth,
      );
    }
  });

  GM_addStyle(`
    .curator-dropdown {
      position: fixed;
      bottom: 10px;
      left: 10px;
      padding: 10px;
      z-index: 1001;

      background-color: #16202d;
      color: #c7d5e0;
      border: 1px solid #000000;

      cursor: pointer;

      width: var(--curator-sidebar-width);
      min-width: 300px;
    }

    #curatorContentBox {
      position: fixed;
      bottom: 47px;
      left: 10px;

      box-sizing: border-box;

      width: var(--curator-sidebar-width);
      min-width: 300px;

      height: auto;

      background: #16202d;
      border: 1px solid black;

      z-index: 1000;

      display: block;
      font-family: "Motiva Sans", sans-serif;
    }

    #curatorContentBox .referring_curator {
      display: flex;
      flex-direction: column;

      padding: 10px;

      width: auto;
      height: auto;

      background: unset;
      margin: unset;
      box-shadow: unset;
    }

    #curatorContentBox .curator_top {
      display: flex;
      flex-direction: row;
      align-items: flex-start;

      width: 100%;
    }

    #curatorContentBox .curator_avatar_link {
      display: block;
      flex-shrink: 0;

      margin-right: 8px;
    }

    #curatorContentBox .curator_avatar {
      width: 40px;
      height: 40px;

      display: block;

      border-radius: 2px;
    }

    #curatorContentBox .curator_info {
      display: flex;
      flex-direction: column;

      min-width: 0;
    }

    #curatorContentBox .curator_recommendation_status {
      text-transform: uppercase;
      font-size: 17px;
      letter-spacing: 1.5px;
      font-weight: 500;
      font-style: normal;
    }

    #curatorContentBox .recommendation_recommended {
      color: #66c0f4;
    }

    #curatorContentBox .recommendation_not_recommended {
      color: #f49866;
    }

    #curatorContentBox .recommendation_informational {
      color: #f5df67;
    }

    #curatorContentBox .curator_details {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      gap: 4px;
    }

    #curatorContentBox .curator_name {
      font-weight: bold;
    }

    #curatorContentBox .curator_date {
      font-size: 11px;
      color: #8f98a0;
    }

    #curatorContentBox .curator_blurb {
      font-size: 13px;
      line-height: normal;

      margin: 8px 0 0 0;
      padding: 0;

      text-indent: 0;
    }

    #curatorContentBox .curator_buttons {
      display: flex;
      flex-direction: row;
      gap: 5px;

      margin-top: 5px;
    }

    #curatorContentBox .curator_button {
      display: inline-block;

      padding: 4px 8px;

      background: #2a475e;
      border: 1px solid #000000;

      color: #c7d5e0;
      text-decoration: none;

      font-size: 12px;
    }

    #curatorContentBox .curator_button:hover {
      background: #417a9b;
      color: #ffffff;
    }
  `);

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  const RECOMMENDATION_LABELS = {
    0: { text: "RECOMMENDED", className: "recommendation_recommended" },
    1: { text: "NOT RECOMMENDED", className: "recommendation_not_recommended" },
    2: { text: "INFORMATIONAL", className: "recommendation_informational" },
  };

  function createButton(href, label) {
    const button = document.createElement("a");
    button.className = "curator_button";
    button.href = href;
    button.target = "_blank";
    button.rel = "noopener noreferrer";
    button.textContent = label;
    return button;
  }

  function extractCurators(doc = document) {
    const curatorLinks = doc.querySelectorAll(
      '.steam_curators_block a[href*="/curator/"]',
    );

    return Array.from(curatorLinks).map((link) => {
      const urlParts = link.href.split("/curator/")[1].split("/");
      const id = urlParts[0].split("-")[0];
      const name = decodeURIComponent(urlParts[0]);
      return { id, name };
    });
  }

  function buildCuratorElement(curatorData) {
    const { curator, recommendation, curator_preferences: preferences } = curatorData;

    if (!curator || !recommendation) {
      return null;
    }

    const curatorElement = document.createElement("div");
    curatorElement.className = "referring_curator";

    // --- Top section (avatar + name/status) ---
    const curatorTop = document.createElement("div");
    curatorTop.className = "curator_top";

    if (curator.avatar_sha) {
      const avatarLink = document.createElement("a");
      avatarLink.className = "curator_avatar_link";
      if (curator.link) {
        avatarLink.href = curator.link;
        avatarLink.target = "_blank";
      }

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

    const curatorName = document.createElement(curator.link ? "a" : "span");
    curatorName.className = "curator_name";
    if (curator.link) {
      curatorName.href = curator.link;
      curatorName.target = "_blank";
    }
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

    // --- Blurb ---
    if (recommendation.blurb) {
      const blurb = document.createElement("p");
      blurb.className = "curator_blurb";
      blurb.textContent = recommendation.blurb;
      curatorElement.appendChild(blurb);
    }

    // --- Buttons ---
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

  function renderCuratorBox(referringCurators) {
    const existingBox = document.getElementById("curatorContentBox");
    if (existingBox) {
      existingBox.remove();
    }

    const curatorBox = document.createElement("div");
    curatorBox.id = "curatorContentBox";

    referringCurators.forEach((node) => {
      const props = node.getAttribute("data-props");
      if (!props) {
        return;
      }

      try {
        const curatorData = JSON.parse(props);
        const curatorElement = buildCuratorElement(curatorData);
        if (curatorElement) {
          curatorBox.appendChild(curatorElement);
        }
      } catch (e) {
        console.error("Error parsing curator data:", e, props);
      }
    });

    if (curatorBox.children.length > 0) {
      document.body.appendChild(curatorBox);
    }
  }

  function fetchCuratorContent(curatorClanId) {
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.get("curator_clanid") === String(curatorClanId)) {
      const referringCurators = document.querySelectorAll(
        '[data-featuretarget="referring-curator-review"]',
      );
      if (referringCurators.length > 0) {
        console.log("Using curator reviews already present in DOM:", referringCurators.length);
        renderCuratorBox(referringCurators);
        return;
      }
    }

    const baseUrl = window.location.href.split("?")[0];
    const curatorURL = `${baseUrl}?curator_clanid=${curatorClanId}`;

    console.log("Fetching curator content from:", curatorURL);

    fetch(curatorURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        const doc = new DOMParser().parseFromString(data, "text/html");
        const referringCurators = doc.querySelectorAll(
          '[data-featuretarget="referring-curator-review"]',
        );

        console.log("Found curator reviews:", referringCurators.length);

        renderCuratorBox(referringCurators);
      })
      .catch((error) => console.error("Error fetching curator content:", error));
  }

  function createDropdown(options, predefinedCurators) {
    const select = document.createElement("select");
    select.className = "curator-dropdown";

    const defaultOption = document.createElement("option");
    defaultOption.text = "Select a Curator";
    defaultOption.value = "";
    select.appendChild(defaultOption);

    options.forEach((option) => {
      const opt = document.createElement("option");
      opt.text = option.name;
      opt.value = option.id;
      select.appendChild(opt);
    });

    select.addEventListener("change", function () {
      if (this.value) {
        fetchCuratorContent(this.value);
      }
    });

    document.body.appendChild(select);

    const predefinedInExtracted = predefinedCurators.find((predefined) =>
      options.some((extracted) => extracted.id === predefined.id),
    );

    if (predefinedInExtracted) {
      select.value = predefinedInExtracted.id;
      fetchCuratorContent(predefinedInExtracted.id);
    }
  }

  function init(predefinedCurators) {
    const urlParams = new URLSearchParams(window.location.search);
    const hasCuratorClanId = urlParams.has("curator_clanid");

    if (hasCuratorClanId) {
      const baseUrl = window.location.href.split("?")[0];
      console.log("Fetching base URL from:", baseUrl);

      fetch(baseUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }
          return response.text();
        })
        .then((data) => {
          const doc = new DOMParser().parseFromString(data, "text/html");
          const curators = extractCurators(doc);
          if (curators.length > 0) {
            createDropdown(curators, predefinedCurators);
          }
        })
        .catch((error) => console.error("Error fetching base page content:", error));
    } else {
      const curators = extractCurators();
      if (curators.length > 0) {
        createDropdown(curators, predefinedCurators);
      }
    }
  }

  // ---------------------------------------------------------------------
  // Kick things off
  // ---------------------------------------------------------------------

  GM_xmlhttpRequest({
    method: "GET",
    url: CURATORS_JSON_URL,
    onload: function (response) {
      if (response.status < 200 || response.status >= 300) {
        console.error(
          "Failed to fetch curators.json, status:",
          response.status,
        );
        return;
      }

      let fetchedCurators;
      try {
        fetchedCurators = JSON.parse(response.responseText);
      } catch (e) {
        console.error("Error parsing curators.json:", e);
        return;
      }
      console.log("fetchedCurators:", fetchedCurators);
      init(fetchedCurators);
    },
    onerror: function (error) {
      console.error("Error fetching curators:", error);
    },
  });
})();
