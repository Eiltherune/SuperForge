// ==UserScript==
// @name         ForgePlus2
// @namespace    http://tampermonkey.net/
// @version      0.12
// @description  try to take over the world!
// @author       You
// @match        https://*.forgeofempires.com/game/index*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_getResourceURL
// @run-at       document-body
// @require      https://ajax.googleapis.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @require      https://raw.githubusercontent.com/caldwell/renderjson/master/renderjson.js
// @require      https://raw.githubusercontent.com/Eiltherune/SuperForge/main/scripts/helpers.js
// @resource     city_entities https://raw.githubusercontent.com/Eiltherune/SuperForge/main/json/city_entities.json
// @resource     idle_game https://raw.githubusercontent.com/Eiltherune/SuperForge/main/json/idle_game.json
// @resource     assetMap https://raw.githubusercontent.com/Eiltherune/SuperForge/main/json/assetmap.json
// @resource     gb_data https://raw.githubusercontent.com/Eiltherune/SuperForge/main/json/gb_data.json
// @resource     portraits  https://raw.githubusercontent.com/Eiltherune/SuperForge/main/xml/portraits.xml
// @resource     forgeCSS https://raw.githubusercontent.com/Eiltherune/SuperForge/css/SuperForge.css
// ==/UserScript==
// 

/*
Set up core variables
*/
let game_Data = new GameData()
let gbData = JSON.parse(GM_getResourceText('gb_data'))
let old_gameData = localStorage.getItem('game_Data');

(function () {
  $('#game_body')
    .append($($E('div', 'info-panel'))
      .append($($E('div', 'data-panel'))
        .append($($E('div', 'panel hidden', { id: 'overview-panel' }))
          .append($($E('span', 'panel-h1', { text: 'City Overview' }))))
        .append($($E('div', 'panel hidden', { id: 'plunder-panel' }))
          .append($($E('span', 'panel-h1', { text: 'Plunder Assistant' }))))
        .append($($E('div', 'panel hidden', { id: 'leveler-panel' }))
          .append($($E('span', 'panel-h1', { text: 'Great Building Leveler' }))))
        .append($($E('div', 'panel', { id: 'sniper-panel' }))
          .append($($E('div', 'title', { text: 'Great Building Sniper' })))
          .append($($E('div', 'panel-content'))))
        .append($($E('div', 'panel hidden', { id: 'gbg-panel' }))
          .append($($E('span', 'panel-h1', { text: 'Guild Battlegrounds' }))))
        .append($($E('div', 'panel hidden', { id: 'auction-panel' }))
          .append($($E('span', 'panel-h1', { text: 'Antiques Dealer' }))))
        .append($($E('div', 'panel hidden', { id: 'inventory-panel' }))
          .append($($E('span', 'panel-h1', { text: 'Inventory' }))))
        .append($($E('div', 'panel hidden', { id: 'tavern-panel' }))
          .append($($E('span', 'panel-h1', { text: 'Friends Tavern' }))))
        .append($($E('div', 'panel hidden', { id: 'army-panel' }))
          .append($($E('span', 'panel-h1', { text: 'Military Overview' }))))
        .append($($E('div', 'panel hidden', { id: 'market-panel' }))
          .append($($E('span', 'panel-h1', { text: 'Market Overview' }))))
        .append($($E('div', 'panel hidden', { id: 'event-panel' }))
          .append($($E('span', 'panel-h1', { text: 'Event Overview' })))
          .append($($E('div', 'panel-content'))))
      )
      .append($($E('div', 'menu-panel'))
        .append($($E('button', 'menu-button', { text: 'Overview' })))
        .append($($E('button', 'menu-button hidden', { text: 'Plunder', disabled: true })))
        .append($($E('button', 'menu-button hidden', { text: 'Leveler', disabled: true })))
        .append($($E('button', 'menu-button', { text: 'Sniper' })))
        .append($($E('button', 'menu-button hidden', { text: 'GBG', disabled: true })))
        .append($($E('button', 'menu-button hidden', { text: 'Auction', disabled: true })))
        .append($($E('button', 'menu-button hidden', { text: 'Inventory', disabled: true })))
        .append($($E('button', 'menu-button hidden', { text: 'Tavern', disabled: true })))
        .append($($E('button', 'menu-button hidden', { text: 'Army', disabled: true })))
        .append($($E('button', 'menu-button hidden', { text: 'Market', disabled: true })))
        .append($($E('button', 'menu-button', { text: 'Event' })))
      )
    )
  if (document.documentURI.startsWith('http://localhost')) {
    let responseButtons = $('.response-button')
    for (let button of responseButtons) {
      button.onclick = function () {
        let response = JSON.parse(GM_getResourceText(`response_${button.id.slice(-1)}`))
        handleResponse(response)
      }
    }
    for (let i = 1; i < 5; i++) {
      handleResponse(JSON.parse(GM_getResourceText(`response_${i}`)))
    }
  }
  else {
    const forgeCSS = GM_getResourceText('forgeCSS')
    GM_addStyle(forgeCSS)

  }
  let menuButtons = $('.menu-button')
  for (let button of menuButtons) {
    button.addEventListener('click', () => {
      togglePanel(`${button.innerText.toLowerCase()}`)
    })
  }

  let open = XMLHttpRequest.prototype.open
  // noinspection JSValidateTypes
  XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
    // noinspection JSUnusedLocalSymbols
    this.addEventListener('load', function (event) {
      let urlString
      if (typeof url === "string") {
        urlString = url
      } else {
        urlString = url.href
      }
      if (/json\?h/.test(urlString)) {
        handleResponse(JSON.parse(this.responseText))
      }
    })
    return open.apply(this, arguments)
  }

})()

