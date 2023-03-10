
function $E(tag, classList=null, attributes={}) {
  const element = document.createElement(tag)
  if (classList) {
    for (let Class of classList.split(' ')) {
      element.classList.add(Class)
    } 
  }
  for (const attr in attributes) {
    if (attr === 'text') {
      element.innerText = attributes.text
    } else if (attr === 'html') {
      element.innerHTML = attributes.html
    } else if (attr === 'style') {
      for (let style in attributes.style) {
        if (style === 'backgroundImage') {
          element.style.backgroundImage = 'url("' + attributes.style.backgroundImage + '")'
        } else {
          element.style[style] = attributes.style[style]
        }
      }
    } else {
      element[attr] = attributes[attr]
    }
  }
  return element
}

function togglePanel(panel) {
  let panels = ['overview', 'sniper', 'plunder', 'leveler', 'gbg', 'auction', 'tavern', 'inventory', 'market', 'army', 'event']
  for (let p of panels) {
    let p_ = $(`#${p}-panel`)[0]
    if (p === panel) {
      if (p_.classList.contains('hidden')) {
        p_.classList.remove('hidden')
      }
    } else {
      if (!(p_.classList.contains('hidden'))) {
        p_.classList.add('hidden')
      }
    }
  }
}

let assetMap = JSON.parse(GM_getResourceText("assetMap"))
function asset (assetPath) {
  const assetDot = assetPath.lastIndexOf('.')
  const assetPath1 = assetPath.slice(0, assetDot)
  const assetPath2 = assetPath.slice(assetDot)
  const assetObf = assetMap[assetPath]
  return `https://foeus.innogamescdn.com/assets${assetPath1}-${assetObf}${assetPath2}`
}

let portraits = {}
for (let line of GM_getResourceText('portraits').split('\n')) {
  let name = line.match(/name="([a-z0-9_]*)"/)
  let src = line.match(/src="(portrait_\d*|portrait_unknown)"/)
  if (name) {
    portraits[name[1]] = src[1]
  }
}

function avatar(portrait) {
  return '/shared/avatars/' + portraits[portrait] + '.jpg'

}

/**
 * @typedef {Object} InnoResponse
 * @property {string} requestClass - The primary classification for this response's data
 * @property {string} requestMethod - The secondary classification for this response's data
 * @property {string} responseData - The response's data itself
 */

class InnoResponse {
  /**
   * A response object sent by InnoGames' server
   * @param {string} data - a JSON string
   */
  constructor(data) {
      this.requestClass = data['requestClass']
      this.requestMethod = data['requestMethod']
      this.responseData = data['responseData']
  }
}

function GBProgress (building) {
    this.playerId = building['player']['player_id']
    this.name = building['name']
    this.entityId = building['city_entity_id']
    this.current = 'current_progress' in building ? building['current_progress'] : 0
    this.icon = asset(`/city/buildings/${this.entityId.replace('X_', 'X_SS_')}.png`)
    this.max = building['max_progress']
    this.level = building['level']
    if ('forge_points' in building) {
      this.rank = building['rank']
      this.rewardFP = 'reward' in building ? building['reward']['strategy_point_amount'] : 0
      this.placedFP = building['forge_points']
    } else {
      this.rank = 0
      this.rewardFP = 0
      this.placedFP = 0
    }
    this.buildingData = null
    this.short = null 
}

function CleanNumber(number) {
  let thresholds = [999, 999000, 999000000, 999000000000, 999000000000000]
  let abbrev = ['K', 'M', 'B', 'T', 'Q']
  let degree = 0
  let km_tq = ''
  thresholds.forEach((threshold, index) => {
    if (number > threshold) {
      degree = index + 1
      km_tq = abbrev[index]
    }
  })
  let round = Math.round((number / (1000 ** degree)) * 100) / 100
  return `${round}${km_tq}`
}

function IdleGameNumber(data) {
  let value = data['value']
  let degree = 'degree' in data ? data['degree'] : 0
  return value * (1000 ** (degree))
}
/**
 * 
 * @typedef {Object} IdleGameState
 * @property {number} Stage
 * @property {number} Shamrocks
 * @property {IdleGameCharacterState[]} Buildings
 * @property {IdleGameTaskHandlerState} Tasks
 */
