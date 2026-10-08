// Форпост: тематический лут по типу комнаты.
// К обычному луту сундука добавляется 1–3 предмета «по смыслу места»:
//   кухня, холодильник  — еда, вода, семена
//   спальня             — ткань, утеплитель, одежда, бинты, спальник
//   офис                — бумага, карты, электроника, записки прежних колонистов
//   ящики и бочки       — инструменты, железо, детали Create, сетки для сита
//   оружейка вышки      — топливо, патроны, бинты
//   лаборатория MER     — электроника, кремний, механизмы, детали для ракеты
// Бонус кладёт forpost_loot_tiers.js в момент первого открытия (вместе с бонусом за охрану).
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

function n(min, max) { return [{ function: 'minecraft:set_count', count: { min: min, max: max } }] }
function it(id, w, min, max) {
  var e = { type: 'minecraft:item', name: id, weight: w }
  if (min) e.functions = n(min, max || min)
  return e
}
function note(title, text, w) {
  var tag = '{title:"' + title + '",author:"неизвестный колонист",pages:[\'{"text":"' + text + '"}\']}'
  return { type: 'minecraft:item', name: 'minecraft:written_book', weight: w, functions: [{ function: 'minecraft:set_nbt', tag: tag }] }
}
function table(rollsMin, rollsMax, entries) {
  return { type: 'minecraft:chest', pools: [{ rolls: { min: rollsMin, max: rollsMax }, entries: entries }] }
}

var NOTES = [
  note('Дневник, день 12', 'Фильтры забились песком. Кипятим воду дважды. Если найдёте это - не пейте из луж у реки.', 1),
  note('Смена 3', 'Лаборатория MER закрыта после аварии на прессе. Ключи у начальника смены. Начальника никто не видел.', 1),
  note('Объявление', 'Всем жителям: после заката не выходить за стены. Пауки идут на свет. Огни гасить.', 1),
  note('Письмо без адреса', 'Если долетите до Земли - передайте, что мы держались. Ракета почти собрана, не хватает только ядра.', 1)
]

var THEMES = {
  kitchen: table(1, 2, [
    it('minecraft:bread', 8, 1, 3), it('minecraft:apple', 6, 1, 3), it('minecraft:dried_kelp', 4, 3, 8),
    it('minecraft:honey_bottle', 3, 1, 1), it('farmersdelight:cabbage', 5, 1, 2), it('farmersdelight:rice', 5, 2, 5),
    it('farmersdelight:cabbage_seeds', 4, 1, 3), it('farmersdelight:tomato_seeds', 4, 1, 3),
    it('scarcity:potato_seeds', 3, 1, 3), it('scarcity:carrot_seeds', 3, 1, 3), it('scarcity:onion_seeds', 3, 1, 3),
    it('scarcity:oak_seed', 2, 1, 1), it('legumedelight:baked_beans', 3, 1, 2), it('legumedelight:beans', 3, 2, 4),
    it('create:bar_of_chocolate', 2, 1, 2), it('kubejs:zombie_jerky', 3, 1, 3), it('cold_sweat:filled_waterskin', 3, 1, 1),
    it('thirst:terracotta_bowl', 2, 1, 2)]),
  bedroom: table(1, 2, [
    it('minecraft:white_wool', 6, 1, 3), it('minecraft:string', 6, 2, 6), it('minecraft:leather', 5, 1, 3),
    it('kubejs:leather_insulation', 3, 1, 2), it('kubejs:bandage', 5, 1, 3), it('comforts:sleeping_bag_white', 2, 1, 1),
    it('kubejs:desert_cap', 1, 1, 1), it('kubejs:desert_tunic', 1, 1, 1), it('kubejs:desert_pants', 1, 1, 1),
    it('kubejs:desert_shoes', 1, 1, 1), it('cold_sweat:thermometer', 1, 1, 1), it('minecraft:candle', 3, 1, 3)]),
  office: table(1, 2, [
    it('minecraft:paper', 8, 2, 6), it('minecraft:book', 5, 1, 2), it('minecraft:map', 4, 1, 1), it('minecraft:compass', 3, 1, 1),
    it('minecraft:redstone', 5, 2, 6), it('kubejs:pcb_segment', 3, 1, 2), it('create:clipboard', 2, 1, 1),
    it('minecraft:clock', 2, 1, 1), it('cold_sweat:thermometer', 1, 1, 1)].concat(NOTES)),
  crate: table(1, 3, [
    it('minecraft:iron_ingot', 6, 1, 3), it('minecraft:iron_nugget', 6, 4, 9), it('minecraft:coal', 6, 2, 6),
    it('minecraft:flint', 4, 2, 4), it('create:andesite_alloy', 5, 2, 6), it('create:iron_sheet', 4, 1, 3),
    it('create:copper_sheet', 4, 1, 3), it('create:shaft', 4, 2, 4), it('create:cogwheel', 3, 1, 3),
    it('exdeorum:string_mesh', 2, 1, 1), it('exdeorum:flint_mesh', 1, 1, 1), it('kubejs:filter', 2, 1, 1),
    it('create:wrench', 1, 1, 1), it('minecraft:torch', 4, 4, 8)]),
  gun_locker: table(1, 2, [
    it('cgm:basic_bullet', 6, 8, 16), it('cgm:shell', 3, 2, 6), it('minecraft:gunpowder', 5, 2, 5),
    it('ad_astra:fuel_bucket', 2, 1, 1), it('kubejs:bandage', 5, 1, 3), it('minecraft:iron_ingot', 4, 1, 3)]),
  lab: table(1, 2, [
    it('kubejs:pcb_segment', 6, 1, 3), it('ae2:silicon', 5, 1, 3), it('ae2:certus_quartz_crystal', 4, 1, 3),
    it('create:electron_tube', 4, 1, 2), it('minecraft:redstone', 5, 3, 8), it('create:precision_mechanism', 1, 1, 1),
    it('kubejs:bandage', 3, 1, 2), it('minecraft:glowstone_dust', 3, 2, 5)].concat(NOTES))
}

ServerEvents.highPriorityData(event => {
  Object.keys(THEMES).forEach(k => event.addJson('forpost:loot_tables/rooms/' + k, THEMES[k]))
})

// какая тема у таблицы лута сундука
global.forpostRoomTheme = function (lootTable) {
  var t = String(lootTable)
  if (t.indexOf('desolate_planet:chests/city/kitchen') === 0) return 'kitchen'
  if (t === 'desolate_planet:chests/city/bedroom') return 'bedroom'
  if (t === 'desolate_planet:chests/city/office' || t === 'desolate_planet:chests/city/map') return 'office'
  if (t === 'desolate_planet:chests/city/crate' || t.indexOf('desolate_planet:chests/farmhouse') === 0 ||
      t === 'desolate_planet:chests/misc/technical' || t === 'desolate_planet:chests/misc/industrial_iron_decor') return 'crate'
  if (t.indexOf('desolate_planet:chests/oil_rig/') === 0) return 'gun_locker'
  if (t.indexOf('desolate_planet:chests/mer_lab/') === 0 || t.indexOf('crash_landing:chests/mer_') === 0) return 'lab'
  return null
}

})()
