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
// @resource     battleground_leagues http://localhost:8080/json/battleground_leagues.json
// @resource     building_chains http://localhost:8080/json/building_chains.json
// @resource     building_sets http://localhost:8080/json/building_sets.json
// @resource     grid http://localhost:8080/json/grid.json
// @resource     info_screens http://localhost:8080/json/info_screens.json
// @resource     boost_metadata http://localhost:8080/json/boost_metadata.json
// @resource     building_upgrades http://localhost:8080/json/building_upgrades.json
// @resource     castle_system_levels http://localhost:8080/json/castle_system_levels.json
// @resource     selection_kits http://localhost:8080/json/selection_kits.json
// @resource     unit_types http://localhost:8080/json/unit_types.json
// @resource     quest_tabs http://localhost:8080/json/quest_tabs.json
// @resource     city_entities http://localhost:8080/json/city_entities.json
// @resource     assetMap http://localhost:8080/json/assetmap.json
// ==/UserScript==
const metadataById = {
  'battleground_leagues': 'id',
  'building_chains': 'id',
  'building_sets': 'id',
  'city_entities': 'id',
  'grid': 'id',
  'info_screens': 'id',
  'boost_metadata': 'type',
  'building_upgrades': 'upgradeItem.id',
  'castle_system_levels': 'level',
  'selection_kits': 'selectionKitId',
  'unit_types': 'unitTypeId',
  'quest_tabs': 'id'
}
let metadata = {}
for (const meta in metadataById) {
  metadata[meta] = {}
  if (meta === 'building_upgrades') {
    for (const entity of JSON.parse(GM_getResourceText(meta))) {
      metadata[meta][entity.upgradeItem.id] = entity
    }
  } else {
    for (const entity of JSON.parse(GM_getResourceText(meta))) {
      metadata[meta][entity[metadataById[meta]]] = entity
    }
  }
}
let cityData = { 'Production': {}, 'Boosts': {}, 'Entities': {} }
let assetMap = JSON.parse(GM_getResourceText('assetMap'))

function asset (assetPath) {
  const assetDot = assetPath.lastIndexOf('.')
  const assetPath1 = assetPath.slice(0, assetDot)
  const assetPath2 = assetPath.slice(assetDot)
  const assetObf = assetMap[assetPath]
  return `https://foeus.innogamescdn.com/assets${assetPath1}-${assetObf}${assetPath2}`
}

function DIV (id, dClass, parent) {
  const element = document.createElement('div')
  element.id = id
  dClass.forEach(dC => element.classList.add(dC))
  if (parent) {
    parent.appendChild(element)
  }
  return element
}

function IMG (src, alt) {
  const img = document.createElement('img')
  img.src = src
  img.alt = alt
  return img
}

function BUTTON (bClass, text, parent) {
  const button = document.createElement('button')
  bClass.forEach(bC => button.classList.add(bC))
  button.addEventListener('click', () => {toggle(`${text.toLowerCase()}-panel`)})
  button.appendChild(SPAN(text))
  parent.appendChild(button)
}

function FS (legend, parent, id) {
  const fs = document.createElement('fieldset')
  fs.id = id ? id : legend.toLowerCase().replace(' ', '-')
  fs.className = 'collapsible expanded'
  const fsLegend = document.createElement('legend')
  fsLegend.innerText = legend
  fsLegend.addEventListener('click', () => {
    fs.classList.toggle('expanded')
  })
  fs.appendChild(fsLegend)
  parent.appendChild(fs)
  return fs
}

function SPAN (text) {
  const span = document.createElement('span')
  span.innerText = text
  return span
}

function TABLE (id, tClass, parent) {
  const table = document.createElement('table')
  table.id = `${id}-table`
  tClass.forEach(tC => table.classList.add(tC))
  parent.appendChild(table)
  return table
}

function TR (tableId, rClass, cells, isHeader) {
  const row = document.createElement('tr')
  const cellType = isHeader ? 'th' : 'td'
  cells.forEach(value => {
    const cell = document.createElement(cellType)
    if (typeof value === 'string') {
      cell.innerText = value
    } else {
      cell.innerHTML = value.innerHTML
    }
    row.appendChild(cell)
  })
  const table = document.getElementById(tableId)
  table.appendChild(row)
  return row
}

async function waitForElementById (id, timeout = null, location = document.body) {
  return new Promise((resolve) => {
    let element = document.getElementById(id)
    if (element) {
      return resolve(element)
    }
    const observer = new MutationObserver(async () => {
      let element = document.getElementById(id)
      if (element) {
        resolve(element)
        observer.disconnect()
      } else {
        if (timeout) {
          async function timeOver () {
            return new Promise((resolve) => {
              setTimeout(() => {
                observer.disconnect()
                resolve(false)
              }, timeout)
            })
          }

          resolve(await timeOver())
        }
      }
    })
    observer.observe(location, {
      childList: true,
      subtree: true,
    })
  })
}