/**
 * 
 * @param {string[] }response
 */
function handleResponse (response) {
  for (const resp of response) {
    const res = new InnoResponse(resp)
    let classMethod = `${res.requestClass}.${res.requestMethod}`
    // let class_Method = `${res.requestClass}_${res.requestMethod}`
    // let data = res.responseData
    let tryFunction = `${res.requestClass}(res.requestMethod, res.responseData)`
    switch (res.requestClass) {
      case 'BoostService':
        BoostService(res.requestMethod, res.responseData)
        break
      case 'IdleGameService':
        // ToDo: Idle Game needs a lot of work still
        // IdleGameService(res.requestMethod, res.responseData)
        break
      case 'TimeService':
        game_Data = TimeService(res.requestMethod, res.responseData, game_Data)
        break
      default:
        try {
          eval(tryFunction)
        } catch (error) {
          console.log(error)
          console.log(`${classMethod} is not handled yet.`)
        }
        break
    }
    // switch (classMethod) {
    //   case 'GreatBuildingsService.getOtherPlayerOverview':
    //     togglePanel('sniper')
    //     SnipingOverview(data)
    //     break
    //   case 'IdleGameService.getState':
    //     togglePanel('event')
    //     idleGame(data)
    //     break
    //   default:
    //     try {
    //       eval(class_Method + '(data)')
    //     } catch {
    //       game_Data[class_Method] = data
    //     }
    // }
  }
  localStorage.setItem('game_Data', JSON.stringify(game_Data))
}

function CrmService (method, data) {}

function ForgePlusPackageService (method, data) {}

function LogService (method, data) {}

function PremiumService (method, data) {}

function CashShopService (method, data) {}

function ItemShopService (method, data) {}

function IgnorePlayerService (method, data) {}

function SaleInfoService (method, data) {}

function NoticeIndicatorService (method, data) {}

function AutoAidService (method, data) {}

function StaticDataService (method, data) {}

function TutorialService (method, data) {}

function TrackingService (method, data) {}

function AnnouncementsService (method, data) {}

function AntiquesDealerService (method, data) {
  if (method === 'initComponentData') {

  }
  else {
    console.log('AntiquesDealer', method, data)
  }
}

function ArmyUnitManagementService (method, data) {
  if (method === 'getArmyInfo') {

  }
  else {
    console.log('ArmyUnit', method, data)
  }
}

function BattlefieldService (method, data) {
  if (method === 'startByBattleType') {

  }
  else {
    console.log('Battlefield', method, data)
  }
}

function BlueprintService (method, data) {
  if (method === 'setUsed') {

  }
  else if (method === 'unlockLevel') {

  }
  else {
    console.log('Blueprint', method, data)
  }
}

