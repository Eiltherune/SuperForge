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
// @run-at       document-body
// @require      https://ajax.googleapis.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @require      https://raw.githubusercontent.com/caldwell/renderjson/master/renderjson.js
// @require      https://raw.githubusercontent.com/Eiltherune/SuperForge/main/scripts/helpers.js
// @resource     city_entities https://raw.githubusercontent.com/Eiltherune/SuperForge/main/json/city_entities.json
// @resource     assetMap https://raw.githubusercontent.com/Eiltherune/SuperForge/main/json/assetmap.json
// @resource     gb_data https://raw.githubusercontent.com/Eiltherune/SuperForge/main/json/gb_data.json
// ==/UserScript==

(function () {
  let styleSheet = document.createElement('link')
  styleSheet.rel = 'stylesheet'
  styleSheet.href = 'http://localhost:8080/ForgePlus.css'
  document.head.append(styleSheet)

  let sidebar = GM_getResourceText('sidebar')

  $('#game_body').append(sidebar)
  let open = XMLHttpRequest.prototype.open
  // noinspection JSValidateTypes
  XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
    // noinspection JSUnusedLocalSymbols
    this.addEventListener('load', function (event) {
      if (/json\?h/.test(url)) {
        console.dir([url, JSON.parse(this.responseText )])
        handleJson(JSON.parse(this.responseText))
      }
    })
    return open.apply(this, arguments)
  }
})()

let activePanel = 'overview-panel'

function toggle (panelId) {
  document.getElementById(activePanel).classList.toggle('hidden')
  activePanel = panelId
  document.getElementById(panelId).classList.toggle('hidden')
}

function collapse(fieldset) {
  document.getElementById(fieldset).classList.toggle('expanded')
  console.log(fieldset)
}
/**
 *
 * @param {JSON} response
 */
