/* eslint-env mocha */

const assert = require('assert')

const windows = require('prismarine-windows')('1.8')

const Item = require('prismarine-item')('1.8')

describe('prismarine-windows test', () => {
  describe('Chest', () => {
    const inv = windows.createWindow(2, 'minecraft:inventory', 'inventory')
    const chest = windows.createWindow(1, 'minecraft:chest', 'chest', 27)

    const createClick = (mode, mouseButton, slot, useInv = false) => ({
      slot,
      mouseButton,
      mode,
      windowId: useInv ? inv.id : chest.id,
      item: slot === -999 ? null : useInv ? inv.slots[slot] : chest.slots[slot]
    })

    chest.updateSlot(0, new Item(1, 64)) // Stone
    chest.updateSlot(1, new Item(1, 1)) // Stone
    chest.updateSlot(3, new Item(1, 63)) // Stone
    chest.updateSlot(5, new Item(2, 3)) // Grass
    chest.updateSlot(chest.inventoryEnd - 1, new Item(1, 44)) // Stone
    chest.updateSlot(chest.inventoryEnd - 2, new Item(1, 44)) // Stone
    chest.updateSlot(chest.inventoryEnd - 3, new Item(1, 44)) // Stone

    inv.updateSlot(inv.inventoryEnd - 1, new Item(301, 1)) // Leather boot

    it('mode 0', () => {
      chest.acceptClick(createClick(0, 0, 0))
      assert.ok(!chest.slots[0] && chest.selectedItem?.count === 64 && chest.selectedItem.type === 1, 'pickup item')
      chest.acceptClick(createClick(0, 1, 1))
      assert.ok(chest.selectedItem?.count === 63 && chest.slots[1]?.count === 2, 'drop one of selected Item into a slot (same item)')
      chest.acceptClick(createClick(0, 1, 2))
      assert.ok(chest.selectedItem?.count === 62 && chest.slots[2]?.count === 1 && chest.slots[2].type === 1, 'drop one of selected Item into a slot (empty slot)')
      chest.acceptClick(createClick(0, 0, 3))
      assert.ok(chest.selectedItem?.count === 61 && chest.slots[3]?.count === 64 && chest.slots[3].type === 1, 'drop all of selected Item into a slot (almost full with same item)')
      chest.acceptClick(createClick(0, 0, 0))
      assert.ok(!chest.selectedItem && chest.slots[0], 'drop selected Item into empty slot')
    })

    it('mode 1', () => {
      chest.acceptClick(createClick(1, 0, 0))
      assert.ok(
        chest.slots[chest.inventoryEnd - 1]?.count === 64 &&
          chest.slots[chest.inventoryEnd - 2]?.count === 64 &&
          chest.slots[chest.inventoryEnd - 3]?.count === 64 &&
          chest.slots[chest.inventoryEnd - 4]?.count === 1,
        'shift out of chest into inventory')
      chest.acceptClick(createClick(1, 0, chest.inventoryEnd - 1))
      assert.ok(!chest.slots[0] && chest.slots[1]?.count === 64, chest.slots[2]?.count === 3, 'shift out of inventory into chest')
      chest.acceptClick(createClick(1, 0, chest.inventoryEnd - 2))
      assert.ok(!chest.slots[chest.inventoryEnd - 2] && chest.slots[2]?.count === 64 && chest.slots[0]?.count === 3, 'shift out of inventory into chest #2')
      inv.acceptClick(createClick(1, 0, 44, true))
      assert.ok(!inv.slots[44] && inv.slots[8], 'shift out of inventory into armor slot - leather boots')
    })

    it('mode 2', () => {
      chest.acceptClick(createClick(2, 0, 3))
      assert.ok(!chest.slots[3] && chest.slots[54]?.count === 64, 'number click from full slot into empty slot')
      chest.acceptClick(createClick(2, 0, 3))
      assert.ok(!chest.slots[54] && chest.slots[3]?.count === 64, 'number click from empty slot into full slot')
      chest.acceptClick(createClick(2, 5, 0))
      assert.ok(!chest.slots[0] && chest.slots[59]?.count === 4, 'number click from slot with item to slot with same item')
      chest.acceptClick(createClick(2, 5, 5))
      assert.ok(
        !chest.slots[5] &&
          chest.slots[59].type === 2 && chest.slots[59]?.count === 3 &&
          chest.slots[54]?.count === 4 && chest.slots[54].type === 1,
        'number click from slot with item to slot with different item')
    })

    it('mode 4', () => {
      chest.acceptClick(createClick(4, 0, 1))
      assert.ok(chest.slots[1]?.count === 63, 'drop 1 of stack')
      chest.acceptClick(createClick(4, 1, 1))
      assert.ok(!chest.slots[1], 'drop full stack')
    })
  })
})