function BonusService (method, data) {
  if (method === 'getBonuses') {
    data.forEach((bonus) => {
      game_Data.Bonuses.Persistent[bonus.type] = bonus.value
    })
  }
  else if (method === 'getLimitedBonuses') {
    data.forEach((bonus) => {
      game_Data.Bonuses.Limited[bonus.type] = {amount: bonus.amount, value: bonus.value, source: bonus.entityId}
    })
  }
  else {
    console.log('Bonus', method)
  }
}

function BoostService (method, data) {
  if (method === 'getTimerBoost') {
    data['boosts'].forEach((boost) => {
      game_Data.Boosts.Timed[boost.type] = { value: boost.value, expire: data['expireTime'] }
    })
  }
  else if (method === 'getAllBoosts') {
    data.forEach((boost) => {
      let bType = boost['type']
      let bValue = boost['value']
      let bOrigin = boost['origin']
      let bEntity
      if (bOrigin.slice(0, 1) === 'b') {
        bEntity = boost['entityId']
      }
      else {
        bEntity = boost['originId']
      }
      if (!(bType in game_Data.Boosts.Static)) {
        game_Data.Boosts.Static[bType] = {}
        game_Data.Boosts.Static[bType].Value = 0
        game_Data.Boosts.Static[bType].Sources = {}
      }
      if (!(bOrigin in game_Data.Boosts.Static[bType].Sources)) {
        game_Data.Boosts.Static[bType].Sources[bOrigin] = {}
      }
      let b = game_Data.Boosts.Static[bType]
      b.Value += bValue
      if (bEntity in b.Sources[bOrigin]) {
        b.Sources[bOrigin][bEntity] += bValue
      }
      else {
        b.Sources[bOrigin][bEntity] = bValue
      }
    })
  }
  else if (method === 'addBoost') {

  }
  else if (method === 'extendTimerBoosts') {

  }
  else {
    console.log('Boost', method)
  }
}

function CampaignService (method, data) {
  if (method === 'getDeposits') {
    Object.keys(data['states']).forEach((key) => {
      game_Data.Deposits[key] = data['states'][key]
    })
  }
  else if (method === 'start') {
  }
  else if (method === 'getProvinceData') {
  }
  else if (method === 'infiltrate') {
  }
  else {
    console.log('Campaign', method)
  }
}

function CastleSystemService (method, data) {
  if (method === 'getCastleSystemPlayer') {
    game_Data.Castle.Player = data
  }
  else if (method === 'getOverview') {
    game_Data.Castle.Overview = data
  }
  else {
    console.log('Castle', method)
  }
}

function ChallengeService (method, data) {
  if (method === 'getActiveChallenges') {
  }
  else if (method === 'getOptions') {
  }
  else {
    console.log('Challenge', method)
  }
}

function ChampionshipService (method, data) {
  if (method === 'getOverview') {

  }
  else {
    console.log('Championship', method)
  }
}
function ChestEventService (method, data) {
  if (method === 'getOverview') {

  }
  else {
    console.log('ChestEvent', method)
  }
}

function CityMapService (method, data) {
  if (method === 'getNextId') {
  }
  else if (method === 'updateEntity') {
  }
  else {
    console.log('CityMap', method)
  }
}

function CityProductionService (method, data) {
  if (method === 'pickupProduction') {

  }
  else if (method === 'startProduction') {
  }
  else if (method === 'cancelProduction') {
  }
  else {
    console.log('CityProduction', method)
  }
}

function ClanRecruitmentService (method, data) {
  if (method === 'getPlayerRecruitments') {

  }
  else {
    console.log('ClanRecruitment', method)
  }
}

function ClanService (method, data) {
  if (method === 'getOwnClanData') {

  }
  else if (method === 'getTreasury') {
  }
  else {
    console.log('Clan', method)
  }
}

function ConversationService (method, data) {
  if (method === 'getOverviewForCategory') {

  }
  else if (method === 'getConversation') {
  }
  else if (method === 'markMessageRead') {
  }
  else if (method === 'getCategory') {
  }
  else {
    console.log('Conversation', method)
  }
}

