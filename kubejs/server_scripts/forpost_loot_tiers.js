// Форпост: лут в тайниках зависит от силы охраны.
// Когда игрок впервые открывает сундук/бочку со структурным лутом (данжи, руины, вышки, города),
// скрипт смотрит, кто его охраняет: спаунеры в радиусе 8 блоков и живые мобы в радиусе 12.
// Самый сильный охранник задаёт уровень тайника, и к обычному луту добавляется бонус:
//   ★    — зомби, скелеты, пауки:            еда, костная мука, саженцы, шелкопряд, железные куски
//   ★★   — пещерные пауки, особые мобы, крипер: железо/золото, изумруды, зачарованные книги, сито-сетки
//   ★★★  — ифриты, визер-скелеты, эндермены:  алмазы, зачарованное снаряжение, золотые яблоки
//   ★★★★ — боссы (Cataclysm, иссушитель, хранитель): незеритовый лом, зачарованное яблоко, тотем
// Если охраны нет — сундук открывается как обычно, без бонуса.
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

var SPAWNER_R = 8
var MOB_R = 12
var MAT = '§8[MAT]§r '
var STARS = ['', '§7★', '§a★★', '§b★★★', '§6★★★★']

// --- сила мобов ---
var TIER = {
  'minecraft:zombie': 1, 'minecraft:husk': 1, 'minecraft:drowned': 1, 'minecraft:skeleton': 1,
  'minecraft:spider': 1, 'minecraft:silverfish': 1, 'minecraft:slime': 1, 'minecraft:zombie_villager': 1,
  'minecraft:cave_spider': 2, 'minecraft:stray': 2, 'minecraft:creeper': 2, 'minecraft:witch': 2,
  'minecraft:pillager': 2, 'minecraft:zombified_piglin': 2, 'minecraft:piglin': 2, 'minecraft:magma_cube': 2,
  'minecraft:phantom': 2, 'minecraft:guardian': 2, 'minecraft:hoglin': 2, 'minecraft:zoglin': 2,
  'minecraft:blaze': 3, 'minecraft:wither_skeleton': 3, 'minecraft:enderman': 3, 'minecraft:vindicator': 3,
  'minecraft:evoker': 3, 'minecraft:piglin_brute': 3, 'minecraft:ravager': 3, 'minecraft:ghast': 3,
  'minecraft:shulker': 3,
  'minecraft:wither': 4, 'minecraft:ender_dragon': 4, 'minecraft:warden': 4, 'minecraft:elder_guardian': 4
}
var BOSS_WORDS = ['ignis', 'harbinger', 'leviathan', 'netherite_monstrosity', 'ender_guardian', 'maledictus',
  'scylla', 'ancient_remnant', 'boss']

function dimId(level) {
  var s = String(level.dimension)
  var m = s.match(/([a-z0-9_.-]+:[a-z0-9_.\/-]+)\]?$/)
  return m ? m[1] : s
}

function mobTier(id) {
  id = String(id)
  if (TIER[id]) return TIER[id]
  var path = id.indexOf(':') >= 0 ? id.split(':')[1] : id
  for (var i = 0; i < BOSS_WORDS.length; i++) if (path.indexOf(BOSS_WORDS[i]) >= 0) return 4
  if (id.indexOf('cataclysm:') === 0) return 3           // миньоны Cataclysm
  if (id.indexOf('specialmobs:') === 0) {                 // «особые» версии обычных мобов — на ступень сильнее
    if (path.indexOf('blaze') >= 0 || path.indexOf('wither') >= 0 || path.indexOf('ender') >= 0) return 3
    return 2
  }
  return 0
}

// --- бонусные таблицы ---
function n(min, max) { return [{ function: 'minecraft:set_count', count: { min: min, max: max } }] }
function item(id, w, min, max, extra) {
  var e = { type: 'minecraft:item', name: id, weight: w }
  var f = (min || max) ? n(min, max) : []
  if (extra) f = f.concat(extra)
  if (f.length) e.functions = f
  return e
}
var ENCH = function (lv) { return [{ function: 'minecraft:enchant_with_levels', levels: lv, treasure: lv >= 30 }] }
var BOOK = [{ function: 'minecraft:enchant_randomly' }]

