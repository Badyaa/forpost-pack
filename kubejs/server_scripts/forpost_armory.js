// Форпост: охраняемый арсенал нефтяной вышки «Глубина-3».
//  1) Тревога: когда игрок впервые подходит к оружейке (или пытается открыть шкаф), MAT объявляет тревогу
//     и появляется отряд охраны: 8 бойцов + 4 за каждого следующего игрока рядом (не больше 20)
//     — зомби в броне, скелеты-лучники, ифрит и «Начальник охраны» (много здоровья, алмазная броня).
//     Отряд появляется ОДИН раз, не бесконечно, как от спаунера.
//     Облава: пока идёт тревога, все враждебные мобы в радиусе 72 блоков от оружейки бегут на игроков.
//  2) Пока охрана жива, оружейные шкафы заперты: открыть и сломать их нельзя.
//  3) Охрана перебита — арсенал открыт, шкафы дают бонус ★★★ (через forpost_loot_tiers.js),
//     а начальник охраны всегда роняет ствол из продвинутого списка и пачку усиленных патронов.
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

var TALOS = 'minecraft:overworld'
var MAT = '§8[MAT]§r '
var TAG = 'forpost_armory'
var KEY = 'forpost_armory'
// оружейные шкафы вышки (обычные y 63–64, продвинутые y 62)
var BOX = { x0: -2018, x1: -2012, y0: 61, y1: 65, z0: 2160, z1: 2166 }
var C = { x: -2015, y: 63, z: 2163 }
var TRIGGER_R = 10
var NEAR_R = 48
var RAID_R = 72        // облава: все враждебные мобы в этом радиусе от оружейки бегут на игроков
var GUNS = ['cgm:machine_pistol', 'cgm:assault_rifle', 'cgm:heavy_rifle']

function dimId(level) {
  var s = String(level.dimension)
  var m = s.match(/([a-z0-9_.-]+:[a-z0-9_.\/-]+)\]?$/)
  return m ? m[1] : s
}
function inBox(x, y, z) { return x >= BOX.x0 && x <= BOX.x1 && y >= BOX.y0 && y <= BOX.y1 && z >= BOX.z0 && z <= BOX.z1 }

function load(server) {
  var raw = server.persistentData.getString(KEY)
  try { return raw ? JSON.parse(raw) : { state: 'idle' } } catch (e) { return { state: 'idle' } }
}
function save(server, st) { server.persistentData.putString(KEY, JSON.stringify(st)) }

function playersNear(server, r) {
  var out = []
  server.getPlayerList().getPlayers().forEach(p => {
    if (dimId(p.level) !== TALOS || p.isSpectator()) return
    var dx = p.x - C.x, dz = p.z - C.z
    if (dx * dx + dz * dz <= r * r) out.push(p)
  })
  return out
}
function tellNear(server, text, actionbar) {
  playersNear(server, NEAR_R).forEach(p => actionbar ? p.displayClientMessage(Text.of(text), true) : p.tell(text))
}

// свободное место: твёрдый блок снизу и два блока воздуха
function isAir(id) { id = String(id); return id === 'minecraft:air' || id === 'minecraft:cave_air' }
function findSpot(level, x, z) {
  for (var y = C.y + 6; y >= C.y - 6; y--) {
    if (isAir(level.getBlock(x, y, z).id) && isAir(level.getBlock(x, y + 1, z).id) && !isAir(level.getBlock(x, y - 1, z).id)) return y
  }
  return null
}
function spots(level, need) {
  var res = []
  for (var tries = 0; tries < need * 12 && res.length < need; tries++) {
    var a = Math.random() * Math.acos(-1) * 2, r = 3 + Math.random() * 7
    var x = Math.floor(C.x + Math.cos(a) * r), z = Math.floor(C.z + Math.sin(a) * r)
    var y = findSpot(level, x, z)
    if (y !== null) res.push([x, y, z])
  }
  while (res.length < need) res.push([C.x, C.y, C.z]) // запасной вариант — у самих шкафов
  return res
}