function EmissaryService (method, data) {
  if (method === 'getAssigned') {
  }
  else {
    console.log('Emissary', method)
  }
}

function EventModifierService (method, data) {
  if (method === 'getCurrent') {

  }
  else {
    console.log('EventModifier', method)
  }
}
function EventPassService (method, data) {
  if (method === 'getPreview') {
    let panel = $('#event-panel .panel-content')
    // There is an active event, so load the appropriate sidebar
    switch (data['context']) {
      case 'anniversary_event':
        anniversaryEvent(data)
        break
      default:
        console.log('This event is not handled yet.')
    }
  }
  else {
    console.log('EventPass', method)
  }
}

function FriendService (method, data) {
  if (method === 'getInvitationLink') {
  }
  else {
    console.log('Friend', method)
  }
}

function FriendsTavernService (method, data) {
  if (method === 'getSittingPlayersCount') {
  }
  else if (method === 'getOtherTavernStates') {
  }
  else if (method === 'getConfig') {

  }
  else if (method === 'getOwnTavern') {

  }
  else if (method === 'getOtherTavern') {
  }
  else if (method === 'getOtherTavernState') {
  }
  else {
    console.log('FriendsTavern', method)
  }
}

function GreatBuildingsService (method, data) {
  if (method === 'getOtherPlayerOverview') {
    let playerId = data[0]['player']['player_id']
    let myArcBonus = 1
    try {
      myArcBonus += game_Data.Bonuses.Limited['contribution_boost'].value / 100
    } catch {

    }
    let snipingTable = $('#sniper-panel .panel-content')
    let p = game_Data.Social.Neighbors[data[0]['player']['player_id']]
    let clan = p.clanId
    let flag = clan ? p.clanFlag.toLowerCase() : 'deleted_flag'
    snipingTable.empty()
      .append($($E('div', 'playerInfo'))
        .append($($E('img', 'playerAvatar', { src: asset(avatar(p.avatar)) })))
        .append($($E('img', 'playerGuild', { src: asset(`/shared/clanflags/${flag}.jpg`) })))
        .append($($E('span', 'playerIndex', { text: p.rank})))
        .append($($E('span', 'playerName', { text: p.name }))))
      .append($($E('div', 'data-table')))
    let panel = $('#sniper-panel .data-table')
    panel.empty()
      .append($($E('div', 'tableHeader columnNames'))
        .append($($E('div', 'gbIcon', { text: 'Bldg' })))
        .append($($E('div', 'gbLevel', { text: 'Lvl' })))
        .append($($E('div', 'gbProgress', { text: 'Progress' })))
        .append($($E('div', 'gbRank', { text: 'Rank/FP' })))
        .append($($E('div', 'gbStatus', { text: 'Status' }))))
    for (let building of data) {
      let b = new GBProgress(building)
      b.buildingData = gbData['gbsData'][gbData['city_entities'][b.entityId]['key']]
      b.short = gbData['city_entities'][b.entityId]['short']
      b.arcBoostedFP = Math.ceil(myArcBonus * b.rewardFP)
      let status = ''
      let negative = ''
      if (b.placedFP > 0) {
        status = b.arcBoostedFP - b.placedFP
        negative = status < 0 ? ' negative' : ''
      }
      else {
        let fpRemain = b.max - b.current
        let minSnipe = Math.ceil(fpRemain / 2)
        let rewards = b.buildingData['levels'][b.level]['reward']
        for (let reward of rewards) {
          if (minSnipe <= reward['fp'] * myArcBonus) {
            status = Math.ceil((reward['fp'] * myArcBonus) - minSnipe)
            break
          }
        }
      }
      panel
          .append($($E('div', 'tableRow'))
              .append($($E('div', 'gbIcon', { style: { backgroundImage: b.icon } })))
              .append($($E('div', 'gbLevel', { text: b.level })))
              .append($($E('div', 'gbProgress'))
                  .append($($E('span', 'gbProgressText', { text: `${b.current}/${b.max}` })))
                  .append($E('br'))
                  .append($($E('progress', 'gbProgressBar', { max: b.max, value: b.current }))))
              .append($($E('div', 'gbRankBox'))
                  .append($($E('span', 'gbRank', { text: b.rank > 0 ? b.rank : '' })))
                  .append($E('br'))
                  .append($($E('span', 'gbReward', { text: b.placedFP > 0 ? `${b.placedFP} FP` : '' }))))
              .append($($E('div', `gbStatusBox${negative}`, { text: status })))
          )
    }
  }
  else if (method === 'getConstruction') {
  }
  else {
    console.log('GreatBuilding', method)
  }
}

