// ==UserScript==
// @name         Trackers Everywhere
// @namespace    https://completionist.me/tools
// @icon         https://completionist.me/images/completionist-logo-120.png
// @version      2.40.0
// @description  Trackers Everywhere integration
// @author       luchaos
// @match        https://completionist.me/steam/*
// @match        http://astats.astats.nl/astats/*
// @match        https://astats.astats.nl/astats/*
// @match        http://store.steampowered.com/*
// @match        https://store.steampowered.com/*
// @match        http://steamcommunity.com/*
// @match        https://steamcommunity.com/*
// @match        https://steamdb.info/app/*
// @match        https://steamdb.info/calculator/*
// @match        http://retroachievements.org/*
// @match        https://retroachievements.org/*
// @supportUrl   https://completionist.me/feedback
// @updateURL    https://completionist.me/userscript/trackers.user.js
// @downloadURL  https://completionist.me/userscript/trackers.user.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @require      https://peterolson.github.io/BigInteger.js/BigInteger.min.js
// @run-at       document-end
// ==/UserScript==

'use strict'
var version = '2.40.0'
var url = new URL(window.location.href.toLowerCase())
var fragment = url.pathname.match(/([^\/]*)\/*$/)[1]
var fragments = url.pathname.split('/')

var steam = (function () {

  var isUserInstanceId = function (profileId) {
    if (profileId > 0 && bigIntCapable()) {
      return bigInt(profileId).toString() === userInstanceProfileId(profileId)
    }
    return true
  }

  var userInstanceProfileId = function (profileId) {
    return bigInt(profileId).and(0xffffffff).add(bigInt('110000100000000', 16)).toString()
  }

  var bigIntCapable = function () {
    return bigInt('110000100000000', 16).toString() === '76561197960265728'
  }

  return {
    isUserIstanceId: isUserInstanceId,
    userInstanceProfileId: userInstanceProfileId,
  }
})()

var steamStore = (function () {

  var id = 'steamstore'
  var name = 'Steam Store'

  var inject = function (provider) {
    var providerKey = provider.id + '-' + id
    if ($('head meta[content="' + providerKey + '"]').length) {
      return
    }
    provider.params({appId: fragments[2]})
    injectHubHeaderAppLink(provider)
    // injectSidebarWidget(provider);
    injectSidebarAchievements(provider)
    $('head').append('<meta name="userscript" content="' + providerKey + '">')
    injectAppsAnalyzer(provider)
  }

  var injectHubHeaderAppLink = function (provider) {
    var steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    var providerLink = $('<a class="btnv6_blue_hoverfade btn_medium" style="margin-left: 3px" href="' + steamAppLink + '" title="View on ' + provider.name + '" target="_blank">' +
      '<span data-tooltip-text="View on ' + provider.name + '">' + provider.icon(16) + '</span>' +
      '</a>')
    var linkContainer = $('.apphub_OtherSiteInfo .userscript')
    if (!linkContainer.length) {
      linkContainer = $('<span class="userscript"></span>')
      $('.apphub_OtherSiteInfo').prepend(linkContainer)
      linkContainer = $('.apphub_OtherSiteInfo .userscript')
    }
    linkContainer.append(providerLink)
  }

  var injectSidebarWidget = function (provider) {
    var steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    var rightColWidget = $('<div class="block responsive_apppage_details_left"></div>')
    rightColWidget.append('<div class="block_header"><h4>' + provider.icon(28) + ' ' + provider.name + ' <small style="color:#5c5c5c">userscript v' + version + '</small></h4></div>')
    var rightColWidgetContent = $('<div class="block_content"><div class="block_content_inner"></div></div>')
    var linksBlock = $('<div class="details_block"></div>')
    var providerLink = $('<a class="linkbar" target="_blank" href="' + steamAppLink + '" style="display: block; margin-bottom: 6px;">App on ' + provider.name + ' <img src="https://steamstore-a.akamaihd.net/public/images/v5/ico_external_link.gif" border="0" align="bottom"></a>')
    linksBlock.append(providerLink)
    rightColWidgetContent.append(linksBlock)
    rightColWidget.append(rightColWidgetContent)
    $('.page_content > .rightcol.game_meta_data').prepend(rightColWidget)
  }

  var injectSidebarAchievements = function (provider) {
    var steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    var providerLink = '<div class="game_area_details_specs">' +
      '<div class="icon" style="padding-left: 10px">' +
      '<a href="' + steamAppLink + '">' + provider.icon(16) + '</a>' +
      '</div>' +
      '<a class="name" href="' + steamAppLink + '" target="_blank">' + provider.name + '</a>' +
      '</div>'
    $('.page_content > .rightcol.game_meta_data #achievement_block').append(providerLink)
  }

  var injectAppsAnalyzer = function (provider) {
    if (provider.id !== 'cme') {
      return
    }
    var g_AccountID = window.eval('window.g_AccountID')
    $.get('https://store.steampowered.com/dynamicstore/userdata/?id=' + g_AccountID, function (data) {
      var content = $('<form class="content" action="https://completionist.me/steam/recover/store" method="post" target="_blank"></form>')
      content.append($('<input type="hidden" name="app_ids" value="' + data.rgOwnedApps.join(',') + '" readonly>'))
      // content.append($('<input type="hidden" name="account_id" value="' + g_AccountID + '" readonly>'));
      var submitButton = $('<button type="submit" class="btn_grey_white_innerfade btn_small" style="width: 100%"><span style="padding: 6px">' + provider.icon(22) + ' Check ' + data.rgOwnedApps.length + ' apps</span></button>')
      content.append(submitButton)
      var analyzer = $('<div></div>')
      analyzer.append(content)
      $('.home_page_gutter').prepend(analyzer)
    })
  }

  return {
    id: id,
    name: name,
    inject: inject
  }
})()

var steamCommunity = (function () {

  var id = 'steamcommunity'
  var name = 'Steam Community'

  var profileId = typeof g_rgProfileData !== 'undefined' ? g_rgProfileData.steamid : false
  if (profileId > 0 && !steam.isUserIstanceId(profileId)) {
    var userInstanceProfileId = steam.userInstanceProfileId(profileId)
    var message = '<div class="userscript-steamid-message" style="position: absolute; top: 30vh;left:0;right:0; background: rgba(0,0,0,0.7); z-index:999; color: white; text-align:center; padding: 50px 20px;">' +
      '<p style="margin-bottom: 6px; color: orange; font-size: 20px"><b>Wrong Steam ID!</b></p>' +
      '<p style="margin-bottom: 6px">' +
      'Should be <code style="color: lightgreen; background: black">' + userInstanceProfileId + '</code> ' +
      'instead of <code style="color: lightcoral;  background: black">' + profileId + '</code>' +
      '</p>' +
      '<p style="margin-bottom: 12px">' +
      '<a style="color: lightblue; text-decoration: underline" href="https://steamcommunity.com/profiles/' + userInstanceProfileId + '">' +
      'Go to the correct one' +
      '</a>' +
      '</p>' +
      '<p style="margin-bottom: 6px; font-style: italic">' +
      'Came here via Discord?<br>' +
      '<a style="color: lightblue; font-style: italic; text-decoration: underline" href="https://github.com/discordapp/discord-api-docs/issues/271" target="_blank">See related issue</a>' +
      '</p>' +
      '</div>'
    if (!$('body > .userscript-steamid-message').length) {
      $('body').prepend(message)
    }
    profileId = userInstanceProfileId
  }

  var fragment = fragments[1] === 'app' ? 'app' : fragment
  var resourceMap = {
    'app': 'app',
    'games': 'profile-apps',
    'wishlist': 'profile-apps'
  }
  var resource = resourceMap[fragment] || 'profile'

  var inject = function (provider) {
    var providerKey = provider.id + '-' + id
    if ($('head meta[content="' + providerKey + '"]').length) {
      return
    }
    provider.banner()
    switch (resource) {
      case 'app':
        provider.params({appId: fragments[2]})
        injectHubHeaderAppLink(provider)
        break
      case 'profile':
        provider.params({profileId: profileId})
        injectProfileCountsLink(provider)
        injectAppsAnalyzer(provider)
        break
      case 'profile-apps':
        provider.params({profileId: profileId})
        injectAppsListLinks(provider)
        break
    }
    $('head').append('<meta name="userscript" content="' + providerKey + '">')
  }

  var injectHubHeaderAppLink = function (provider) {
    var steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    var providerLink = $('<a class="btnv6_blue_hoverfade btn_medium" style="margin-left: 3px" ' +
      'href="' + steamAppLink + '" ' +
      'title="View on ' + provider.name + '" target="_blank">' +
      '<span data-tooltip-text="View on ' + provider.name + '">' +
      '<img class="ico16" style="vertical-align:-10px;background: none;" src="' + provider.iconUrl + '">' +
      '</span>' +
      '</a>')
    var linkContainer = $('.apphub_OtherSiteInfo .userscript')
    if (!linkContainer.length) {
      linkContainer = $('<span class="userscript"></span>')
      $('.apphub_OtherSiteInfo').prepend(linkContainer)
      linkContainer = $('.apphub_OtherSiteInfo .userscript')
    }
    linkContainer.append(providerLink)
  }

  var injectProfileCountsLink = function (provider) {
    var linkContainer = $('<div class="profile_count_link"></div>')
    var providerLink = $('<a class="" target="_blank" href="' + provider.steamProfileLink() + '" style="display: block;"><span class="count_link_label">' + provider.name + ' <span class="profile_count_link_total">' + provider.icon(20) + '</span></span></a>')
    linkContainer.append(providerLink)
    $('.profile_item_links').append(linkContainer)
  }

  var injectAppsListLinks = function (provider) {
    var steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    $('.gameListRow, .wishlist_row').each(function () {
      var appUrl = new URL($('a.pullup_item', this).attr('href'))
      var appId = appUrl.pathname.match(/([^\/]*)\/*$/)[1]
      var providerLink = $('<a class="pullup_item" target="_blank" style="padding-bottom: 4px" href="' + provider.steamAppLink(appId, profileId) + '"><div class="menu_ico" style="padding: 0 7px 0 6px">' + provider.icon(16) + '</div>' + provider.name + '</a>')
      $('.bottom_controls', this).append(providerLink)
    })
  }

  var injectAppsAnalyzer = function (provider) {
    if (provider.id !== 'cme') {
      return
    }
    var g_rgAchievementShowcaseGamesWithAchievements = window.eval('window.g_rgAchievementShowcaseGamesWithAchievements')
    if (!g_rgAchievementShowcaseGamesWithAchievements) {
      return
    }
    var ids = g_rgAchievementShowcaseGamesWithAchievements.map(function (app) {
      return app.appid
    }).sort(function (a, b) {
      return a - b
    })
    var content = $('<form class="content" action="https://completionist.me/steam/recover/profile" method="post" target="_blank"></form>')
    content.append($('<input type="hidden" name="app_ids" value="' + ids.join(',') + '" readonly>'))
    content.append($('<input type="hidden" name="profile_id" value="' + profileId + '" readonly>'))
    var submitButton = $('<button type="submit" class="btn_grey_white_innerfade btn_small" style="width: 100%"><span>Check ' + ids.length + ' apps on completionist.me</span></button>')
    content.append(submitButton)
    var analyzer = $('<div class="rightbox" style="margin-top:20px"><div class="rightbox_content_header">' + provider.icon(22) + ' completionist.me Apps Analyzer</div></div>')
    analyzer.append(content)
    $('.rightcol').append(analyzer)
  }

  return {
    id: id,
    name: name,
    inject: inject
  }
})()

/**
 * Includes contributions, inspirations and help from: Rudey, Sellyme, SnowyLuma
 * @type {{steamAppLink, name, icon, banner, steamProfileLink, id, iconUrl, params, inject, enhance}}
 */
const astats = (function () {

  const id = 'astats'
  const name = 'AStats'
  const iconUrl = 'data:image/png;base64,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'
  let _appId, _gameId, _profileId, _resource
  let _userProfileId

  let displayType
  const gamesQueryState = {
    AchievementsOnly: 0, // show/hide only games with achievements
    CappedFilter: 0,
    CTO: 0, // compare to SteamID64
    DisplayType: 0,
    GTF: 0, // game type filter
    Hidden: 0, // show/hide hidden and completed games
    IncludeAll: 0, // show/hide demos & betas
    Limit: 0, // use/do not use limit
    NotOwnedBy: 0,
    PerfectOnly: 0, // not exposed anywhere - usable for comparison
    Sort: 0,
    SPL: 0, // show/hide playlist
    SPB: 0, // show/hide playlist buttons
    ToPlay: 0, // show/hide playlist
    SteamID64: 0,
  }

  let gameDisplayOptionsState = {
    filterReorder: false,
    gridFlex: false,
    markExpired: false,
    showAllColumns: false,
  }
  const gameDisplayOptions = [
    {
      key: 'gridFlex',
      label: 'Full Grid',
      description: 'Transform Grid to full size and allow reordering by Highlight',
      displayType: 'games-grid',
    },
    {
      key: 'filterReorder',
      label: 'Reorder By Highlight',
      description: 'Highlight games in specific progress stats. Only works with Full Grid Option',
      displayType: 'games-grid',
    },
    {
      key: 'markExpired',
      label: 'Mark Expired',
      description: 'Highlights games with strike-through yellow and add "(expired)"',
      displayType: 'games-list',
      reloadOnChange: true,
    },
    {
      key: 'showAllColumns',
      label: 'Show All Columns',
      description: 'Show/hide hidden columns: Score, Hours to 100%, Last Achievement and Date Completed',
      displayType: 'games-list',
    },
  ]

  let gameProgressFilterState = {
    owned: false,
  }
  const gameProgressFilters = [
    {
      key: 'completed',
      label: 'Completed',
      description: 'Hightlight/Mute completed games',
    },
    {
      key: 'in-progress',
      label: 'In Progress',
      description: 'Hightlight/Mute in-progress games (at least one achievement unlocked, not completed)',
    },
    {
      key: 'untouched',
      label: 'Untouched',
      description: 'Hightlight/Mute untouched games (no achievements and/or no unlocks)',
    },
  ]

  const params = function (params) {
    _appId = params && params.appId
    _gameId = params && params.gameId
    _profileId = params && params.profileId
    _resource = params && params.resource
  }

  const banner = function () {
    // console.log("%c   ", "font-size:57px;background-image:url(" + iconUrl + ");background-size:contain;background-repeat:no-repeat;background-position:center");
    console.log('%c ' + name + ' %c Userscript v' + version + ' ', 'font-size:11px;color:#000000;background:#40A2A5;padding:1px;border-radius:3px 0 0 3px;', 'font-size:11px;color:#FFF;background:#111;padding:1px;border-radius:0 3px 3px 0;')
  }

  const steamAppLink = function (appId, profileId) {
    return 'https://astats.astats.nl/astats/Steam_Game_Info.php?Tab=2' + (profileId ? '&SteamID64' + profileId : '') + '&AppID=' + (appId || _appId) + '&utm_campaign=userscript'
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://astats.astats.nl/astats/User_Info.php?' + (linkProfileId ? 'steamID64=' + linkProfileId : '') + '&utm_campaign=userscript'
  }

  const icon = function (size) {
    const iconSize = size || 16
    return '<i class="" style="display:inline-block;width:' + iconSize + 'px;height:' + iconSize + 'px;vertical-align:middle;background-image:url(' + iconUrl + ');background-size: ' + iconSize + 'px ' + iconSize + 'px;"></i>'
  }

  const detectParams = function () {

    const ucUrl = new URL(window.location.href)
    for (let param in gamesQueryState) {
      gamesQueryState[param] = ucUrl.searchParams.get(param)
    }

    const resourceMap = {
      'steam_games.php': 'apps',
      'steam_game_info.php': 'app',
      'steam_achievement_info.php': 'app',
      'user_games.php': 'profile-apps',
      'user_info.php': 'profile',
    }

    _appId = url.searchParams.get('appid')
    _profileId = url.searchParams.get('steamid64')
    _resource = resourceMap[fragment]

    // in case it's a ProfileID address
    _userProfileId = getProfileContextFromFooter()

    if (!parseInt(_profileId)) {
      _profileId = _userProfileId || _profileId
    }

    // default to logged in user
    if (!parseInt(_profileId)) {
      _profileId = getProfileContextFromNavigation() || _profileId
    }

    if (_profileId > 0 && !steam.isUserIstanceId(_profileId)) {
      const userInstanceProfileId = steam.userInstanceProfileId(_profileId)
      const message = '<div class="userscript-steamid-message" style="position: absolute; top: 30vh;left:0;right:0; background: rgba(0,0,0,0.7); z-index:999; color: white; text-align:center; padding: 50px 20px;">' +
        '<p style="margin-bottom: 6px; color: orange; font-size: 20px"><b>Wrong Steam ID!</b></p>' +
        '<p style="margin-bottom: 6px">' +
        'Should be <code style="color: lightgreen; background: black">' + userInstanceProfileId + '</code> ' +
        'instead of <code style="color: lightcoral;  background: black">' + _profileId + '</code>' +
        '</p>' +
        '<p style="margin-bottom: 12px">' +
        '<a style="color: lightblue; text-decoration: underline" href="https://astats.astats.nl/astats/User_Info.php?steamID64=' + userInstanceProfileId + '">' +
        'Go to the correct one' +
        '</a>' +
        '</p>' +
        '<p style="margin-bottom: 6px; font-style: italic">' +
        'Came here via Discord and/or Enhanced Steam?<br> ' +
        '<a style="color: lightblue; font-style: italic; text-decoration: underline" href="https://github.com/discordapp/discord-api-docs/issues/271" target="_blank">See related issue</a>' +
        '</p>' +
        '</div>'
      if (!$('body > .userscript-steamid-message').length) {
        $('body').prepend(message)
      }
      _profileId = userInstanceProfileId
    }
  }

  /**
   * get profile context profile id from footer links
   */
  const getProfileContextFromFooter = function () {
    const footerLink = $('body>center>p>a').attr('href')
    if (footerLink) {
      const footerProfileUrl = new URL(window.location.origin + '/' + footerLink.toLowerCase())
      return footerProfileUrl.searchParams.get('steamid64')
    }
  }

  /**
   * get user context profile id from navigation
   */
  const getProfileContextFromNavigation = function () {
    const navLink = $('.navbar-right .dropdown-menu li:first-child a').attr('href')
    if (navLink) {
      const navProfileUrl = new URL(window.location.origin + '/' + navLink.toLowerCase())
      return navProfileUrl.searchParams.get('steamid64')
    }
  }

  /**
   * enhance
   */
  const enhance = function () {
    const enhanceKey = 'enhanced-' + id
    if ($('head meta[content="' + enhanceKey + '"]').length) {
      return
    }
    $('head').append('<meta name="userscript" content="' + enhanceKey + '">')
    banner()
    detectParams()
    xray()
    /**
     * don't go into uncharted territory. dragons be there
     * userscript nopes out of unknown display types to not mess with untouched pages (vote info etc)
     */
    if (!displayType) {
      return
    }
    applyStyles()
    switch (_resource) {
      case 'profile':
        break
      case 'app':
      case 'profile-app':
        break
      case 'apps':
        enhanceAppsList()
        break
      case 'profile-apps':
        enhanceAppsList()
        break
    }
  }

  const xray = function () {
    switch (_resource) {
      case 'profile':
        break
      case 'app':
      case 'profile-app':
        break
      case 'apps':
        displayType = 'games-grid'
        break
      case 'profile-apps':
        displayType = 'games-' + ((gamesQueryState.DisplayType === '2' || gamesQueryState.DisplayType === 'all') && gamesQueryState.GTF < 1 ? 'grid' : 'list')
        break
    }

    if (!displayType) {
      return
    }

    // mark container tables
    $('table.Default800, table.Default1000').addClass('container-table')
    $('.Pager').first().next().addClass('container-table').addClass(displayType)

    // apps
    $('.Coloured').addClass('container-table').addClass(displayType)

    // profile-apps games-list
    if (_resource === 'profile-apps') {
      $('.tablesorter').addClass(displayType)
    }

    // profile-apps games-grid own
    $('body > center > center > center > center > table:not(.Pager)').addClass('container-table').addClass(displayType)

    // profile-apps games-grid others
    $('body > center > center > center > center > center > table:not(.Pager)').addClass('container-table').addClass(displayType)

    // mark games
    $('.games-grid > tbody > tr > td').addClass('game')
    $('.games-list > tbody > tr').addClass('game')

    // mark game headers
    $('.games-grid .game a > img').addClass('game-header')
      .removeAttr('width')
      .removeAttr('height')

    // mark games progress
    let gameNameSelector = '.game'
    if (displayType === 'games-list') {
      gameNameSelector = '.game > td:nth-child(2)'
    }
    if (displayType === 'games-grid') {
      gameNameSelector = '.game tr:first-child'
    }
    $(gameNameSelector + ' font[color=""]').closest('.game').addClass('game-owned game-untouched')
    $(gameNameSelector + ' font[color="#d1cf31"]').closest('.game').addClass('game-owned game-untouched')
    $(gameNameSelector + ' font[color="#FF0000"]').closest('.game').addClass('game-owned game-untouched')
    $(gameNameSelector + ' font[color="#347C17"]').closest('.game').addClass('game-owned game-in-progress game-in-progress-0')
    $(gameNameSelector + ' font[color="#38d131"]').closest('.game').addClass('game-owned game-in-progress game-in-progress-25')
    $(gameNameSelector + ' font[color="#42a3ff"]').closest('.game').addClass('game-owned game-in-progress game-in-progress-50')
    $(gameNameSelector + ' font[color="#20e2e2"]').closest('.game').addClass('game-owned game-in-progress game-in-progress-75')
    $(gameNameSelector + ' font[color="#B23AEE"]').closest('.game').addClass('game-owned game-completed')
  }

  const applyStyles = function () {
    $('body').append('<style>' +
      '.container-table, .Default800, .Default1000, .tablesorter-blue' +
      '{width: 100% !important; max-width: 1000px; margin: 0 auto}' +
      '.userscript-settings' +
      '{display: flex; flex-wrap: wrap; justify-content: center; margin: 0 auto 15px;}' +
      '.userscript-settings .btn-group' +
      '{margin: 15px 7px 0}' +
      '.tablesorter > thead > tr > *' +
      '{vertical-align: middle !important; padding: 3px 10px; font-weight: bold;}' +
      '.tablesorter > tbody > tr > td:not(:first-child)' +
      '{vertical-align: middle !important; padding: 0 10px}' +
      '.tablesorter > tbody > tr:hover' +
      '{background-color: transparent !important}' +
      '.tablesorter > tbody > tr > td:first-child' +
      '{padding: 0}' +
      '.games-list' +
      '{max-width: 1500px;}' +
      // '.games-list.tablesorter td:nth-child(2)' +
      // '{width: 100%}' +
      '.games-list.tablesorter td:not(:nth-child(2)):not(:nth-child(13))' +
      '{white-space: nowrap}' +
      '.games-grid' +
      '{margin: 20px auto; display: flex; justify-content: center; flex-wrap: wrap}' +
      '.games-grid .game' +
      '{position: relative; width: 200px; margin: 0 4px 8px}' +
      '.games-grid .game-header' +
      '{width: 100%;margin-bottom: 3px; height: 75px; background: #555}' +
      '.game-expired del' +
      '{color: #FFFF00}' +
      '.game-muted' +
      '{opacity: 0.1}' +
      '.game-muted-reorder' +
      '{order: 2}' +
      '.game-muted:hover' +
      '{opacity: 1}' +
      '.game > table > tbody > tr > td' +
      '{padding: 0}' +
      '.btn-default.active' +
      '{color: white;}' +
      '.btn-default.active:hover, .btn-default:active.focus, .btn-default:active:focus, .btn-default:active:hover, .open>.dropdown-toggle.btn-default.focus, .open>.dropdown-toggle.btn-default:focus, .open>.dropdown-toggle.btn-default:hover' +
      '{color: inherit;background-color: inherit;border-color: inherit;}' +
      '</style>')
  }

  const enhanceAppsList = function () {
    addGameSettings()

    if (_resource === 'profile-apps') {
      if (displayType === 'games-grid') {
        /**
         * replace links for profile games grids
         * fixes missing tab param & url encoding issue
         */
        $('.game a[href^="User_Achievements_Per_Game"]').each(function () {
          $(this).attr('href', $(this).attr('href').replace('User_Achievements_Per_Game', 'Steam_Game_Info') + '&Tab=2')
        })
      }

      if (displayType === 'games-list') {
        /**
         * patch games list table when comparing
         * cell for "Date Completed" is missing (never set either)
         */
        if (comparing()) {
          $('.games-list > tbody > tr').append('<td></td>')
        }
      }
    }
  }

  const addGameSettings = function () {
    const $gameSettings = $('<div class="userscript-settings text-center"></div>')

    injectGameQueryOptions($gameSettings)
    injectGameDisplayOptions($gameSettings)
    injectGameProgressFilters($gameSettings)

    applyDisplayOption()
    gameMarkExpired()

    /**
     * inject userscript settings
     */
    if ($('.Pager').length) {
      $('.Pager').first().before($gameSettings)
    } else if ($('.games-list, .games-grid').length) {
      $('.games-list, .games-grid').before($gameSettings)
    } else {
      $('body > center > center > center').prepend($gameSettings)
    }
  }

  /**
   * game query options
   * derived from url
   */
  const injectGameQueryOptions = function ($gameSettings) {
    if (_resource === 'apps') {
      injectGameQueryOptionsForApps($gameSettings)
    }
    if (_resource === 'profile-apps') {
      injectGameQueryOptionsForProfileApps($gameSettings)
    }
  }

  const injectGameQueryOptionsForApps = function ($gameSettings) {
    /**
     * sort options
     */
    const sortOptions = [
      {
        id: 1,
        label: 'Achievements',
      },
      {
        id: 3,
        label: 'App ID',
      },
      {
        id: 7,
        label: 'AStats Score',
      },
      {
        id: 10,
        label: 'Broken Achievements',
        displayType: 'Achievements'
      },
      {
        id: 2,
        label: 'Name',
      },
      {
        id: 5,
        label: 'Owners',
      },
      {
        id: 6,
        label: 'Players',
      },
      {
        id: 8,
        label: 'Playtime Average ',
      },
      {
        id: 4,
        label: 'Points',
        displayType: 'Achievements'
      },
      {
        id: 9,
        label: 'Time to 100%',
        displayType: 'Achievements'
      },
      {
        id: 11,
        label: 'HPCP (100% completion percentage)',
        displayType: 'Achievements'
      },
      {
        id: 12,
        label: 'HPCP + Time to 100% (weighted)',
        displayType: 'Achievements'
      },
    ]
    const selectedSortOption = parseInt(gamesQueryState.Sort || 1)
    let activeSortOption = sortOptions.find(function (sortOptions) {
      return sortOptions.id === selectedSortOption
    })
    if (!activeSortOption) {
      activeSortOption = {
        id: selectedSortOption,
        label: 'Unknown Option',
      }
    }
    const $sortOption = $('<span class="btn-group btn-group-sm game-type"></span>')
    const $sortOptionButton = $('<button type="button" data-toggle="dropdown"' +
      'class="btn btn-default dropdown-toggle btn-game-type active" ' +
      'title="Display Games of specific type"' +
      '>' +
      activeSortOption.label + ' <span class="caret"></span>' +
      '</button>')
    $sortOption.append($sortOptionButton)
    const $sortOptionDropdown = $('<ul class="dropdown-menu"></ul>')
    sortOptions.forEach(function (sortOptions) {
      const $sortOptions = $('<li class="' + (sortOptions.id === activeSortOption.id ? 'active' : '') + '">' +
        '<a href="' + gamesLink({Sort: sortOptions.id}) + '">' +
        sortOptions.label +
        '</a>' +
        '</li>')
      $sortOptionDropdown.append($sortOptions)
    })
    $sortOption.append($sortOptionDropdown)

    const $sortOptionWrap = $('<div></div>')
    $sortOptionWrap.append($sortOption)
    $sortOptionWrap.append('<div><small class="text-muted">Sort</small></div>')
    $gameSettings.append($sortOptionWrap)

    /**
     * filters
     */
    const $gamesFilters = $('<span class="btn-group btn-group-sm game-filters"></span>')

    const $ownedButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (gamesQueryState.SteamID64 > 0 ? 'active' : '') + '" ' +
      'title="Show Owned Games only"' +
      'href="' + gamesLink({
        SteamID64: gamesQueryState.SteamID64 > 0 ? 0 : _profileId,
        NotOwnedBy: gamesQueryState.SteamID64 > 0 ? gamesQueryState.NotOwnedBy : 0
      }) + '">' +
      'Owned' +
      '</a>')
    $gamesFilters.append($ownedButton)

    const $notOwnedButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (gamesQueryState.NotOwnedBy > 0 ? 'active' : '') + '" ' +
      'title="Show Not Owned Games only"' +
      'href="' + gamesLink({
        SteamID64: 0,
        NotOwnedBy: gamesQueryState.NotOwnedBy > 0 ? 0 : _profileId
      }) + '">' +
      'Not Owned' +
      '</a>')
    $gamesFilters.append($notOwnedButton)

    const $achievementsOnlyButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (gamesQueryState.AchievementsOnly > 0 ? 'active' : '') + '" ' +
      'title="Shown Games with Achievements only"' +
      'href="' + gamesLink({AchievementsOnly: gamesQueryState.AchievementsOnly ? 0 : 1}) + '">' +
      'Achievements' +
      '</a>')
    $gamesFilters.append($achievementsOnlyButton)

    const $tradingCardsButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (gamesQueryState.DisplayType === 'Cards' ? 'active' : '') + '" ' +
      'title="Shown Games with Trading Cards only"' +
      'href="' + gamesLink({DisplayType: gamesQueryState.DisplayType === 'Cards' ? 'Achievements' : 'Cards'}) + '">' +
      'Trading Cards' +
      '</a>')
    $gamesFilters.append($tradingCardsButton)

    const $gamesFiltersWrap = $('<div></div>')
    $gamesFiltersWrap.append($gamesFilters)
    $gamesFiltersWrap.append('<div><small class="text-muted">Filter (exclusive)</small></div>')
    $gameSettings.append($gamesFiltersWrap)

    /**
     * remove existing elements
     */
    setTimeout(function () {
      if ($('body > h3').length) {
        $('body > h3')
          .nextUntil('.userscript-settings')
          .remove()
      } else {
        $('body > h1')
          .nextUntil('.userscript-settings')
          .remove()
      }
    })
  }

  const injectGameQueryOptionsForProfileApps = function ($gameSettings) {

    /**
     * Compare
     */
    if (comparable()) {
      const $compareGamesFilters = $('<span class="btn-group btn-group-sm game-filters"></span>')

      const $compareButton = $('<a ' +
        'class="btn btn-default btn-game-owned ' + (gamesQueryState.CTO > 0 ? 'active' : '') + '" ' +
        'title="Show only games you have as well"' +
        'href="' + gamesLink({CTO: gamesQueryState.CTO > 0 ? 0 : _userProfileId}) + '">' +
        'Compare' +
        '</a>')
      $compareGamesFilters.append($compareButton)

      const $compareGamesFiltersWrap = $('<div></div>')
      $compareGamesFiltersWrap.append($compareGamesFilters)
      $compareGamesFiltersWrap.append('<div><small class="text-muted">Compare</small></div>')
      $gameSettings.append($compareGamesFiltersWrap)
    }

    /**
     * filters
     */
    const $profileGamesFilters = $('<span class="btn-group btn-group-sm game-filters"></span>')

    const $achievementsButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (gamesQueryState.AchievementsOnly > 0 ? 'active' : '') + '" ' +
      'title="Shown Games with Achievements only"' +
      'href="' + gamesLink({AchievementsOnly: gamesQueryState.AchievementsOnly ? 0 : 1}) + '">' +
      'Achievements' +
      '</a>')
    $profileGamesFilters.append($achievementsButton)

    const $profileGamesFiltersWrap = $('<div></div>')
    $profileGamesFiltersWrap.append($profileGamesFilters)
    $profileGamesFiltersWrap.append('<div><small class="text-muted">Filter</small></div>')
    $gameSettings.append($profileGamesFiltersWrap)

    /**
     * include filters
     * not applicable when comparing with another profile
     */
    if (!comparing()) {
      const $includeGamesFilters = $('<span class="btn-group btn-group-sm game-filters"></span>')

      const $demoBetaButton = $('<a ' +
        'class="btn btn-default btn-game-limit ' + (gamesQueryState.IncludeAll > 0 ? 'active' : '') + '" ' +
        'title="Show/Hide Demos and Betas"' +
        'href="' + gamesLink({
          IncludeAll: gamesQueryState.IncludeAll > 0 ? 0 : 1,
        }) + '">' +
        'Demos & Betas' +
        '</a>')
      $includeGamesFilters.append($demoBetaButton)

      const $hiddenCompletedButton = $('<a ' +
        'class="btn btn-default btn-game-limit ' + (gamesQueryState.Hidden > 0 ? 'active' : '') + '" ' +
        'title="Show/Hide Demos and Betas"' +
        'href="' + gamesLink({
          Hidden: gamesQueryState.Hidden > 0 ? 0 : 1,
        }) + '">' +
        'Hidden & Completed' +
        '</a>')
      $includeGamesFilters.append($hiddenCompletedButton)

      const $includeGamesFiltersWrap = $('<div></div>')
      $includeGamesFiltersWrap.append($includeGamesFilters)
      $includeGamesFiltersWrap.append('<div><small class="text-muted">Include</small></div>')
      $gameSettings.append($includeGamesFiltersWrap)
    }

    /**
     * game type filters
     */
    if (displayType === 'games-list') {
      const gameTypeOptions = [
        {
          id: 0,
          label: 'All',
        },
        {
          id: 2,
          label: 'Demo',
        },
        {
          id: 4,
          label: 'Beta',
        },
        {
          id: 16,
          label: 'Steamworks',
        },
        {
          id: 1,
          label: 'Removed',
        },
        {
          id: 512,
          label: 'MP Required',
        },
      ]
      const selectedGameTypeOption = parseInt(gamesQueryState.GTF || 0)
      let activeGameTypeOption = gameTypeOptions.find(function (gameTypeOption) {
        return gameTypeOption.id === selectedGameTypeOption
      })
      if (!activeGameTypeOption) {
        activeGameTypeOption = {
          id: selectedGameTypeOption,
          label: 'Unknown Option',
        }
      }
      const $gameType = $('<span class="btn-group btn-group-sm game-type"></span>')
      const $gameTypeButton = $('<button type="button" data-toggle="dropdown"' +
        'class="btn btn-default dropdown-toggle btn-game-type ' + (gamesQueryState.GTF > 0 ? 'active' : '') + '" ' +
        'title="Display Games of specific type"' +
        '>' +
        activeGameTypeOption.label + ' <span class="caret"></span>' +
        '</button>')
      $gameType.append($gameTypeButton)
      const $gameTypeDropdown = $('<ul class="dropdown-menu"></ul>')
      gameTypeOptions.forEach(function (gameTypeOption) {
        const $gameTypeOption = $('<li class="' + (gameTypeOption.id === activeGameTypeOption.id ? 'active' : '') + '">' +
          '<a href="' + gamesLink({GTF: gameTypeOption.id}) + '">' +
          gameTypeOption.label +
          '</a>' +
          '</li>')
        $gameTypeDropdown.append($gameTypeOption)
      })
      $gameType.append($gameTypeDropdown)

      const $gameTypeWrap = $('<div></div>')
      $gameTypeWrap.append($gameType)
      $gameTypeWrap.append('<div><small class="text-muted">Game Type</small></div>')
      $gameSettings.append($gameTypeWrap)
    }

    /**
     * display type
     */
    const $displayType = $('<span class="btn-group btn-group-sm game-display-type"></span>')

    const $listButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (displayType === 'games-list' ? 'active' : '') + '" ' +
      'title="Display Games as List (allows for game type filtering)"' +
      'href="' + gamesLink({DisplayType: 1}) + '">' +
      'List' +
      '</a>')
    $displayType.append($listButton)

    const $gridButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (displayType === 'games-grid' ? 'active' : '') + '" ' +
      'title="Display Games as Grid (does not allow for game type filtering)"' +
      'href="' + gamesLink({DisplayType: 2, GTF: 0}) + '">' +
      'Grid' +
      '</a>')
    $displayType.append($gridButton)

    const $displayTypeWrap = $('<div></div>')
    $displayTypeWrap.append($displayType)
    $displayTypeWrap.append('<div><small class="text-muted">Display</small></div>')
    $gameSettings.append($displayTypeWrap)

    /**
     * remove existing elements
     */
    setTimeout(function () {
      let $gtfForm = $('select[name="GTF"]').closest('form')
      // remove text filters
      $gtfForm.prevAll('a').remove()
      // remove debris
      $gtfForm.next('br').remove()
      $gtfForm.parent().contents()
        .filter(function () {
          return this.nodeType == 3 && this.nodeValue === ' - ' //Node.TEXT_NODE
        }).remove()
      // remove form itself
      $gtfForm.remove()

      // remove avatar
      $('center > center > p').remove()

      // remove compare link
      if (comparable()) {
        $('body > center > center > center > a').remove()
      }

      // remove tablesorter column buttons
      $('.userscript-settings').prevAll().remove()

      // // remove debris
      $('.userscript-settings').parent().contents()
        .filter(function () {
          return this.nodeType == 3 // Node.TEXT_NODE
        }).remove()
    })
  }

  /**
   * game display options
   * state stored in local storage
   */
  const injectGameDisplayOptions = function ($gameSettings) {
    const $displayOptions = $('<span class="btn-group btn-group-sm game-display-options"></span>')

    if (_resource === 'profile-apps' && !comparing()) {
      const $limitButton = $('<a ' +
        'class="btn btn-default btn-game-limit ' + (gamesQueryState.Limit === '0' ? '' : 'active') + '" ' +
        'title="Use/do not use limit"' +
        'href="' + gamesLink({
          Limit: gamesQueryState.Limit === null ? '0' : (gamesQueryState.Limit === '0' ? null : 0),
        }) + '">' +
        'Limit' +
        '</a>')
      $displayOptions.append($limitButton)
    }

    gameDisplayOptions.forEach(function (displayOption) {
      const $displayOptionButton = $('<span class="btn btn-default btn-toggle btn-game-' + displayOption.key + '"' +
        'title="' + displayOption.description + '"' +
        '>' + displayOption.label + '</span>')
      $displayOptionButton.on('click', function () {
        toggleGameDisplayOption(displayOption)
      })
      let exclude = false
      exclude = gamesQueryState.NotOwnedBy && displayOption.key === 'filterReorder'
      if (!exclude && displayOption.displayType === displayType) {
        $displayOptions.append($displayOptionButton)
      }
    })

    if (_resource === 'profile-apps' && displayType === 'games-list' && ownProfile()) {
      const $playlistButton = $('<a ' +
        'class="btn btn-default btn-game-limit ' + (gamesQueryState.ToPlay > 0 ? 'active' : '') + '" ' +
        'title="Playlist"' +
        'href="' + gamesLink({
          ToPlay: gamesQueryState.ToPlay > 0 ? 0 : 1,
        }) + '">' +
        'Playlist' +
        '</a>')
      $displayOptions.append($playlistButton)

      // const $playlistButtonsButton = $('<a ' +
      //     'class="btn btn-default btn-game-limit ' + (gamesQueryState.SPB > 0 ? 'active' : '') + '" ' +
      //     'title="Playlist"' +
      //     'href="' + gamesLink({
      //         SPB: gamesQueryState.SPB> 0 ? 0 : 1,
      //     }) + '">' +
      //     'Playlist Buttons' +
      //     '</a>');
      // $profileGamesFilters.append($playlistButtonsButton);
    }

    const $displayOptionsWrap = $('<div></div>')
    $displayOptionsWrap.append($displayOptions)
    $displayOptionsWrap.append('<div><small class="text-muted">' + (displayType === 'games-grid' ? 'Grid' : 'List') + ' Options</small></div>')
    $gameSettings.append($displayOptionsWrap)
    try {
      gameDisplayOptionsState = JSON.parse(localStorage.getItem(getStorageKey('display', true))) || gameDisplayOptionsState
    } catch (exception) {
      localStorage.removeItem(getStorageKey('display', true))
    }
  }

  const toggleGameDisplayOption = function (displayOption) {
    gameDisplayOptionsState[displayOption.key] = !gameDisplayOptionsState[displayOption.key]
    let reloadOnChange = false
    if (gameDisplayOptionsState[displayOption.key]) {
      if (displayOption.key === 'filterReorder' && !gameDisplayOptionsState['gridFlex']) {
        gameDisplayOptionsState['gridFlex'] = gameDisplayOptionsState['filterReorder']
      }
    } else {
      if (displayOption.key === 'gridFlex') {
        gameDisplayOptionsState['filterReorder'] = gameDisplayOptionsState['gridFlex']
        reloadOnChange = true
      }
      if (displayOption.key === 'markExpired') {
        reloadOnChange = true
      }
    }
    applyDisplayOption()
    if (displayOption.reloadOnChange || reloadOnChange) {
      window.location.reload()
    }
  }

  const applyDisplayOption = function () {
    localStorage.setItem(getStorageKey('display', true), JSON.stringify(gameDisplayOptionsState))
    setTimeout(function () {
      $('.game-display-options .btn-toggle').removeClass('active')
      for (let gameDisplayOptionKey in gameDisplayOptionsState) {
        if (gameDisplayOptionsState.hasOwnProperty(gameDisplayOptionKey) && gameDisplayOptionsState[gameDisplayOptionKey]) {
          $('.game-display-options .btn-game-' + gameDisplayOptionKey).addClass('active')
        }
      }
      gameGridFlex()
      gameListShowAllColumns()

      applyGameProgressFilters()
    })
  }

  const gameGridFlex = function () {
    if (!gameDisplayOptionsState.gridFlex || !$('.games-grid').length) {
      return
    }
    breakTable('.games-grid', 'games-grid')
    // cleanup some font sizes
    $('[style^="font-size:xx-small"]').removeAttr('style')
    $('[style^="font-size:x-small"]').removeAttr('style')
    $('[style^="font-size:small"]').removeAttr('style')
  }

  const gameListShowAllColumns = function () {
    if (!$('.games-list').length) {
      return
    }
    if (gameDisplayOptionsState.showAllColumns) {
      $('.games-list td').css({display: 'table-cell'})
    } else {
      $('.games-list td:nth-child(11)').hide()
      $('.games-list td:nth-child(12)').hide()
      $('.games-list td:nth-child(13)').hide()
      $('.games-list td:nth-child(14)').hide()
    }
  }

  const gameMarkExpired = function () {
    if (!gameDisplayOptionsState.markExpired) {
      return
    }
    $('del').append(' (expired)').closest('.game')
      .toggleClass('game-expired', gameDisplayOptionsState.markExpired)
  }

  /**
   * game progress filters
   * state stored in local storage
   */
  const injectGameProgressFilters = function ($gameSettings) {
    if (gamesQueryState.NotOwnedBy) {
      return
    }
    const $gameProgressFilters = $('<span class="btn-group btn-group-sm game-progress-filters"></span>')
    gameProgressFilters.forEach(function (gameProgressFilter) {
      const $filterButton = $('<span class="btn btn-default btn-toggle btn-game-' + gameProgressFilter.key + '"' +
        'title="' + gameProgressFilter.description + '"' +
        '>' + gameProgressFilter.label + '</span>')
      $filterButton.on('click', function () {
        toggleGameProgressFilter(gameProgressFilter)
      })
      let excluded = false
      excluded = _resource === 'profile-apps' && gameProgressFilter.key === 'completed' && gamesQueryState.Hidden < 1 && gamesQueryState.CTO < 1
      if (!excluded) {
        $gameProgressFilters.append($filterButton)
      }
    })
    const $gameProgressFiltersWrap = $('<div></div>')
    $gameProgressFiltersWrap.append($gameProgressFilters)
    $gameProgressFiltersWrap.append('<div><small class="text-muted">Highlight</small></div>')
    $gameSettings.append($gameProgressFiltersWrap)
    try {
      gameProgressFilterState = JSON.parse(localStorage.getItem(getStorageKey('progressFilters', true))) || gameProgressFilterState
    } catch (exception) {
      localStorage.removeItem(getStorageKey('progressFilters', true))
    }
  }

  const toggleGameProgressFilter = function (filter) {
    gameProgressFilterState[filter.key] = !gameProgressFilterState[filter.key]
    applyGameProgressFilters()
  }

  const applyGameProgressFilters = function () {
    localStorage.setItem(getStorageKey('progressFilters', true), JSON.stringify(gameProgressFilterState))
    setTimeout(function () {
      $('.game').removeClass('game-muted game-muted-reorder')
      $('.game-progress-filters .btn-toggle').addClass('active')
      for (var gameProgressFilterKey in gameProgressFilterState) {
        if (gameProgressFilterState.hasOwnProperty(gameProgressFilterKey) && gameProgressFilterState[gameProgressFilterKey]) {
          $('.game-progress-filters .btn-game-' + gameProgressFilterKey).removeClass('active')
          $('.game.game-' + gameProgressFilterKey).addClass('game-muted')
          if (gameDisplayOptionsState.filterReorder) {
            $('.game.game-' + gameProgressFilterKey).addClass('game-muted-reorder')
          }
        }
      }
    })
  }

  /**
   * utils
   */
  const breakTable = function (selector, newClasses) {
    if (!$(selector).length) {
      return
    }
    const classes = newClasses || $(selector).attr('class')
    const $table = $(selector).html()
    $(selector).replaceWith('<div class="' + classes + '">' +
      $table
        .replace(/<tbody>/gi, '')
        .replace(/<\/tbody>/gi, '')
        .replace(/<tr>/gi, '')
        .replace(/<\/tr>/gi, '')
        .replace(/<td/gi, '<div')
        .replace(/<\/td>/gi, '</div>')
      + '</div>'
    )
    $('.lazyload, .lazyloading').removeClass('lazyloading')
  }

  const comparable = function () {
    return _userProfileId && _profileId !== _userProfileId
  }

  const comparing = function () {
    return comparable() && gamesQueryState.CTO > 0
  }

  const ownProfile = function () {
    return _userProfileId && _profileId === _userProfileId
  }

  const gamesLink = function (overrideParams) {
    const currentParams = $.extend({}, gamesQueryState, overrideParams)
    const params = {}
    for (let key in currentParams) {
      if (currentParams.hasOwnProperty(key) && (!!currentParams[key] || (displayType === 'profile-apps' && key === 'Limit' && currentParams[key] < 1))) {
        params[key] = currentParams[key]
      }
    }
    return fragment + '?' + jQuery.param(params)
  }

  const getStorageKey = function (key, resourceContext) {
    return 'userscript.' + id + (resourceContext ? '.' + _resource : '') + '.' + key
  }

  /**
   * inject provider
   */
  const inject = function (provider) {
    const providerKey = provider.id + '-' + id
    if ($('head meta[content="' + providerKey + '"]').length) {
      return
    }
    detectParams()
    provider.params({profileId: _profileId, appId: _appId, resource: _resource})
    provider.banner()
    switch (_resource) {
      case 'profile':
        extendProfile(provider)
        break
      case 'app':
      case 'profile-app':
        extendAppHeader(provider)
        break
      case 'apps':
      case 'profile-apps':
        extendAppsLists(provider)
        break
    }
    $('head').append('<meta name="userscript" content="' + providerKey + '">')
  }

  const extendProfile = function (provider) {
    let linkContainer = $('h2 .userscript')
    if (!linkContainer.length) {
      linkContainer = $('<span class="userscript btn-group btn-group-sm" style="float: right; margin-top:-5px"></span>')
      $('h2').prepend(linkContainer)
      linkContainer = $('h2 .userscript')
    }
    linkContainer.append('<a href="' + provider.steamProfileLink() + '" target="_blank" class="btn btn-default">' + provider.icon(24) + '</a>')
  }

  const extendAppHeader = function (provider) {
    const steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    let linkContainer = $('.panel-gameinfo .panel-heading .userscript')
    if (!linkContainer.length) {
      linkContainer = $('<span class="userscript btn-group btn-group-sm" style="float: right; margin-top:-9px; margin-right: -14px"></span>')
      $('.panel-gameinfo .panel-heading').prepend(linkContainer)
      linkContainer = $('.panel-gameinfo .panel-heading .userscript')
    }
    linkContainer.append('<a href="' + steamAppLink + '" target="_blank" class="btn btn-default">' + provider.icon(22) + '</a>')
  }

  const extendAppsLists = function (provider) {
    $('.tablesorter > tbody > tr > td:nth-child(2)').each(function () {
      const appUrl = new URL(window.location.origin + '/' + $('a[href^="Steam_Game_Info"]', $(this)).attr('href').toLowerCase())
      const appId = appUrl.searchParams.get('appid')
      const steamAppLink = provider.steamAppLink(appId)
      if (!steamAppLink) {
        return
      }
      $(this).closest('tr').append('<td style="padding: 0 2px"><a href="' + steamAppLink + '" class="btn btn-sm btn-default" target="_blank">' + provider.icon(20) + '</a></td>')
    })
    $('.games-list > thead > tr').append('<th></th>')
  }

  return {
    id: id,
    name: name,
    iconUrl: iconUrl,
    banner: banner,
    enhance: enhance,
    icon: icon,
    inject: inject,
    params: params,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink,
  }
})()