function summon(server, id, pos, nbt) {
  server.runCommandSilent('execute in ' + TALOS + ' run summon ' + id + ' ' + (pos[0] + 0.5) + ' ' + pos[1] + ' ' + (pos[2] + 0.5) + ' ' + nbt)
}
var BASE = 'Tags:["' + TAG + '"],PersistenceRequired:1b,CanPickUpLoot:0b'
function armor(set) { // ботинки, поножи, нагрудник, шлем (шлем — чтобы не горели на солнце)
  return 'ArmorItems:[{id:"minecraft:' + set + '_boots",Count:1b},{id:"minecraft:' + set + '_leggings",Count:1b},{id:"minecraft:' + set + '_chestplate",Count:1b},{id:"minecraft:' + set + '_helmet",Count:1b}],ArmorDropChances:[0.0f,0.0f,0.0f,0.05f]'
}

function alarm(server, level) {
  var st = load(server)
  if (st.state !== 'idle') return
  var near = playersNear(server, 32)
  var n = Math.max(1, near.length)
  var count = Math.min(20, 8 + 4 * (n - 1))
  var pts = spots(level, count + 1)
  var zombies = Math.round(count * 0.55), skeletons = count - zombies - 1
  var i = 0
  for (var a = 0; a < zombies; a++) summon(server, 'minecraft:zombie', pts[i++], '{' + BASE + ',' + armor(a % 2 ? 'iron' : 'chainmail') +
    ',HandItems:[{id:"minecraft:iron_sword",Count:1b},{}],HandDropChances:[0.0f,0.0f],CustomName:\'{"text":"Охранник"}\'}')
  for (var b = 0; b < skeletons; b++) summon(server, 'minecraft:skeleton', pts[i++], '{' + BASE + ',' + armor('chainmail') +
    ',HandItems:[{id:"minecraft:bow",Count:1b},{}],HandDropChances:[0.0f,0.0f],CustomName:\'{"text":"Стрелок охраны"}\'}')
  summon(server, 'minecraft:blaze', pts[i++], '{' + BASE + ',CustomName:\'{"text":"Охранный дрон"}\'}')
  var gun = GUNS[Math.floor(Math.random() * GUNS.length)]
  summon(server, 'minecraft:zombie', pts[i++], '{' + BASE + ',' + armor('diamond') +
    ',HandItems:[{id:"' + gun + '",Count:1b,tag:{AmmoCount:0}},{id:"cgm:advanced_bullet",Count:32b}],HandDropChances:[2.0f,2.0f]' +
    ',Health:80.0f,Attributes:[{Name:"minecraft:generic.max_health",Base:80.0d},{Name:"minecraft:generic.attack_damage",Base:6.0d},{Name:"minecraft:generic.knockback_resistance",Base:0.6d}]' +
    ',CustomName:\'{"text":"Начальник охраны","color":"red"}\',CustomNameVisible:1b}')
  save(server, { state: 'active', since: Date.now(), total: count + 1 })
  server.scheduleInTicks(10, () => { try { raid(server, level) } catch (e) {} })
  tellNear(server, MAT + '§c§lТРЕВОГА!§r§c Охрана арсенала «Глубины-3» подняла тревогу: ' + (count + 1) +
    ' бойцов, среди них начальник охраны. Все твари вышки сбегаются к тебе! Шкафы заперты, пока охрана жива.')
  playersNear(server, NEAR_R).forEach(p => server.runCommandSilent('execute as ' + p.username + ' at @s run playsound minecraft:block.bell.use master @s ~ ~ ~ 1 0.6'))
  console.info('[forpost_armory] тревога: ' + (count + 1) + ' охранников, игроков рядом ' + n)
}

// облава: каждый враждебный моб в радиусе RAID_R получает цель — ближайшего игрока у вышки
function raid(server, level) {
  var targets = playersNear(server, NEAR_R).filter(p => !p.isCreative())
  if (!targets.length) return 0
  var n = 0
  level.getEntities().forEach(e => {
    try {
      if (!e.isAlive() || e.isPlayer() || !e.isMonster()) return
      var dx = e.x - C.x, dz = e.z - C.z
      if (dx * dx + dz * dz > RAID_R * RAID_R) return
      if (e.getTarget && e.getTarget() && e.getTarget().isAlive()) return
      var best = null, bd = 1e9
      targets.forEach(p => { var d = (p.x - e.x) * (p.x - e.x) + (p.z - e.z) * (p.z - e.z); if (d < bd) { bd = d; best = p } })
      if (best && e.setTarget) { e.setTarget(best); n++ }
    } catch (x) {}
  })
  return n
}