function GuildExpeditionService (method, data) {
  if (method === 'getOverview') {

  }
  else if (method === 'markContributionNotificationsRead') {
  }
  else if (method === 'getContributionList') {
  }
  else if (method === 'getEncounter') {
  }
  else if (method === 'getState') {
  }
  else if (method === 'getGuildReward') {
  }
  else if (method === 'openChest') {
  }
  else {
    console.log('GuildExpedition', method)
  }
}

function HiddenRewardService (method, data) {
  if (method === 'getOverview') {
  }
  else if (method === 'collectReward') {
  }
  else {
    console.log('HiddenReward', method)
  }
}

/**
 * 
 * @param {string} method
 * @param {string} data
 */
function IdleGameService (method, data) {
  let countdowns = []
  let idleGameMetadata = JSON.parse(GM_getResourceText('idle_game'))['configs'][0]
  // console.log(idleGameData)
  if (method === 'getState') {
    let ig = game_Data.IdleGame = new IdleGameState(data, idleGameMetadata)
    let production = 0
    Object.keys(ig.Buildings).forEach((bld) => {
      if (bld.Name !== 'Festival' && bld.Name !== 'Shipyard') {
        production += (ig.Buildings[bld].Producing / ig.Buildings[bld].Speed)
      }
    })
    let transport = ig.Buildings['transport_1'].Producing / (ig.Buildings['transport_1'].Speed * 2)
    let earn = ig.Buildings['market_1'].Producing / ig.Buildings['market_1'].Speed
    togglePanel('event')
    let overviewTable = new DataTable(2, 'h2')
    overviewTable.addRow(['City', ig.Stage === 1 ? 'Tutorial' : ig.Stage])
    overviewTable.addRow(['Tasks Completed',  `${ig.Tasks.CompletedTasks.length}/38`])
    overviewTable.addRow(['Grand Prize Progress', $E('progress', 'eventProgress', { max: 25, value: 5 })])
    let productionTable = new DataTable(4, 'h2')
    productionTable.addHeader(['Building', 'Shamrocks \n/second', 'Level', 'Manager'])
    Object.keys(ig.Buildings).forEach((bldg) => {
      productionTable.addRow([ig.Buildings[bldg].Name, CleanNumber(ig.Buildings[bldg].YieldPS), ig.Buildings[bldg].Level, ig.Buildings[bldg].Manager])

    })
    let questTable = new DataTable(4, 'h3')
    questTable.addHeader(['Task #', 'Objective', 'Quest Progress', 'Time to Complete'])
    Object.keys(ig.Tasks.InProgressTasks).forEach((task) => {
      let t = ig.Tasks.InProgressTasks[task]
      questTable.addRow([
        t.TaskId,
        t.Objective,
        $E('progress', 'taskProgress', { max: t.Required, value: t.Progress }),
        $E('div', null, {id: `countdown-task-${t.TaskId}`})])
      function calculateCountdown(required, progress, taskId, building='market_1') {
        let timeToComplete = 0
        if (taskId === 16 || taskId === 31) {
          let workshopsPS = 0
          for (let ws=1; ws<6; ws++) {
            workshopsPS += (ig.Buildings[`workshop_${ws}`].Producing / ig.Buildings[`workshop_${ws}`].Speed)
          }
          timeToComplete = Math.ceil((required - progress) / workshopsPS)
        } else {
          if (required > progress) {
            timeToComplete = Math.ceil((required - progress) / ig.Buildings[building].Producing) * ig.Buildings[building].Speed
          }
        }
        let readyAt = new Date().getTime() + timeToComplete*1000
        countdowns.push([taskId, readyAt])
      }
      switch(t.Type) {
        case 'reach_character_level':
          let cost = 0
          for (let u=t.Progress; u<t.Required; u++) {
            let lvCost = Math.ceil(ig.Buildings[t.Target[0]].baseUpgradeCost * (ig.Buildings[t.Target[0]].upgradeRate ** (u - 1)))
            cost += lvCost
          }
          calculateCountdown(cost, ig.Shamrocks, t.TaskId)
          break
        case 'collect_idle_currency':
          calculateCountdown(t.Required, t.Progress, t.TaskId, t.Target[0])
          break
        case 'upgrade_character':
          let upgrades = []
          let totalCost = 0
          let levels = {
            'workshop_1': ig.Buildings['workshop_1'].Level,
            'workshop_2': ig.Buildings['workshop_2'].Level,
            'workshop_3': ig.Buildings['workshop_3'].Level,
            'workshop_4': ig.Buildings['workshop_4'].Level,
            'workshop_5': ig.Buildings['workshop_5'].Level,
            'transport_1': ig.Buildings['transport_1'].Level,
            'market_1': ig.Buildings['market_1'].Level
          }
          for (let u=t.Progress; u<t.Required; u++) {
            let minCost = Infinity
            let bldg = null
            for (let b in levels) {
              if (levels[b] > 0) {
                let bldgCost = Math.ceil(ig.Buildings[b].baseUpgradeCost * (ig.Buildings[b].upgradeRate ** (levels[b] - 1)))
                if (Math.min(minCost, bldgCost) === bldgCost){
                  minCost = bldgCost
                  bldg = b
                }
              }
            }
            levels[bldg]++
            totalCost += minCost
            console.log(bldg, minCost, totalCost)
            // let availableBuildings = []
            // // let availWS2 = ig.Buildings[0].Level > 0
            // // let availWS3 = ig.Buildings[1].Level > 0 
            // // let availWS4 = ig.Buildings[2].Level > 0 
            // // let availWS5 = ig.Buildings[3].Level > 0
            // let minCost = Math.ceil(ig.Buildings['transport_1'].baseUpgradeCost * (ig.Buildings['transport_1'].upgradeRate ** (ig.Buildings['transport_1'].Level - 1)))
            // Object.keys(ig.Buildings).forEach((building) => {
            //   let b = ig.Buildings[building]
            //   if (b.Level > 0) {
            //     let cost = Math.ceil(b.baseUpgradeCost * (b.upgradeRate ** (b.Level - 1)))
            //     console.log(b, building, minCost, cost)
            //   }
            // })
          }
          break
      }
    })
    // productionTable.addRow()
    $('#event-panel .panel-content').empty()
      .append(overviewTable.table.outerHTML)
      .append($($E('div', 'h2 section', {html: 'Building Output'})))
      .append(productionTable.table.outerHTML)
      .append($($E('div', 'h2 section', {html: 'Active Tasks'})))
      .append(questTable.table.outerHTML)
      //     .append($($E('div', 'tableCell right', { text: 'Grand Prize\nProgress' })))
      //     .append($($E('div'))
      //       .append($($E('div', null, { text: '' })))))
      //   .append($($E('div','tableRow h2'))
      //     .append($($E('div', 'tableCell right', { text: 'Production\nper Second' })))
      //     .append($($E('div', 'tableCell', { text: CleanNumber(production) }))))
      //   .append($($E('div','tableRow h2'))
      //     .append($($E('div', 'tableCell right', { text: 'Transport\nper Second' })))
      //     .append($($E('div', 'tableCell', { text: CleanNumber(transport) }))))
      //   .append($($E('div','tableRow h2'))
      //     .append($($E('div', 'tableCell right', { text: 'Earn\nper Second' })))
      //     .append($($E('div', 'tableCell', { text: CleanNumber(earn) }))))
      // )
    countdowns.forEach((countdown) => {
      Countdown(countdown[0], countdown[1])
    })
  }
  else if (method === 'performActions') {
  }
  else if (method === 'completeStage') {
  }
  else {
    console.log('IdleGame', method)
  }
}