const cme = function () {

  const id = 'cme'
  const name = 'completionist.me'
  const iconUrl = 'data:image/png;base64,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'
  let _appId, _gameId, _profileId, _resource

  const params = function (params) {
    _appId = params && params.appId
    _gameId = params && params.gameId
    _profileId = params && params.profileId
    _resource = params && params.resource
  }

  const banner = function () {
    // console.log("%c   ", "font-size:57px;background-image:url(" + iconUrl + ");background-size:contain;background-repeat:no-repeat;background-position:center");
    console.log('%c ' + name + ' %c Userscript v' + version + ' ', 'font-size:11px;color:#000000;background:#40A2A5;padding:1px;border-radius:3px 0 0 3px;', 'font-size:11px;color:#FFF;background:#111;padding:1px;border-radius:0 3px 3px 0;')
  }

  const retroGameLink = function (gameId, profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://completionist.me/retro' + (linkProfileId ? '/profile/' + linkProfileId : '') + '/game/' + (gameId || _gameId) + '?utm_campaign=userscript'
  }

  const retroProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://completionist.me/retro' + (linkProfileId ? '/profile/' + linkProfileId : '') + '?utm_campaign=userscript'
  }

  const steamAppLink = function (appId, profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://completionist.me/steam' + (linkProfileId ? '/profile/' + linkProfileId : '') + '/app/' + (appId || _appId) + '?utm_campaign=userscript'
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://completionist.me/steam' + (linkProfileId ? '/profile/' + linkProfileId : '') + '?utm_campaign=userscript'
  }

  const icon = function (size) {
    const iconSize = size || 16
    return '<i class="" style="display:inline-block;width:' + iconSize + 'px;height:' + iconSize + 'px;vertical-align:middle;background-image:url(' + iconUrl + ');background-size: ' + iconSize + 'px ' + iconSize + 'px;"></i>'
  }

  /**
   * register on completionist.me
   */
  const register = function (userscript) {
    $('.userscript-' + userscript + '-installed').css('display', 'block')
    $('.userscript-' + userscript + '-not-installed').remove()
    banner()
  }

  return {
    id: id,
    name: name,
    iconUrl: iconUrl,
    banner: banner,
    icon: icon,
    params: params,
    register: register,
    retroGameLink: retroGameLink,
    retroProfileLink: retroProfileLink,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink
  }
}()