function aliveGuards(level) {
  var n = 0
  level.getEntities().forEach(e => { try { if (e.isAlive() && e.getTags().contains(TAG)) n++ } catch (x) {} })
  return n
}

var TICKS = 0
ServerEvents.tick(event => {
  if (++TICKS % 40 !== 0) return
  var server = event.server
  try {
    var st = load(server)
    if (st.state === 'cleared') return
    var level = server.getLevel(TALOS)
    if (!level) return
    if (st.state === 'idle') {
      if (playersNear(server, TRIGGER_R).some(p => Math.abs(p.y - C.y) <= 8)) alarm(server, level)
      return
    }
    // active: считаем охрану, только пока рядом есть игрок (иначе чанки могут быть не загружены)
    if (playersNear(server, NEAR_R).length === 0) return
    raid(server, level)
    var alive = aliveGuards(level)
    if (alive > 0) { tellNear(server, '§cОхрана арсенала: осталось ' + alive, true); return }
    save(server, { state: 'cleared', at: Date.now() })
    server.getPlayerList().getPlayers().forEach(p => p.tell(MAT + '§a§lОхрана арсенала перебита!§r§a Оружейка «Глубины-3» открыта, шкафы ждут.'))
    playersNear(server, NEAR_R).forEach(p => server.runCommandSilent('execute as ' + p.username + ' at @s run playsound minecraft:ui.toast.challenge_complete master @s ~ ~ ~ 1 1'))
    console.info('[forpost_armory] охрана перебита, арсенал открыт')
  } catch (e) { console.error('[forpost_armory] ' + e) }
})

// шкафы заперты, пока охрана жива (cancel() в KubeJS 6 завершает обработчик — поэтому последним)
BlockEvents.rightClicked(event => {
  var b = event.block
  if (!inBox(b.x, b.y, b.z) || dimId(event.level) !== TALOS) return
  var server = event.server
  var st = load(server)
  if (st.state === 'cleared') return
  if (!b.entityData || !b.entityData.contains('LootTable')) return
  if (st.state === 'idle') alarm(server, event.level)
  if (String(event.hand) === 'MAIN_HAND') event.player.displayClientMessage(Text.of('§cАрсенал заблокирован: охрана ещё жива'), true)
  event.cancel()
})
BlockEvents.broken(event => {
  var b = event.block
  if (!inBox(b.x, b.y, b.z) || dimId(event.level) !== TALOS) return
  if (load(event.server).state === 'cleared') return
  event.player.displayClientMessage(Text.of('§cАрсенал заблокирован: охрана ещё жива'), true)
  event.cancel()
})

// для forpost_loot_tiers.js: шкафы арсенала после зачистки — уровень ★★★
global.forpostArmoryTier = function (server, x, y, z) {
  if (!inBox(x, y, z)) return 0
  return load(server).state === 'cleared' ? 3 : 0
}

global.forpostArmoryLocked = function (server, x, y, z) {
  return inBox(x, y, z) && load(server).state !== 'cleared'
}

// для админа: /forpost_armory status|reset
ServerEvents.commandRegistry(event => {
  var Commands = event.commands
  event.register(Commands.literal('forpost_armory').requires(src => src.hasPermission(2))
    .then(Commands.literal('status').executes(ctx => {
      var st = load(ctx.source.server)
      ctx.source.sendSuccess(() => Text.of('Арсенал: ' + st.state), false); return 1
    }))
    .then(Commands.literal('reset').executes(ctx => {
      save(ctx.source.server, { state: 'idle' })
      ctx.source.sendSuccess(() => Text.of('Арсенал: снова под охраной (тревога сработает при подходе)'), false); return 1
    })))
})

})()
