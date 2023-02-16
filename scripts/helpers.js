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
      cell.appendChild(value)
    }
    row.appendChild(cell)
  })
  const table = document.getElementById(tableId)
  table.appendChild(row)
  return row
}

function metaData (meta) {
  let keys
  switch (meta) {
    case 'building_upgrades':
      keys = ['upgradeItem', 'id']
      break
    case 'boost_metadata':
      keys = ['type']
      break
    case 'castle_system_levels':
      keys = ['level']
      break
    case 'selection_kits':
      keys = ['selectionKitId']
      break
    case 'unit_types':
      keys = ['unitTypeId']
      break
    default:
      keys = ['id']
  }
  let metadata = {}
  let [primaryKey, subKey] = keys
  for (const data of JSON.parse(GM_getResourceText(meta))) {
    if (subKey) {
      let key = data[primaryKey]
      metadata[data[primaryKey][subKey]] = data
    } else {
      metadata[data[primaryKey]] = data
    }
  }
  return metadata
}