const exophase = function () {

  const id = 'exophase'
  const name = 'Exophase.com'
  const iconUrl = 'data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9IkxheWVyIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDUyIDUyIj48cGF0aCBmaWxsPSIjNmNmIiBkPSJNOSA5aDE0djE0SDl6Ii8+PHBhdGggZmlsbD0iI2Q3ZmZmZiIgZD0iTTI5IDloMTR2MTRIMjl6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTkgMjloMTR2MTRIOXoiLz48cGF0aCBmaWxsPSIjZjJmZmZmIiBkPSJNMjkgMjloMTR2MTRIMjl6Ii8+PC9zdmc+'
  let _appId, _gameId, _profileId, _resource

  const params = function (params) {
    _appId = params && params.appId
    _gameId = params && params.gameId
    _profileId = params && params.profileId
    _resource = params && params.resource
  }

  const banner = function () {
    // console.log("%c   ", "font-size:57px;background-image:url(" + iconUrl + ");background-size:contain;background-repeat:no-repeat;background-position:center");
    console.log('%c ' + name + ' %c Userscript v' + version + ' ', 'font-size:11px;color:#000000;background:#40A2A5;padding:1px;border-radius:3px 0 0 3px;', 'font-size:11px;color:#FFF;background:#111;padding:1px;border-radius:0 3px 3px 0;')
  }

  const steamAppLink = function (appId, profileId) {
    const linkAppId = appId || _appId
    const linkProfileId = profileId || _profileId
    return 'https://exophase.com/steam/game/id/' + linkAppId + (linkProfileId ? '/stats/' + linkProfileId : '') + '?utm_campaign=userscript'
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://exophase.com/steam' + (linkProfileId ? '/id/' + linkProfileId : '') + '?utm_campaign=userscript'
  }

  const icon = function (size) {
    const iconSize = size || 16
    return '<i class="" style="display:inline-block;width:' + iconSize + 'px;height:' + iconSize + 'px;vertical-align:middle;background-image:url(' + iconUrl + ');background-size: ' + iconSize + 'px ' + iconSize + 'px;"></i>'
  }

  return {
    id: id,
    name: name,
    iconUrl: iconUrl,
    banner: banner,
    icon: icon,
    params: params,
    // retroGameLink: retroGameLink,
    // retroProfileLink: retroProfileLink,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink
  }
}()