class IdleGameState {
  /**
   * The current state of the St. Patrick's Day event
   * @param {JSON} data
   * @param {JSON} metadata
   */
  constructor(data, metadata) {
    // console.log(metadata)
    this.Stage = Number(data['stage'])
    this.Shamrocks = IdleGameNumber(data['idleCurrencyAmount'])
    let buildings = {}
    data['characters'].forEach((bld, index) => {
      buildings[bld.id] = new IdleGameCharacterState(bld, metadata['characters'][index])
    })
    this.Buildings = buildings
    this.Tasks = new IdleGameTaskHandlerState(data['taskHandler'], metadata, this.Buildings)
  }
}

/**
 * @typedef {Object} IdleGameTaskHandlerState
 * @property {number[]} CompletedTasks
 * @property {number[]} TaskOrder
 * @property {IdleGameTaskState[]} InProgressTasks
 */
class IdleGameTaskHandlerState {
  /**
   * 
   * @param {JSON} data
   * @param {JSON} metadata
   * @param {IdleGameCharacterState[]} buildings
   */
  constructor(data, metadata, buildings) {
    this.CompletedTasks = data['completedTasks']
    this.InProgressTasks = []
    data['inProgressTasks'].forEach((task) => {
      this.InProgressTasks.push(new IdleGameTaskState(task, metadata, buildings))
    })
    this.TaskOrder = data['taskOrder']
  }
}

/**
 * @typedef {Object} IdleGameTaskState
 * @property {number} TaskId
 * @property {string} Type
 * @property {string[]} Target
 * @property {string} Icon
 * @property {number} Progress
 * @property {number} Required
 * @property {string} Objective
 */
class IdleGameTaskState {
  /**
   *
   * @param {JSON} data
   * @param {JSON} metadata
   * @param {IdleGameCharacterState[]} buildings
   */
  constructor(data, metadata, buildings) {
      let taskData = metadata['tasks'][data['id']-1]
      this.TaskId = data['id']
      this.Type = taskData['type']
      this.Target = taskData['targets']
      this.Icon = taskData['icon']
      this.Progress = IdleGameNumber(data['currentProgress'])
      this.Required = IdleGameNumber(taskData['requiredProgress'])
      this.Objective = taskData['description']
      let targetBuilding
    }
}
  
function Countdown (element, targetTime) {
  let el = document.getElementById(`countdown-task-${element}`)
  console.log(element)
  const interval = setInterval(function () {
    const totalDuration = targetTime - new Date().getTime()
    if (totalDuration <= 0) {
      el.innerHTML = 'Ready'
      clearInterval(interval)
      return
    }
    let days = Math.floor(totalDuration / (24 * 3600 * 1000))
    let hours = Math.floor(
      (totalDuration % (1000 * 3600 * 24)) / (1000 * 3600)
    )
    let minutes = Math.floor((totalDuration % (1000 * 3600)) / (1000 * 60))
    let seconds = Math.floor((totalDuration % (1000 * 60)) / 1000)
    if (seconds + 1 === 0) {
      if (minutes + 1 === 0) {
        if (hours + 1 === 0) {
          if (days === 0) {
            el.innerHTML = 'Ready'
            clearInterval(interval)
            return
          }
          else {
            days--
            hours = 23
            minutes = 59
            seconds = 59
          }
        }
        else {
          hours--
          minutes = 59
          seconds = 59
        }
      }
      else {
        minutes--
        seconds = 59
      }
    }

    const d = days > 0 ? `${days}d ` : ``
    const h = String(hours).padStart(2, '0') + ':'
    const m = String(minutes).padStart(2, '0') + ':'
    const s = String(seconds).padStart(2, '0')

    el.innerHTML = d + h + m + s
    seconds--
  }, 1000)
}

function levelBuilding(building, targetLevel) {
  let currentLvl = building.Level
  let totalCost = 0
  for (let lv=currentLvl; lv <= targetLevel; lv++) {
    console.log(lv, totalCost)
    totalCost += building.baseUpgradeCost * Math.pow(building.upgradeRate, lv)
  }
  console.log(building,targetLevel, totalCost)
}

/**
 * @typedef {Object} IdleGameCharacterState - The current state of a building in the St. Patrick's Day idle game
 * @property {string} Name - The building's name
 * @property {number} Level - The building's current level
 * @property {number} Manager
 * @property {number} Progress
 * @property {number} baseUpgradeCost
 * @property {number} upgradeRate
 * @property {number} baseProduction
 * @property {number} [Producing=0]
 * @property {number} Speed
 * @property {number} YieldPS
 */