function InventoryService (method, data) {
  if (method === 'getItems') {
  }
  else if (method === 'getGreatBuildings') {
  }
  else if (method === 'getItem') {
  }
  else if (method === 'getItemAmount') {
  }
  else {
    console.log('Inventory', method)
  }
}

function ItemAuctionService (method, data) {
  if (method === 'getAuction') {

  }
  else {
    console.log('ItemAuction', method)
  }
}

function ItemExchangeService (method, data) {
  if (method === 'getConfig') {
  }
  else if (method === 'getOngoing') {
  }
  else if (method === 'getOverview') {

  }
  else {
    console.log('ItemExchange', method)
  }
}

function LeagueService (method, data) {
  if (method === 'getLeaguesConfig') {
  }
  else if (method === 'getRank') {

  }
  else {
    console.log('League', method)
  }
}
function MergerGameService (method, data) {
  if (method === 'getOverview') {
  }
  else {
    console.log('MergerGame', method)
  }
}
function MessageService (method, data) {
  if (method === 'newMessage') {
  }
  else {
    console.log('Message', method)
  }
}

function OtherPlayerService (method, data) {
  if (method === 'getSocialList') {
    let socialKeys = {friends: 'Friends', neighbours: 'Neighbors', guildMembers: 'Guild'}
    for (let keyList in socialKeys) {
      data[keyList].forEach((otherPlayer) => {
        game_Data.Social[socialKeys[keyList]][otherPlayer['player_id']] = new OtherPlayer(otherPlayer)
      })
    }
  }
  else if (method === 'getAwaitingFriendRequestCount') {
  }
  else if (method === 'updateActions') {
  }
  else if (method === 'getEventsPaginated') {
  }
  else if (method === 'getCityProtections') {
  }
  else {
    console.log('OtherPlayer', method)
  }
}