const mgs = function () {

  const id = 'mgs'
  const name = 'MetaGamerScore.com'
  const iconUrl = 'data:image/png;base64,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'
  let _appId, _gameId, _profileId, _resource

  const params = function (params) {
    _appId = params && params.appId
    _gameId = params && params.gameId
    _profileId = params && params.profileId
    _resource = params && params.resource
  }

  const banner = function () {
    // console.log("%c   ", "font-size:57px;background-image:url(" + iconUrl + ");background-size:contain;background-repeat:no-repeat;background-position:center");
    console.log('%c ' + name + ' %c Userscript v' + version + ' ', 'font-size:11px;color:#000000;background:#40A2A5;padding:1px;border-radius:3px 0 0 3px;', 'font-size:11px;color:#FFF;background:#111;padding:1px;border-radius:0 3px 3px 0;')
  }

  const steamAppLink = function (appId, profileId) {
    return null
    // const linkProfileId = profileId || _profileId;
    // return 'https://metagamerscore.com/steam' + (linkProfileId ? '/id/' + linkProfileId : '') + '/app/' + (appId || _appId) + '?utm_campaign=userscript';
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://metagamerscore.com/steam' + (linkProfileId ? '/id/' + linkProfileId : '') + '?utm_campaign=userscript'
  }

  const icon = function (size) {
    const iconSize = size || 16
    return '<i class="" style="display:inline-block;width:' + iconSize + 'px;height:' + iconSize + 'px;vertical-align:middle;background-image:url(' + iconUrl + ');background-size: ' + iconSize + 'px ' + iconSize + 'px;"></i>'
  }

  return {
    id: id,
    name: name,
    iconUrl: iconUrl,
    banner: banner,
    icon: icon,
    params: params,
    // retroGameLink: retroGameLink,
    // retroProfileLink: retroProfileLink,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink
  }
}()