var POOLS = {
  1: { rolls: { min: 2, max: 3 }, entries: [
    item('minecraft:bread', 10, 2, 4), item('minecraft:cooked_beef', 6, 1, 3), item('minecraft:bone_meal', 10, 3, 8),
    item('minecraft:oak_sapling', 5, 1, 2), item('minecraft:birch_sapling', 3, 1, 2), item('exdeorum:silk_worm', 4, 1, 1),
    item('minecraft:wheat_seeds', 5, 2, 6), item('minecraft:iron_nugget', 8, 4, 10), item('exdeorum:iron_ore_chunk', 6, 2, 5),
    item('minecraft:torch', 6, 4, 10), item('minecraft:arrow', 4, 4, 12), item('minecraft:leather', 4, 1, 3)] },
  2: { rolls: { min: 2, max: 3 }, entries: [
    item('minecraft:iron_ingot', 10, 2, 5), item('minecraft:gold_ingot', 6, 1, 3), item('minecraft:emerald', 6, 1, 3),
    item('minecraft:book', 6, 1, 1, BOOK), item('minecraft:golden_apple', 2, 1, 1), item('minecraft:redstone', 5, 4, 9),
    item('minecraft:lapis_lazuli', 4, 3, 8), item('exdeorum:iron_mesh', 2, 1, 1), item('exdeorum:wooden_watering_can', 2, 1, 1),
    item('minecraft:iron_sword', 3, 1, 1, ENCH(15)), item('minecraft:chainmail_chestplate', 2, 1, 1, ENCH(10)),
    item('minecraft:experience_bottle', 4, 2, 5)] },
  3: { rolls: { min: 2, max: 3 }, entries: [
    item('minecraft:diamond', 8, 1, 3), item('minecraft:golden_apple', 6, 1, 2), item('minecraft:ender_pearl', 5, 1, 3),
    item('minecraft:experience_bottle', 6, 4, 8), item('minecraft:book', 5, 1, 1, ENCH(30)),
    item('minecraft:diamond_sword', 3, 1, 1, ENCH(25)), item('minecraft:diamond_pickaxe', 3, 1, 1, ENCH(25)),
    item('minecraft:iron_chestplate', 3, 1, 1, ENCH(25)), item('exdeorum:golden_mesh', 2, 1, 1),
    item('exdeorum:diamond_mesh', 1, 1, 1), item('minecraft:blaze_rod', 3, 1, 3)] },
  4: { rolls: { min: 2, max: 4 }, entries: [
    item('minecraft:netherite_scrap', 6, 1, 2), item('minecraft:diamond', 8, 3, 6), item('minecraft:enchanted_golden_apple', 2, 1, 1),
    item('minecraft:totem_of_undying', 2, 1, 1), item('minecraft:diamond_chestplate', 3, 1, 1, ENCH(39)),
    item('minecraft:diamond_sword', 3, 1, 1, ENCH(39)), item('minecraft:book', 4, 1, 1, ENCH(39)),
    item('minecraft:experience_bottle', 5, 8, 16), item('minecraft:netherite_upgrade_smithing_template', 1, 1, 1)] }
}

ServerEvents.highPriorityData(event => {
  for (var t = 1; t <= 4; t++) {
    var pools = []
    // свой уровень полностью + по одному броску с уровней ниже
    pools.push(POOLS[t])
    for (var lo = 1; lo < t; lo++) pools.push({ rolls: 1, entries: POOLS[lo].entries })
    event.addJson('forpost:loot_tables/bonus/tier' + t, { type: 'minecraft:chest', pools: pools })
  }
})

// --- определение охраны ---
function spawnerTier(level, x, y, z) {
  var best = 0
  for (var dx = -SPAWNER_R; dx <= SPAWNER_R; dx++)
    for (var dy = -SPAWNER_R; dy <= SPAWNER_R; dy++)
      for (var dz = -SPAWNER_R; dz <= SPAWNER_R; dz++) {
        var b = level.getBlock(x + dx, y + dy, z + dz)
        if (String(b.id) !== 'minecraft:spawner') continue
        try {
          var nbt = b.entityData
          var id = nbt.getCompound('SpawnData').getCompound('entity').getString('id')
          var t = mobTier(id)
          if (t === 0 && String(id) !== '') t = 2 // неизвестный моб из спаунера — считаем средним
          if (t > best) best = t
        } catch (e) { if (best < 1) best = 1 }
      }
  return best
}

function liveTier(level, x, y, z) {
  var best = 0
  try {
    var list = level.getEntitiesWithin(AABB.of(x - MOB_R, y - MOB_R, z - MOB_R, x + MOB_R, y + MOB_R, z + MOB_R))
    list.forEach(e => {
      if (!e.isLiving() || e.isPlayer()) return
      var t = mobTier(e.type)
      if (t === 0 && e.getMaxHealth && e.getMaxHealth() >= 150) t = 4 // неизвестный босс
      if (t > best) best = t
    })
  } catch (e) { console.error('[forpost_loot_tiers] mobs: ' + e) }
  return best
}

BlockEvents.rightClicked(event => {
  if (String(event.hand) !== 'MAIN_HAND') return
  var block = event.block
  var player = event.player
  if (!player || player.isSpectator()) return
  try {
    var bid = String(block.id)
    if (bid.indexOf('brushable') >= 0 || bid === 'minecraft:spawner') return
    var nbt = block.entityData
    if (!nbt || !nbt.contains('LootTable')) return
    var table = String(nbt.getString('LootTable'))
    if (table.indexOf('forpost:') === 0) return
    var x = block.x, y = block.y, z = block.z
    var level = event.level
    if (global.forpostArmoryLocked && global.forpostArmoryLocked(event.server, x, y, z)) return // шкаф арсенала заперт
    var tier = Math.max(spawnerTier(level, x, y, z), liveTier(level, x, y, z))
    // арсенал вышки (forpost_armory.js): после зачистки охраны — не ниже ★★★
    if (global.forpostArmoryTier) tier = Math.max(tier, global.forpostArmoryTier(event.server, x, y, z))
    var theme = global.forpostRoomTheme ? global.forpostRoomTheme(table) : null
    if (tier <= 0 && !theme) return
    // loot insert сначала раскладывает обычный лут сундука, затем докладывает бонус
    var at = 'execute in ' + dimId(level) + ' run loot insert ' + x + ' ' + y + ' ' + z + ' loot '
    if (theme) event.server.runCommandSilent(at + 'forpost:rooms/' + theme)
    if (tier <= 0) return
    event.server.runCommandSilent(at + 'forpost:bonus/tier' + tier)
    player.displayClientMessage(Text.of('Тайник под охраной: ' + STARS[tier] + '§r — лут лучше'), true)
    if (tier >= 3) player.tell(MAT + '§bСильная охрана — и награда соответствующая.')
  } catch (e) {
    console.error('[forpost_loot_tiers] ' + e)
  }
})

})()