function OutpostService (method, data) {
  if (method === 'getAll') {
  }
  else {
    console.log('Outpost', method)
  }
}

function PlayerProfileService (method, data) {
  if (method === 'getFreeNameChangeTime') {
  }
  else {
    console.log('PlayerProfile', method)
  }
}

function QuestService (method, data) {
  if (method === 'getUpdates') {

  }
  else {
    console.log('Quest', method)
  }
}

function RankingService (method, data) {
  if (method === 'newRank') {
  }
  else {
    console.log('Ranking', method)
  }
}

function ResearchService (method, data) {
  if (method === 'getProgress') {
  }
  else {
    console.log('Research', method)
  }
}

function ResourceService (method, data) {
  if (method === 'getResourceDefinitions') {
  }
  else if (method === 'getPlayerResources') {
  }
  else if (method === 'getPlayerAutoRefills') {
  }
  else if (method === 'getResourceDefinition') {
  }
  else {
    console.log('Resource', method)
  }
}

function ResourceShopService (method, data) {
  if (method === 'getContexts') {

  }
  else if (method === 'buyOffer') {

  }
  else {
    console.log('ResourceShop', method)
  }
}

function RewardDeckService (method, data) {
  if (method === 'getDeck') {
  }
  else if (method === 'pickOption') {
  }
  else if (method === 'pickAllOptions') {
    // Not used
  }
  else if (method === 'finish') {
    // Not used
  }
  else {
    console.log('RewardDeck', method)
  }
}

function RewardService (method, data) {
  if (method === '') {

  }
  else if (method === 'collectReward') {
  }
  else if (method === 'collectRewardSet') {
  }
  else {
    console.log('Reward', method)
  }
}

function SeasonalEventService (method, data) {
  if (method === 'initMainComponentsData') {

  }
  else {
    console.log('SeasonalEvent', method)
  }
}

function SettingsService (method, data) {
  if (method === 'updateSettings') {

  }
  else {
    console.log('Settings', method)
  }
}

function StartupService (method, data) {
  if (method === 'getData') {
  }
  else {
    console.log('Startup', method)
  }
}

function TimedSpecialRewardService (method, data) {
  if (method === 'getTimedSpecial') {
  }
  else {
    console.log('TimedSpecialReward', method)
  }
}
function TimerService (method, data) {
  if (method === 'getTimers') {
  }
  else {
    console.log('Timer', method)
  }
}

function TimeService (method, data) {
  if (method === 'updateTime') {
    game_Data.LastUpdate = data['time']
  }
  return game_Data
}

function TradeService (method, data) {
  if (method === 'getTradeOffers') {

  }
  else {
    console.log('Trade', method)
  }
}


function SnipingOverview (data) {
}