const retroachievements = (function () {

  const id = 'retroachievements'
  const name = 'RetroAchievements'

  const resourceMap = {
    'achievementlist.php': 'achievements',
    'game': 'game',
    'gameinfo.php': 'game',
    'user': 'profile',
    'userinfo.php': 'profile'
  }
  const resource = resourceMap[fragments[1]]

  let profileId = false
  let gameId = false
  if (url.searchParams.get('id')) {
    switch (resource) {
      case 'profile':
        profileId = url.searchParams.get('id')
        break
      case 'game':
        gameId = url.searchParams.get('id')
        break
    }
  } else {
    switch (resource) {
      case 'profile':
        profileId = fragment
        break
      case 'game':
        gameId = fragment
        break
    }
  }

  const userBoxLink = $('.login a[href^="/user"]')
  if (resource !== 'profile' && userBoxLink.length > 0) {
    profileId = userBoxLink.attr('href').toLowerCase().match(/([^\/]*)\/*$/)[1]
  }

  const inject = function (provider) {
    const providerKey = provider.id + '-' + id
    if ($('head meta[content="' + providerKey + '"]').length) {
      return
    }
    provider.params({profileId: profileId, gameId: gameId, resource: resource})
    switch (resource) {
      case 'profile':
        extendProfile(provider)
        extendProfileGames(provider)
        break
      case 'game':
        extendGame(provider)
        break
      case 'achievements':
        extendAchievements(provider)
        break
    }
    $('head').append('<meta name="userscript" content="' + providerKey + '">')
  }

  const extendProfile = function (provider) {
    $('h3.longheader').append('<a href="' + provider.retroProfileLink() + '" target="_blank" style="float: right;">' + provider.icon(28) + '</a>')
    $('.login a[href^="/user"]').closest('p').find('.TrueRatio').after(' <a href="' + provider.retroProfileLink() + '" target="_blank" style="">' + provider.icon(20) + '</a> ')
  }

  const extendProfileGames = function (provider) {
    $('.userpagegames > a, #usercompletedgamescomponent td:not(.gameimage) a').each(function () {
      const gameId = $(this).attr('href').toLowerCase().match(/([^\/]*)\/*$/)[1]
      $(this).after(' <a href="' + provider.retroGameLink(gameId, profileId) + '" target="_blank">' + provider.icon(18) + '</a>')
    })
  }

  const extendGame = function (provider) {
    $('h3.longheader').append('<a href="' + provider.retroGameLink(gameId) + '" target="_blank" style="float: right;">' + provider.icon(28) + '</a>')
  }

  const extendAchievements = function (provider) {
    $('a[href^="/Game"]').each(function () {
      const gameId = $(this).attr('href').toLowerCase().match(/([^\/]*)\/*$/)[1]
      $(this).closest('tr').append('<td><a href="' + provider.retroGameLink(gameId) + '" target="_blank">' + provider.icon(24) + '</a></td>')
    })
  }

  return {
    id: id,
    name: name,
    inject: inject
  }
})()

const steamdb = (function () {

  const id = 'steamdb'
  const name = 'SteamDB'
  const iconUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cGF0aCBkPSJNNjMuOSAwQzMwLjUgMCAzLjEgMTEuOS4xIDI3LjFsMzUuNiA2LjdjMi45LS45IDYuMi0xLjMgOS42LTEuM2wxNi43LTEwYy0uMi0yLjUgMS4zLTUuMSA0LjctNy4yIDQuOC0zLjEgMTIuMy00LjggMTkuOS00LjggNS4yLS4xIDEwLjUuNyAxNSAyLjIgMTEuMiAzLjggMTMuNyAxMS4xIDUuNyAxNi4zLTUuMSAzLjMtMTMuMyA1LTIxLjQgNC44bC0yMiA3LjljLS4yIDEuNi0xLjMgMy4xLTMuNCA0LjUtNS45IDMuOC0xNy40IDQuNy0yNS42IDEuOS0zLjYtMS4yLTYtMy03LTQuOEwyLjUgMzguNGMyLjMgMy42IDYgNi45IDEwLjggOS44QzUgNTMgMCA1OSAwIDY1LjVjMCA2LjQgNC44IDEyLjMgMTIuOSAxNy4xQzQuOCA4Ny4zIDAgOTMuMiAwIDk5LjYgMCAxMTUuMyAyOC42IDEyOCA2NCAxMjhjMzUuMyAwIDY0LTEyLjcgNjQtMjguNCAwLTYuNC00LjgtMTIuMy0xMi45LTE3IDguMS00LjggMTIuOS0xMC43IDEyLjktMTcuMSAwLTYuNS01LTEyLjYtMTMuNC0xNy40IDguMy01LjEgMTMuMy0xMS40IDEzLjMtMTguMiAwLTE2LjUtMjguNy0yOS45LTY0LTI5Ljl6bTIyLjggMTQuMmMtNS4yLjEtMTAuMiAxLjItMTMuNCAzLjMtNS41IDMuNi0zLjggOC41IDMuOCAxMS4xIDcuNiAyLjYgMTguMSAxLjggMjMuNi0xLjhzMy44LTguNS0zLjgtMTFjLTMuMS0xLTYuNy0xLjUtMTAuMi0xLjV6bS4zIDEuN2M3LjQgMCAxMy4zIDIuOCAxMy4zIDYuMiAwIDMuNC01LjkgNi4yLTEzLjMgNi4ycy0xMy4zLTIuOC0xMy4zLTYuMmMwLTMuNCA1LjktNi4yIDEzLjMtNi4yek00NS4zIDM0LjRjLTEuNi4xLTMuMS4yLTQuNi40bDkuMSAxLjdhMTAuOCA1IDAgMSAxLTguMSA5LjNsLTguOS0xLjdjMSAuOSAyLjQgMS43IDQuMyAyLjQgNi40IDIuMiAxNS40IDEuNSAyMC0xLjVzMy4yLTcuMi0zLjItOS4zYy0yLjYtLjktNS43LTEuMy04LjYtMS4zek0xMDkgNTF2OS4zYzAgMTEtMjAuMiAxOS45LTQ1IDE5LjktMjQuOSAwLTQ1LTguOS00NS0xOS45di05LjJjMTEuNSA1LjMgMjcuNCA4LjYgNDQuOSA4LjYgMTcuNiAwIDMzLjYtMy4zIDQ1LjItOC43em0wIDM0LjZ2OC44YzAgMTEtMjAuMiAxOS45LTQ1IDE5LjktMjQuOSAwLTQ1LTguOS00NS0xOS45di04LjhjMTEuNiA1LjEgMjcuNCA4LjIgNDUgOC4yczMzLjUtMy4xIDQ1LTguMnoiIGZpbGw9IiNGRkYiLz48L3N2Zz4='
  let _appId, _gameId, _profileId, _resource

  const params = function (params) {
    _appId = params && params.appId
    _gameId = params && params.gameId
    _profileId = params && params.profileId
    _resource = params && params.resource
  }

  const banner = function () {
    // console.log("%c   ", "font-size:57px;background-image:url(" + iconUrl + ");background-size:contain;background-repeat:no-repeat;background-position:center");
    console.log('%c ' + name + ' %c Userscript v' + version + ' ', 'font-size:11px;color:#000000;background:#40A2A5;padding:1px;border-radius:3px 0 0 3px;', 'font-size:11px;color:#FFF;background:#111;padding:1px;border-radius:0 3px 3px 0;')
  }

  const steamAppLink = function (appId, profileId) {
    return 'https://steamdb.info/app/' + (appId || _appId) + '?utm_campaign=userscript'
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://steamdb.info/calculator/' + (linkProfileId ? linkProfileId : '') + '?utm_campaign=userscript'
  }

  const icon = function (size) {
    const iconSize = size || 16
    return '<i class="" style="display:inline-block;width:' + iconSize + 'px;height:' + iconSize + 'px;vertical-align:middle;background-image:url(' + iconUrl + ');background-size: ' + iconSize + 'px ' + iconSize + 'px;"></i>'
  }

  /**
   * inject provider
   */
  const fragment = fragments[1]
  const resourceMap = {
    'app': 'app',
    'calculator': 'profile'
  }
  const resource = resourceMap[fragment]

  const inject = function (provider) {
    const providerKey = provider.id + '-' + id
    if ($('head meta[content="' + providerKey + '"]').length) {
      return
    }
    switch (resource) {
      case 'app':
        provider.params({appId: fragments[2]})
        injectAppNavListLink(provider)
        break
      case 'profile':
        provider.params({profileId: fragments[2]})
        injectProfileHeaderLink(provider)
        break
    }
    $('head').append('<meta name="userscript" content="' + providerKey + '">')
  }

  const injectAppNavListLink = function (provider) {
    const steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    const providerLink = $('<a class="tooltipped tooltipped-n" target="_blank" href="' + steamAppLink + '" aria-label="View app on ' + provider.name + '">' + provider.icon(16) + '</a>')
    $('.app-links').append(providerLink)
  }

  const injectProfileHeaderLink = function (provider) {
    const providerLink = $('<a target="_blank" style="margin-left: 4px" href="' + provider.steamProfileLink() + '" title="View profile on ' + provider.name + '">' + provider.icon(24) + '</a>')
    $('.header-title').append(providerLink)
  }

  return {
    id: id,
    name: name,
    iconUrl: iconUrl,
    banner: banner,
    icon: icon,
    params: params,
    inject: inject,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink,
  }
})()

const steamhunters = function () {

  const id = 'steamhunters'
  const name = 'Steam Hunters'
  const iconUrl = 'data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9IkxheWVyIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDE2IDE2Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIyIiByeT0iMiIgZmlsbD0iIzFiMjgzOCIvPjxnIGRhdGEtbmFtZT0iUGF0aGZpbmRlciBHcm91cCAoMSBwdCkiPjxwYXRoIGZpbGw9IiM3YmI2ZmYiIGQ9Ik0wIDdoMTJWMy41bDQgNC00IDRWOEgwVjd6Ii8+PHBhdGggZD0iTTggOWgydjVIOHptMC03aDJ2NEg4em00IDExdjFoMnYtMy4wMkwxMyAxMmwtMSAxem0yLTguOThWMmgtMmwxIDEgMSAxLjAyek0zIDVhMS4yNCAxLjI0IDAgMCAxIDEtMSAxLjMzIDEuMzMgMCAwIDEgMSAxaDJhMy4yMyAzLjIzIDAgMCAwLTMtMyAzLjE4IDMuMTggMCAwIDAtMyAzIDIuNDIgMi40MiAwIDAgMCAuMTggMWgyLjU3QzMuMzEgNS42NiAzIDUuMzQgMyA1em0yIDUuMDlhMi4zNiAyLjM2IDAgMCAxLS41OCAxLjYzQS43My43MyAwIDAgMSA0IDEyYy0uMzEgMC0xLS42LTEtMUgxYTIuOSAyLjkgMCAwIDAgLjkzIDJBMy4wOSAzLjA5IDAgMCAwIDQgMTRhMi42MSAyLjYxIDAgMCAwIDEuODktLjkzQTQuMzUgNC4zNSAwIDAgMCA3IDkuOTEgMy4yMiAzLjIyIDAgMCAwIDYuNzcgOUg0LjM4QTEuNzQgMS43NCAwIDAgMSA1IDEwLjA5eiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4='
  let _appId, _gameId, _profileId, _resource

  const params = function (params) {
    _appId = params && params.appId
    _gameId = params && params.gameId
    _profileId = params && params.profileId
    _resource = params && params.resource
  }

  const banner = function () {
    // console.log("%c   ", "font-size:57px;background-image:url(" + iconUrl + ");background-size:contain;background-repeat:no-repeat;background-position:center");
    console.log('%c ' + name + ' %c Userscript v' + version + ' ', 'font-size:11px;color:#000000;background:#40A2A5;padding:1px;border-radius:3px 0 0 3px;', 'font-size:11px;color:#FFF;background:#111;padding:1px;border-radius:0 3px 3px 0;')
  }

  const steamAppLink = function (appId, profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://steamhunters.com/' + (linkProfileId ? 'profiles/' + linkProfileId + '/' : '') + 'stats/' + (appId || _appId) + '?utm_campaign=userscript'
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://steamhunters.com/' + (linkProfileId ? 'profiles/' + linkProfileId : '') + '?utm_campaign=userscript'
  }

  const icon = function (size) {
    const iconSize = size || 16
    return '<i class="" style="display:inline-block;width:' + iconSize + 'px;height:' + iconSize + 'px;vertical-align:middle;background-image:url(' + iconUrl + ');background-size: ' + iconSize + 'px ' + iconSize + 'px;"></i>'
  }

  return {
    id: id,
    name: name,
    iconUrl: iconUrl,
    banner: banner,
    icon: icon,
    params: params,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink,
  }
}()

const ascouts = function () {

  const id = 'ascouts'
  const name = 'Achievement Scouts'
  const iconUrl = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDU1MyA1MTkiIHdpZHRoPSI1NTMiIGhlaWdodD0iNTE5Ij4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDI9IjEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDM5NSAtMjI3IDI2MS4xMDEgNDU0LjMzOSA0Ny41IDQ1MykiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM2Y2YzMDIiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIuNjk4IiBzdG9wLWNvbG9yPSIjODhmMzU3Ii8+CiAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2JiZjBhOSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNIDI4OC43NDEgMi43NTAgTCAyODcuMTcyIDQuNTAwIDI3My41MTQgMjYuNTAwIEwgMjU5Ljg1NyA0OC41MDAgMjQyLjQyOCA4My4zMjcgTCAyMjUgMTE4LjE1MyAyMjUgMTE5LjM3NyBMIDIyNSAxMjAuNjAwIDIzOC4zODAgMTQyLjY1NSBMIDI1MS43NjAgMTY0LjcxMSAyMzguNjMwIDE2NS4yODUgTCAyMjUuNTAwIDE2NS44NTkgMjE4LjUwMCAxNjguMDQ0IEwgMjExLjUwMCAxNzAuMjMwIDIwNiAxNzMuMDI0IEwgMjAwLjUwMCAxNzUuODE4IDE5Ni4wOTggMTc4Ljc5OSBMIDE5MS42OTYgMTgxLjc3OSAxODQuMjcwIDE4OS4xNDAgTCAxNzYuODQzIDE5Ni41MDAgMTcxLjgwMCAyMDQgTCAxNjYuNzU2IDIxMS41MDAgMTQ4Ljk3NCAyNDcuMTgyIEwgMTMxLjE5MSAyODIuODY0IDEyOS41NDQgMjkwLjEwOCBMIDEyNy44OTYgMjk3LjM1MiAxMjcuMjk1IDMxMC42NDkgTCAxMjYuNjk0IDMyMy45NDYgMTEzLjExOCAzMjQuMjIzIEwgOTkuNTQyIDMyNC41MDAgOTUuNjk5IDMzMS41MDAgTCA5MS44NTUgMzM4LjUwMCA3NC4yOTcgMzcxIEwgNTYuNzM4IDQwMy41MDAgNDMuMzE1IDQyNy44MDUgTCAyOS44OTMgNDUyLjExMSAxNC44OTkgNDgyLjI2OSBMIC0wLjA5NSA1MTIuNDI4IDAuMjAzIDUxNS40NjQgTCAwLjUwMCA1MTguNTAwIDE1MC41MDAgNTE4LjUwMCBMIDMwMC41MDAgNTE4LjUwMCAzMTAuNTAwIDUxNS43NDkgTCAzMjAuNTAwIDUxMi45OTggMzI4Ljg4OCA1MDguOTc5IEwgMzM3LjI3NiA1MDQuOTYwIDM0My41ODkgNDk4LjUyMSBMIDM0OS45MDIgNDkyLjA4MyAzNjguNDQ4IDQ1NS4wNzcgTCAzODYuOTk0IDQxOC4wNzEgMzg5LjM2MCA0MDkuODc2IEwgMzkxLjcyNiA0MDEuNjgyIDM5NS43MzIgNDA4LjU5MSBMIDM5OS43MzkgNDE1LjUwMCA0MTIuMDA0IDQzNyBMIDQyNC4yNjggNDU4LjUwMCA0NDEuNzQ3IDQ4OC4yNjQgTCA0NTkuMjI2IDUxOC4wMjkgNDg5LjM2MyA1MTcuNzY0IEwgNTE5LjUwMCA1MTcuNTAwIDUzNi4yMDAgNDg0LjUwMCBMIDU1Mi45MDAgNDUxLjUwMCA1NTIuOTUwIDQ0OS4zMTIgTCA1NTMgNDQ3LjEyNCA1NDUuMTIxIDQzMy4zMTIgTCA1MzcuMjQyIDQxOS41MDAgNTE5LjM3MSAzODkuNDQ3IEwgNTAxLjUwMCAzNTkuMzk0IDQ2OS41MDAgMzA0LjIxOCBMIDQzNy41MDAgMjQ5LjA0MSA0MTUuNzUwIDI0OS4wMjEgTCAzOTQgMjQ5IDM5NCAyNDguNDkwIEwgMzk0IDI0Ny45ODAgNDAzLjQ0MCAyMjkuMTE5IEwgNDEyLjg4MCAyMTAuMjU5IDQxMi4yNzAgMjA3Ljg3OSBMIDQxMS42NjAgMjA1LjUwMCAzOTUuMjAyIDE3NyBMIDM3OC43NDUgMTQ4LjUwMCAzNjkuODE2IDEzMi41MDAgTCAzNjAuODg4IDExNi41MDAgMzI3LjI0NSA1OC43NTAgTCAyOTMuNjAzIDEgMjkxLjk1NiAxIEwgMjkwLjMxMCAxIDI4OC43NDEgMi43NTAgTSAyMjEuMTEzIDI3OC42MzcgTCAyMjIuNDcyIDI4MC4yNzMgMjI2Ljk4NiAyODIuMzUyIEwgMjMxLjUwMCAyODQuNDMxIDI4Ni41MDAgMjg1LjA2NCBMIDM0MS41MDAgMjg1LjY5NyAzNDkuMTE5IDI4Ny42ODAgTCAzNTYuNzM3IDI4OS42NjIgMzU5Ljg1OSAyODMuMzMxIEwgMzYyLjk4MSAyNzcgMjkxLjM2OCAyNzcgTCAyMTkuNzU1IDI3NyAyMjEuMTEzIDI3OC42MzcgTSAxMzIuODE3IDM4NS4xNzYgTCAxMjQuMjEyIDQwMiAyMTEuMzU2IDQwMS44OTUgTCAyOTguNTAwIDQwMS43OTAgMjk0LjUwMCA0MDAuNDcyIEwgMjkwLjUwMCAzOTkuMTU0IDI0Ni41MDAgMzk5LjAyNiBMIDIwMi41MDAgMzk4Ljg5OCAxOTIgMzk4LjAzNiBMIDE4MS41MDAgMzk3LjE3NSAxNzUuNzk0IDM5NS4yMzYgTCAxNzAuMDg5IDM5My4yOTggMTY0LjUxNiAzODkuOTIxIEwgMTU4Ljk0MyAzODYuNTQzIDE1My44NDggMzgyLjA4NiBMIDE0OC43NTMgMzc3LjYyOSAxNDUuMDg3IDM3Mi45OTEgTCAxNDEuNDIxIDM2OC4zNTMgMTMyLjgxNyAzODUuMTc2IiBmaWxsPSIjMDAwMDAwIi8+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMjkwLjI4LjI0Yy40Ny0uNjMgMi45My4wNCAzLjU0IDEuMDlsMjAuOTEgMzUuNTZMMzUxIDk5LjE1bDExLjgyIDIwLjQ3IDEzLjkxIDI1LjA2IDMyLjMzIDU1Ljk1YzEuOTIgMy4zMSA0LjIxIDUuOSAyLjQ4IDEwLjI4bC0xNzMuMTIuMThjLTEwLjc5IDAtMjAuNTggNy4wNy0yNS4zIDE1Ljg1LTQuMzUgOC4xLTQuNjcgMzQuMTMuNDUgNDIuOTYgNC40NiA3LjY4IDE0LjA3IDEzLjk5IDIzLjY4IDE0LjA1bDg4LjMxLjQ0YzI0LjMyLjEyIDUwLjk5IDYuODQgNjEuMjEgMzAuOTYgNC4xMSA5LjcgNi4yNSAxOS45NCA2LjcyIDMwLjU3Ljk1IDIxLjg2IDEuMjcgNTMuMjctOC4zNSA3My4xLTguNDIgMTcuMzYtMjQuNDUgMjYuMjUtNDIuOTIgMzAuMjgtNi45OCAxLjUzLTE0LjE5IDMuNS0yMS44MyAzLjVsLTI4NS45My4yYy0yLjY1LTMuMTQtMS4xOS02LjIzLjQ3LTkuMjNsMjYuOTEtNDguODZ2LS4wNGwyNy4yOS01MC43NCAxMS40Ny0yMC45IDU3LjEyLS4yNGMuNzEgMCAyLjM0LjY4IDIuNzggMS4xMS40NS40My4yMiAyLjQ2LS4xMiAzLjA0bC0yNi42IDQ2LjQyLTE0LjEyIDI1LjgxYy0uNTEuOTQgMi4xMSAyLjMyIDMuMDUgMi4zMmwyMDEuMjgtLjE5YzguODQgMCAxNi4zOC02LjM5IDE4LjM1LTE0LjM5IDMtMTIuMTQgMy41LTI1IC44Ny0zNy40Ny0yLjE5LTEwLjQ2LTEyLjY1LTE2LjgxLTIzLjMtMTYuODlsLTk0LjY2LS43MWMtNy40MS0uMDYtMTUuNzctMi40My0yMi4xMS01LjU2LTI5LjQ3LTE0LjU4LTQ0LjAzLTQ1LjQ0LTQyLjctNzcuMzEuNi0xNC42MS45Mi0yNy40OCA4LjQtNDAuMTcgOS44LTE2LjY1IDIyLjgxLTMwLjU5IDQwLjkxLTM4LjQ2IDcuNzMtMy4zNiAxNS42OC01LjczIDI0LjQ2LTUuNzNsODkuOTItLjExYy01LjIzLTkuNzctOS43Ny0xOS4wNS0xNS40Ni0yOC4yM2wtMjguNzYtNDYuNDMtMjEuNzQtMzUuODdjLjg5LTMuNDkgMi45Mi03LjA0IDQuODMtMTAuMWwxMi42Ni0yMC40NiAxMy4xNi0yMS4yNmMuNDctLjc3IDEuMTItMS42NSAxLjQ2LTIuMTFtMTk5LjUxIDMzOC43MyAyMy40MSA0MC4xNCA5LjQ0IDE1LjYgMTYuNDcgMjcuNyAxMy4zNyAyMy42NmMuNTUuOTguMzMgMy44NS0uNDUgNC41LS43Ny42Ni0yLjg0IDEuMy00LjE0IDEuM2wtNTUuMzMtLjAyLTI3Ljg5LTQ3LjQyLTMzLjcyLTU4LjY2LTUyLjA0LTkxLjVjLS43NS0yLjE0LTEuMjgtMy43NS0xLjY4LTYuMThsNTkuNy0uMDR6IiBzdHlsZT0iZmlsbDp1cmwoI2EpIi8+Cjwvc3ZnPgo='
  let _appId, _gameId, _profileId, _resource

  const params = function (params) {
    _appId = params && params.appId
    _gameId = params && params.gameId
    _profileId = params && params.profileId
    _resource = params && params.resource
  }

  const banner = function () {
    // console.log("%c   ", "font-size:57px;background-image:url(" + iconUrl + ");background-size:contain;background-repeat:no-repeat;background-position:center");
    console.log('%c ' + name + ' %c Userscript v' + version + ' ', 'font-size:11px;color:#000000;background:#40A2A5;padding:1px;border-radius:3px 0 0 3px;', 'font-size:11px;color:#FFF;background:#111;padding:1px;border-radius:0 3px 3px 0;')
  }

  const steamAppLink = function (appId, profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://achievement-scouts.com/apps/' + (appId || _appId) + '?utm_campaign=userscript'
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://achievement-scouts.com/' + (linkProfileId ? 'users/' + linkProfileId : '') + '?utm_campaign=userscript'
  }

  const icon = function (size) {
    const iconSize = size || 16
    return '<i class="" style="display:inline-block;width:' + iconSize + 'px;height:' + iconSize + 'px;vertical-align:middle;background-image:url(' + iconUrl + ');background-size: ' + iconSize + 'px ' + iconSize + 'px;"></i>'
  }

  return {
    id: id,
    name: name,
    iconUrl: iconUrl,
    banner: banner,
    icon: icon,
    params: params,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink,
  }
}()

const store = function () {

  const id = 'store'
  const name = 'Steam Store'
  const iconUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMzMgMjMzIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgyPSI1MCUiIHgxPSI1MCUiIHkyPSIxMDAlIj48c3RvcCBzdG9wLWNvbG9yPSIjMTExRDJFIiBvZmZzZXQ9IjAiLz48c3RvcCBzdG9wLWNvbG9yPSIjMDUxODM5IiBvZmZzZXQ9Ii4yMTIiLz48c3RvcCBzdG9wLWNvbG9yPSIjMEExQjQ4IiBvZmZzZXQ9Ii40MDciLz48c3RvcCBzdG9wLWNvbG9yPSIjMTMyRTYyIiBvZmZzZXQ9Ii41ODEiLz48c3RvcCBzdG9wLWNvbG9yPSIjMTQ0QjdFIiBvZmZzZXQ9Ii43MzgiLz48c3RvcCBzdG9wLWNvbG9yPSIjMTM2NDk3IiBvZmZzZXQ9Ii44NzMiLz48c3RvcCBzdG9wLWNvbG9yPSIjMTM4N0I4IiBvZmZzZXQ9IjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBmaWxsPSJ1cmwoI2EpIiBkPSJNNC44OTEgMTUwLjAxQzE5LjI4NCAxOTguMDIgNjMuODA3IDIzMyAxMTYuNTAxIDIzM2M2NC4zNCAwIDExNi41LTUyLjE2IDExNi41LTExNi41IDAtNjQuMzQxLTUyLjE2LTExNi41LTExNi41LTExNi41QzU0Ljc2MSAwIDQuMjQxIDQ4LjAyOS4yNTEgMTA4Ljc2YzcuNTQgMTIuNjYgMTAuNDgxIDIwLjQ5IDQuNjQxIDQxLjI1eiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xMTAuNSA4Ny4zMjJjMCAuMTk2IDAgLjM5Mi4wMS41NzZMODIuMDAyIDEyOS4zMWMtNC42MTgtLjIxLTkuMjUyLjYtMTMuNjQ2IDIuNDFhMzEuNjk4IDMxLjY5OCAwIDAgMC01LjQ1NSAyLjg4TC4zMDIgMTA4Ljgzcy0xLjQ0OCAyMy44MyA0LjU4OCA0MS41OWw0NC4yNTQgMTguMjZjMi4yMjIgOS45MyA5LjAzNCAxOC42NCAxOS4wODQgMjIuODMgMTYuNDQzIDYuODcgMzUuNDAyLS45NiA0Mi4yNDItMTcuNDEgMS43OC00LjMgMi42MS04LjgxIDIuNDktMTMuMzFsNDAuNzktMjkuMTVjLjMzLjAxLjY3LjAyIDEgLjAyIDI0LjQxIDAgNDQuMjUtMTkuOSA0NC4yNS00NC4zMzhDMTk5IDYyLjg4MiAxNzkuMTYgNDMgMTU0Ljc1IDQzYy0yNC40IDAtNDQuMjUgMTkuODgyLTQ0LjI1IDQ0LjMyMnptLTYuODQgODMuOTE4Yy01LjI5NCAxMi43MS0xOS45IDE4Ljc0LTMyLjU5NiAxMy40NS01Ljg1Ny0yLjQ0LTEwLjI3OS02LjkxLTEyLjgzLTEyLjI0bDE0LjQwNSA1Ljk3YzkuMzYzIDMuOSAyMC4xMDUtLjU0IDIzLjk5Ny05LjkgMy45MDQtOS4zNy0uNTI1LTIwLjEzLTkuODgzLTI0LjAzbC0xNC44OTEtNi4xN2M1Ljc0Ni0yLjE4IDEyLjI3OC0yLjI2IDE4LjM4MS4yOCA2LjE1MyAyLjU2IDEwLjkyNyA3LjM4IDEzLjQ1NyAxMy41NHMyLjUyIDEyLjk2LS4wNCAxOS4xbTUxLjA5LTU0LjM4Yy0xNi4yNSAwLTI5LjQ4LTEzLjI1LTI5LjQ4LTI5LjUzOCAwLTE2LjI3NSAxMy4yMy0yOS41MjkgMjkuNDgtMjkuNTI5IDE2LjI2IDAgMjkuNDkgMTMuMjU0IDI5LjQ5IDI5LjUyOSAwIDE2LjI4OC0xMy4yMyAyOS41MzgtMjkuNDkgMjkuNTM4bS0yMi4wOS0yOS41ODNjMC0xMi4yNTMgOS45Mi0yMi4xOTEgMjIuMTQtMjIuMTkxIDEyLjIzIDAgMjIuMTUgOS45MzggMjIuMTUgMjIuMTkxIDAgMTIuMjU0LTkuOTIgMjIuMTgzLTIyLjE1IDIyLjE4My0xMi4yMiAwLTIyLjE0LTkuOTI5LTIyLjE0LTIyLjE4M3oiLz48L3N2Zz4='
  let _appId, _gameId, _profileId, _resource

  const params = function (params) {
    _appId = params && params.appId
    _gameId = params && params.gameId
    _profileId = params && params.profileId
    _resource = params && params.resource
  }

  const banner = function () {
    // console.log("%c   ", "font-size:57px;background-image:url(" + iconUrl + ");background-size:contain;background-repeat:no-repeat;background-position:center");
    console.log('%c ' + name + ' %c Userscript v' + version + ' ', 'font-size:11px;color:#000000;background:#40A2A5;padding:1px;border-radius:3px 0 0 3px;', 'font-size:11px;color:#FFF;background:#111;padding:1px;border-radius:0 3px 3px 0;')
  }

  const steamAppLink = function (appId, profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://store.steampowered.com/app/' + (appId || _appId) + '?utm_campaign=userscript'
  }

  const steamProfileLink = function (profileId) {
    return null
    // const linkProfileId = profileId || _profileId
    // return 'https://store.steampowered.com/' + (linkProfileId ? 'users/' + linkProfileId : '') + '?utm_campaign=userscript'
  }

  const icon = function (size) {
    const iconSize = size || 16
    return '<i class="" style="display:inline-block;width:' + iconSize + 'px;height:' + iconSize + 'px;vertical-align:middle;background-image:url(' + iconUrl + ');background-size: ' + iconSize + 'px ' + iconSize + 'px;"></i>'
  }

  return {
    id: id,
    name: name,
    iconUrl: iconUrl,
    banner: banner,
    icon: icon,
    params: params,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink,
  }
}()

switch (url.hostname) {
  case 'astats.astats.nl':
    astats.enhance()
    break
}

switch (url.hostname) {
  case 'store.steampowered.com':
    steamStore.inject(astats)
    break
  case 'steamcommunity.com':
    steamCommunity.inject(astats)
    break
}

switch (url.hostname) {
  case 'steamdb.info':
    steamdb.inject(astats)
    break
}

switch (url.hostname) {
  case 'astats.astats.nl':
    astats.inject(cme)
    break
}

switch (url.hostname) {
  case 'retroachievements.org':
    retroachievements.inject(cme)
    break
}

switch (url.hostname) {
  case 'store.steampowered.com':
    steamStore.inject(cme)
    break
  case 'steamcommunity.com':
    steamCommunity.inject(cme)
    break
  case 'completionist-web.test':
  case 'completionist.me':
    cme.register('cme-steam')
    break
}

switch (url.hostname) {
  case 'steamdb.info':
    steamdb.inject(cme)
    break
}

switch (url.hostname) {
  case 'astats.astats.nl':
    astats.inject(exophase)
    break
}

switch (url.hostname) {
  case 'store.steampowered.com':
    steamStore.inject(exophase)
    break
  case 'steamcommunity.com':
    steamCommunity.inject(exophase)
    break
}

switch (url.hostname) {
  case 'steamdb.info':
    steamdb.inject(exophase)
    break
}

switch (url.hostname) {
  case 'astats.astats.nl':
    astats.inject(mgs)
    break
}

switch (url.hostname) {
  case 'store.steampowered.com':
    steamStore.inject(mgs)
    break
  case 'steamcommunity.com':
    steamCommunity.inject(mgs)
    break
}

switch (url.hostname) {
  case 'steamdb.info':
    steamdb.inject(mgs)
    break
}

switch (url.hostname) {
  case 'astats.astats.nl':
    astats.inject(steamhunters)
    break
}

switch (url.hostname) {
  case 'store.steampowered.com':
    steamStore.inject(steamhunters)
    break
  case 'steamcommunity.com':
    steamCommunity.inject(steamhunters)
    break
}

switch (url.hostname) {
  case 'steamdb.info':
    steamdb.inject(steamhunters)
    break
}

switch (url.hostname) {
  case 'astats.astats.nl':
    astats.inject(steamdb)
    break
}

switch (url.hostname) {
  case 'store.steampowered.com':
    steamStore.inject(ascouts)
    break
  case 'steamcommunity.com':
    steamCommunity.inject(ascouts)
    break
}

switch (url.hostname) {
  case 'steamdb.info':
    steamdb.inject(ascouts)
    break
}