const Panels = []
waitForElementById('game_body').then(() => {
  const infoPanel = DIV('info-panel', ['panel-base'], document.getElementById('game_body'))
  const dataPanel = DIV('data-panel', ['panel-base'], infoPanel)
  const panels = ['Overview', 'Plunder', 'Leveler', 'Sniper', 'GBG', 'Auction', 'Inventory', 'Tavern', 'Army', 'Market']
  const menuPanel = DIV('menu-panel', ['menu'], infoPanel)
  panels.forEach(panel => {
    const classes = ['panel']
    panel !== 'Overview' ? classes.push('hidden') : classes
    Panels[panel] = DIV(`${panel.toLowerCase()}-panel`, classes, dataPanel)
    BUTTON(['menu-button'], panel, menuPanel)
  })
  setupOverview()
})
let activePanel = 'overview-panel'

function toggle (panelId) {
  document.getElementById(activePanel).classList.toggle('hidden')
  activePanel = panelId
  document.getElementById(panelId).classList.toggle('hidden')
}

function handleResponse (response) {
  for (const res of response) {
    let classMethod = `${res.requestClass}.${res.requestMethod}`
    let data = res.responseData
    switch (classMethod) {
      case 'StartupService.getData':
        startup(data)
        handleProduction(data)
        break
      case 'BoostService.getTimerBoost':
        console.log(classMethod, { data })
        handleBoosts(data)
        break
      case 'BoostService.getAllBoosts':
        console.log(classMethod, { data })
        handleBoosts(data)
        break
      case 'TimeService.updateTime':
        console.log(data.time, { cityData })
        break
      default:
        console.log([`Response type ${classMethod} is not handled yet.`, data])
    }
  }
}

function startup (data) {

}

function handleBoosts (data) {
  if ('boosts' in data) {
    data = data.boosts
  }
  for (let boost of data) {
    if (boost.type in cityData.Boosts) {
      cityData.Boosts[boost.type].value += boost.value
      cityData.Boosts[boost.type].sources
    } else {
      cityData.Boosts[boost.type] = { value: boost.value, sources: [] }
    }
  }
}

function handleProduction (data) {
  const cityEntities = metadata.city_entities
  let productionFS = document.getElementById('production')
  let entities = []
  let cityStats = { 'population': 0, 'happiness': 0 }
  for (let e of data.city_map.entities) {
    if (!(e.type in entities)) {
      entities[e.type] = []
    }
    let meta = cityEntities[e.cityentity_id]
    e.Data = meta
    if ('is_multi_age' in meta) {
      e.multiage = true
    }
    entities[e.type].push(e)
    cityStats.population += 1
  }
  cityData.Entities = entities
  console.log({ entities }, { cityStats })
  if (entities.production) {
    for (const e of entities.production) {
      const name = cityEntities[e.cityentity_id].name
      const id = e.id
      cityData.Production[id] = { 'name': name, 'products': {}, 'timer': 0 }
      const currentProduct = e.state.current_product
      let product = document.createElement('div')
      if ('product' in currentProduct) {
        for (const resource in currentProduct.product.resources) {
          let value = currentProduct.product.resources[resource]
          let icon = asset('/shared/icons/icon_not_available.png')
          if (`/shared/icons/${resource}.png` in assetMap) {
            icon = asset(`/shared/icons/${resource}.png`)
          }
          cityData.Production[id].products[resource] = { 'value': value }
          let p = document.createElement('div')
          p.appendChild(IMG(icon, resource))
          p.appendChild(SPAN(value))
          product.appendChild(p)
        }
      } else {
        if ('clan_power' in currentProduct) {
          let value = currentProduct.clan_power
          let icon = asset('/shared/icons/clan_power.png')
          let p = document.createElement('div')
          cityData.Production[id].products.clan_power = { 'value': value }
          p.appendChild(IMG(icon, 'guild power'))
          p.appendChild(SPAN(value))
          product.appendChild(p)
        }
      }
      let time, datetime, timer
      switch (e.state.__class__) {
        case 'ProductionFinishedState':
          time = 'Ready to collect'
          timer = 0
          break
        case 'IdleState':
          time = 'Idle'
          timer = -1
          break
        case 'ProducingState':
          datetime = new Date(e.state.next_state_transition_at * 1000)
          timer = e.state.next_state_transition_in
          time = `${datetime.toLocaleTimeString()}`
          break
      }
      cityData.Production[id].timer = timer
      TR('production-table', [], [name, product, time])
    }
  }
}

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

(function () {
  let styleSheet = document.createElement('link')
  styleSheet.rel = 'stylesheet'
  styleSheet.href = 'http://localhost:8080/ForgePlus.css'
  document.head.append(styleSheet)

  let open = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
    this.addEventListener('load', function (event) {
      if (/json\?h/.test(url)) {
        handleResponse(JSON.parse(this.responseText))
      }
    })
    return open.apply(this, arguments)
  }
})()