function handleJson(response) {

}
/*

function setupOverview () {
  let panel = Panels.Overview
  let production = FS('Production', panel)
  let prodTable = TABLE('production', ['production-table'], production)
  let prodHeader = TR('production-table', [], ['Building', 'Product', 'Time'], true)
  let viewAll = document.createElement('button')
  let modal = document.createElement('div')
  document.body.append(modal)
  viewAll.classList.add('view-all')
  viewAll.id = 'modalButton'
  let modalData
  viewAll.onclick = function () {
    modal.style.display = 'block'
  }
  viewAll.appendChild(SPAN('View all buildings'))
  modal.id = 'modal'
  modal.classList.add('modal')
  let modalContent = document.createElement('div')
  modalContent.id = 'modalContent'
  modalContent.classList.add('modalContent')
  let template = { '<>': 'li', 'text': '${s}' }
  modalContent.appendChild(renderjson(cityData))
  let modalHeader = document.createElement('div')
  modalHeader.classList.add('modalHeader')
  let modalClose = document.createElement('span')
  modalClose.classList.add('modalClose')
  modalClose.innerHTML = '&times;'
  modalClose.onclick = function () {
    modal.style.display = 'none'
  }
  modalHeader.appendChild(modalClose)
  modal.appendChild(modalHeader)
  modal.appendChild(modalContent)
  panel.appendChild(viewAll)
  let incidents = FS('Incidents', panel)
  let tavern = FS('Tavern Overview', panel)
}


const gb_data = JSON.parse(GM_getResourceText('gb_data'))
const eras = {
  0: 'StoneAge',
  1: 'BronzeAge',
  2: 'IronAge',
  3: 'EarlyMiddleAge',
  4: 'HighMiddleAge',
  5: 'LateMiddleAge',
  6: 'ColonialAge',
  7: 'IndustrialAge',
  8: 'ProgressiveEra',
  9: 'ModernEra',
  10: 'PostModernEra',
  11: 'ContemporaryEra',
  12: 'TomorrowEra',
  13: 'FutureEra',
  14: 'ArcticFuture',
  15: 'OceanicFuture',
  16: 'VirtualFuture',
  17: 'SpaceAgeMars',
  18: 'SpaceAgeAsteroidBelt',
  19: 'SpaceAgeVenus',
  20: 'SpaceAgeJupiterMoon'
}



let cityData = { 'Production': {}, 'Boosts': {}, 'Entities': {} }
let cityStats = { 'Population': 0, 'Happiness': 0 }
let cityEntities = { 'AllEntities': {} }

function handleResponse (response) {
  let responseData = {}
  for (const resp of response) {
    const res = new Response(resp)
    let classMethod = `${res.requestClass}.${res.requestMethod}`
    let data = res.responseData
    switch (classMethod) {
      case 'StartupService.getData':
        responseData.startup = data
        startup(new Data(data))
        // startup2(data)
        //ToDo:
        //   console.dir(cityEntities)
        //   console.dir(cityStats)
        //   console.dir(counts)
        break
      case 'BoostService.getTimerBoost':
        //ToDo:
        //   console.log(classMethod, { data })
        //   handleBoosts(data)
        break
      case 'BoostService.getAllBoosts':
        //ToDo:
        //   console.log(classMethod, { data })
        //   handleBoosts(data)
        break
      case 'TimeService.updateTime':
        responseData.time = data.time
        // console.log([data.time, { cityData }])
        // console.dir(cityData)
        break
      case 'GreatBuildingsService.getOtherPlayerOverview':
        // toggle('sniper-panel')
        handleSniper(data)
        break
      default:
      // console.log([`Response type ${classMethod} is not handled yet.`, data])
    }
  }
  // console.log(responseData)
}

function handleSniper (data) {
  printToHtml(data)
  let buildings = {}
  TABLE('sniping', ['sniping-table'], document.getElementById('container'))
  for (let building of data) {
    building = new GBProgress(building)
    let progressBar = document.createElement('meter')
    progressBar.max = building.max
    progressBar.value = building.current
    progressBar.innerText = '0'
    console.log(progressBar)
    TR('sniping-table', [], [building.name, progressBar])

  }
  printToHtml(buildings)
}

function printToHtml (data) {
  let dataDiv = $('#container')[0]
  dataDiv.appendChild(renderjson(data))
}

function startup (data) {
  const metaEntities = metaData('city_entities')
  let allEnt = cityEntities.AllEntities
  let counts = {}
  let cityStats = { 'Population': 0, 'Happiness': 0 }
  for (let e of data.city_map.entities) {
    counts[e.cityentity_id] = e.cityentity_id in counts ? counts[e.cityentity_id] + 1 : 1
    let meta = e.Meta = metaEntities[e.cityentity_id]
    e.Name = meta.name
    let [prefix, age, building] = e.cityentity_id.split('_')
    e.era = age === 'MultiAge' ? e.level : null
    if (e.Name.match(/.* - Lv\. \d/)) {
      e.Name = e.Name.split(' - ')[0]
    } else if (e.Name.match(/Lv\. \d* - /)) {
      e.Name = e.Name.split(' - ')[1]
    }
    let nameCount = counts[e.cityentity_id] === 1 ? `${e.Name}` : `${e.Name} ${counts[e.cityentity_id]}`
    // ToDo: console.log(nameCount)
  }
  // ToDo: console.log(counts)

  // printToHtml(cityEntities)

}

function startup2 (data) {
  const metaEntities = metaData('city_entities')
  for (let e of data.city_map.entities) {
    e = new CityEntity(e)

    if (!(e.type in cityEntities)) {
      cityEntities[e.type] = []
    }
    let meta = new Meta(metaEntities[e.cityentity_id])
    e.Metadata = meta
    e.Name = meta.name
    if (meta.is_multi_age) {
      let entityLevel = new EntityLevel(meta.entity_levels[e.level])
      e.Era = entityLevel.era
      if (entityLevel.provided_happiness) {
        e.Happiness = entityLevel.provided_happiness
        cityStats.Happiness += entityLevel.provided_happiness
      }
      if (entityLevel.provided_population) {
        e.Population = entityLevel.provided_population
        cityStats.Population += entityLevel.provided_population
      }
    } else if (e.type !== 'greatbuilding' && e.level) {
      e.Era = eras[e.level]
    } else if (e.type === 'greatbuilding') {
      e.Era = 'greatBuilding'
    } else {
      e.Era = e.cityentity_id.split('_')[1]
    }
    if (e.type === 'greatBuilding') {}
    if (meta.abilities.some((ability) => ability.bonuses)) {
      e.Boosts = {}
      e.Revenue = {}
      e.Units = {}
      for (let ability of meta.abilities) {
        ability = new Ability(ability)
        if (ability.bonuses) {
          for (let bonus of ability.bonuses) {
            bonus = new Bonus(bonus)
            if (bonus.boost) {
              let boost = new Boost(bonus.boost, e.Era)
              if (!(boost.boostType in e.Boosts)) {
                e.Boosts[boost.boostType] = 0
              }
              if (boost.boostType === 'happiness_amount') {
                e.Happiness += boost.boostValue
                cityStats.Happiness += boost.boostValue
              }
              e.Boosts[boost.boostType] += boost.boostValue
            }
            if (bonus.units) {
              //ToDo: Unit bonus
              console.log(`${e.Name} provides a unit bonus.`, bonus.units)
            }
            if (bonus.revenue) {
              let resource
              if ('AllAge' in bonus.revenue) {
                resource = bonus.revenue.AllAge
              } else {
                resource = bonus.revenue[e.Era]
              }
              for (let res in resource.resources) {
                if (!(res in e.Revenue)) {
                  e.Revenue[res] = 0
                }
                e.Revenue[res] += resource.resources[res]
              }
            }
          }
        }
        if (ability.boostHints) {
          let boost
          if ('AllAge' in ability.boostHints) {
            boost = ability.boostHints.AllAge
          } else {
            boost = ability.boostHints[e.Era]
          }
          if (!(boost.type in e.Boosts)) {
            e.Boosts[boost.type] = 0
          }
          e.Boosts[boost.type] += boost.value
        }
        if (ability.chainId) {
          let bonus = new Bonus(ability.bonusGiven)
          console.log(e.Name, ability.chainId, bonus)
        }
      }
    }
    cityEntities[e.type].push(e)
  }
}

class GBProgress {
  /!**
   * @param  building
   * @property building.max_progress
   *
   **!/
  constructor (building) {
    this.name = building.name
    this.current = 'current_progress' in building ? building.current_progress : 0
    this.max = building.max_progress
    this.level = building.level
  }
}

function Boost (boost, era) {
  if ('AllAge' in boost) {
    era = 'AllAge'
  }
  this.boostType = boost[era].type
  this.boostValue = boost[era].value
  // }
}

function Bonus (bonus) {
  this.bonusLevel = bonus.level
  if (bonus.revenue.length !== 0) {
    this.revenue = bonus.revenue
  }
  if (bonus.units.length !== 0) {
    this.units = bonus.units
  }
  if (bonus.boost.length !== 0) {
    this.boost = bonus.boost
  }
}

let counts = {
  'BuildingPlacementAbility': 0,
  'BuildingSetAbility': 0,
  'NotsellableAbility': 0,
  'NotmovableAbility': 0,
  'OffGridBuildingAbility': 0,
  'BonusOnSetAdjacencyAbility': 0,
  'BoostAbility': 0,
  'MotivatableAbility': 0,
  'DoubleProductionWhenMotivatedAbility': 0,
  'PolishableAbility': 0
}

function Ability (ability) {
  this.__class__ = ability.__class__
  this.bonuses = null
  this.setId = null
  this.boostHints = null
  this.motivatable = false
  this.polishable = false

  switch (this.__class__) {
    case 'BuildingPlacementAbility':
    case 'BuildingSetAbility':
    case 'NotsellableAbility':
    case 'NotmovableAbility':
    case 'OffGridBuildingAbility':
      break
    case 'BonusOnSetAdjacencyAbility':
      this.bonuses = ability.bonuses
      this.setId = ability.setId
      break
    case 'BoostAbility':
      this.boostHints = ability.boostHints[0].boostHintEraMap
      break
    case 'MotivatableAbility':
    case 'DoubleProductionWhenMotivatedAbility':
      this.motivatable = true
      break
    case 'PolishableAbility':
      this.polishable = true
      break
    case 'ChainLinkAbility':
      this.bonusGiven = ability.bonusGiven
      this.bonuses = ability.bonuses
      this.chainId = ability.chainId
      break
    default:
      console.log(ability)
  }
  counts[this.__class__] += 1

}

function EntityLevel (level) {
  this.provided_happiness = level.provided_happiness
  this.provided_population = level.provided_population
  this.era = level.era
}

function Meta (meta) {
  this.is_multi_age = 'is_multi_age' in meta ? meta.is_multi_age : null
  this.entity_levels = meta.entity_levels
  this.name = meta.name
  this.staticResources = meta.staticResources
  this.abilities = meta.abilities
  if ('components' in meta) {
    this.components = meta.components
  }
}

function CityEntity (entity) {
  this.type = entity.type
  this.cityentity_id = entity.cityentity_id
  this.level = entity.level
  this.id = entity.id
}

function Data (data) {
  this.city_map = 'city_map' in data ? data.city_map : null
}

for (let response = 1; response < 6; response++) {
  handleResponse(JSON.parse(GM_getResourceText(`response_${response}`)))
}

*/