function IdleGameCharacterState (data, metadata) {
    this.Name = metadata['name']
    this.Level = 'level' in data ? data['level'] : 0
    this.Manager = 'managerLevel' in data ? data['managerLevel'] : 0
    this.Progress = data['productionProgress']
    // this.Current = IdleGameNumber(data['currentProduceAmount'])
    // this.Stock = IdleGameNumber(data['stockAmount'])
    this.baseUpgradeCost = IdleGameNumber({value: metadata['baseUpgradeCostValue'], degree: 'baseUpgradeCostDegree' in metadata ? metadata['baseUpgradeCostDegree'] : 0})
    this.upgradeRate = metadata['upgradeCostGrowthRate']
    this.baseProduction = IdleGameNumber({value: metadata['baseProductionValue'], degree: 'baseProductionDegree' in metadata ? metadata['baseProductionDegree'] : 0})
    let managerSpeed = 1
    let mProd = 1
    let productionModifier = 0
    this.Producing = 0
  
    if (this.Level > 0) {
      metadata['rankProductionLevels'].forEach((threshold, index) => {
        if (this.Level >= threshold) {productionModifier = metadata['rankProductionModifiers'][index]}
      })
      let endlessModifier = 0
      if (this.Level > metadata['rankProductionEndlessLevel']) {endlessModifier = metadata['rankProductionEndlessModifier']}
      if (this.Manager > 0) {
        metadata['bonuses'].forEach((level) => {
          if (level['level'] <= this.Manager) {
            if (level['type'] === 'speed') {
              managerSpeed += level['amount']
            }
            else {
              mProd += level['amount']
            }
          }
        })
      }
      this.Producing = (this.baseProduction + (this.baseProduction * (this.Level - 1))) * Math.pow(2, productionModifier) * mProd
    }
    this.Speed = (metadata['productionDuration'] + metadata['rechargeDuration']) / managerSpeed
    this.YieldPS = this.Producing / this.Speed
  }

function GameData () {
    this.LastUpdate = 0
    this.Bonuses = {}
    this.Boosts = {Timed: {}, Static: {}}
    this.Deposits = {}
    this.Castle = {Player: null, Overview: null}
    this.IdleGame = {}
  }


class DataTable {
  numColumns
  headers

  constructor (numColumns, tableClass = 'dataTable') {
    if (tableClass) {
      tableClass = 'dataTable ' + tableClass
    }
    this.numColumns = numColumns
    this.hasHeader = false
    this.table = $E('div', tableClass)

  }

  addHeader(headers, headerClass='tableHeader') {
    if (headerClass) {
      headerClass = 'tableHeader ' + headerClass
    }
    if (this.headers) {
      throw new Error('Table already has a header designated.')
    } else {
      if (headers.length === this.numColumns) {
        let headerRow = $E('div', headerClass)
        headers.forEach((header) => {
          headerRow.appendChild($E('div', 'tableHeaderCell', {html: header}))
        })
        this.table.appendChild(headerRow)
      }
      else {
        throw new Error('Number of headers must be equal to number of columns.')
      }
    }
  }

  addRow(cells, rowClass='tableRow', cellClasses=null) {
    if (rowClass) {
      rowClass = 'tableRow ' + rowClass
    }
    try {
      if (cells.length !== this.numColumns) throw ['cells', cells.length, 'numColumns', this.numColumns];
      if (cellClasses !== null) {
        if (cellClasses.length !== cells.length) throw ['cellClasses', cellClasses.length, 'cells', cells.length];
        if (cellClasses.length !== this.numColumns) throw ['cellClasses', cellClasses.length, 'numColumns', this.numColumns];
      }
      else {
        cellClasses = []
        for (let c=0; c<cells.length; c++) {cellClasses[c] = ' '}
      }
      let row = $E('div', rowClass)
      cells.forEach((cell, index) => {
        let cellClass = 'tableCell ' + cellClasses[index]
        if (typeof cell === 'object') {
          cell = cell.outerHTML
        }
        row.appendChild($E('div', cellClass.trim(), {html: cell}))
      })
      this.table.appendChild(row)
    } catch (error) {
      let var1 = error[0], var2 = error[2], val1 = error[1], val2 = error[3]
      console.log(`${var1} (${val1}) must contain same number of values as ${var2} (${val2}).`)
    }
  }
}
