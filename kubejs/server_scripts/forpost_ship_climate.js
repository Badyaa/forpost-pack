// Форпост: климат на Талосе (вызывается из sunlight_detection.js, когда игрок в тени или ночью).
//  1) Внутри корабля под крышей — только снимает жару до комфортных ~22 °C. Никогда не греет и не охлаждает ниже.
//  2) На всём Талосе температура вокруг не опускается ниже 0 °C (ночью, в тени, в корабле).
//     Насколько холодно или жарко телу — решает одежда (пустынная одежда, утеплитель), а не минусовая погода.
// Температура «без нашей поправки» берётся напрямую у Cold Sweat (Temperature.apply без нашего модификатора),
// поэтому поправка больше не зависит от устаревшего значения и не может «застрять» на максимуме.
// Первые 10 минут после запуска сервера раз в 30 с пишет в лог KubeJS температуру у игроков на Талосе — для проверки.
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

var TALOS = 'minecraft:overworld'
var TARGET_C = 22     // комфорт внутри корабля, °C
var FLOOR_C = 0       // ниже этого на Талосе не бывает, °C
var MAX_COOL = -2.0   // сильнее не охлаждаем (единицы Cold Sweat)
var SMOOTH = 0.5      // плавность изменения поправки
var SHIP_H = 16       // высота корабля над низом шаблона
var RECALC = 20       // пересчитывать температуру среды раз в 20 тиков
var DEBUG_TICKS = 12000 // 10 минут отладочного лога после запуска

var $T = Java.loadClass('com.momosoftworks.coldsweat.api.util.Temperature')
var $Trait = Java.loadClass('com.momosoftworks.coldsweat.api.util.Temperature$Trait')
var $Units = Java.loadClass('com.momosoftworks.coldsweat.api.util.Temperature$Units')
var $BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
var $ArrayList = Java.loadClass('java.util.ArrayList')

var TARGET = $T.convert(TARGET_C, $Units.C, $Units.MC, true)
var FLOOR = $T.convert(FLOOR_C, $Units.C, $Units.MC, true)
var CACHE = {}   // uuid -> { t: тик, base: температура без нашей поправки }
var TICKS = 0

function dimId(level) {
  var s = String(level.dimension)
  var m = s.match(/([a-z0-9_.-]+:[a-z0-9_.\/-]+)\]?$/)
  return m ? m[1] : s
}

function toC(mc) {
  try { return Math.round($T.convert(mc, $Units.MC, $Units.C, true)) } catch (e) { return '?' }
}

// корабль, в котором стоит игрок (под крышей), или null
function shipAt(player) {
  if (!global.forpostBases || !global.forpostShips) return null
  if (dimId(player.level) !== TALOS) return null
  var x = player.x, y = player.y, z = player.z
  var list = global.forpostBases(player.server)
  for (var i = 0; i < list.length; i++) {
    var b = list[i]
    var s = b.kind ? global.forpostShips[b.kind] : null
    if (!s || b.sx === undefined) continue
    var ox = b.sx - s.ix, oy = b.sy - s.iy, oz = b.sz - s.iz
    if (x < ox || x >= ox + s.w || z < oz || z >= oz + s.d || y < oy || y >= oy + SHIP_H) continue
    var head = new $BlockPos(player.blockX, player.blockY + 2, player.blockZ)
    if (player.level.canSeeSky(head)) continue // на крыле или в пробоине — снаружи
    return b
  }
  return null
}

function isOurs(mod) {
  try { var nbt = mod.getNBT(); return nbt && String(nbt.getString('desolate_planet')) === 'shade' } catch (e) { return false }
}

// текущее значение нашей поправки и температура среды без неё
function readState(player) {
  var mods = $T.getModifiers(player, $Trait.WORLD)
  var others = new $ArrayList()
  var old = 0
  for (var i = 0; i < mods.size(); i++) {
    var m = mods.get(i)
    if (isOurs(m)) old = m.getNBT().getDouble('Temperature')
    else others.add(m)
  }
  var key = String(player.uuid)
  var c = CACHE[key]
  if (!c || player.age - c.t >= RECALC || player.age < c.t) {
    c = CACHE[key] = { t: player.age, base: $T.apply(0, player, $Trait.WORLD, others) }
  }
  return { old: old, base: c.base }
}

// значение модификатора «тень» на Талосе (null — не Талос, оставить как в сборке)
function shadeValue(player) {
  try {
    if (dimId(player.level) !== TALOS) return null
    var st = readState(player)
    var want = -(3 / 45) // обычная тень из сборки
    var ship = shipAt(player)
    if (ship) {
      // только снимаем жару: если вокруг теплее комфорта — охлаждаем до комфорта, иначе ничего
      want = st.base > TARGET ? Math.max(MAX_COOL, TARGET - st.base) : 0
    }
    // пол: температура среды на Талосе не ниже 0 °C
    if (st.base + want < FLOOR) want = FLOOR - st.base
    var v = st.old + (want - st.old) * SMOOTH
    if (Math.abs(want - v) < 0.01) v = want
    return v
  } catch (e) {
    console.error('[forpost_ship_climate] ' + e)
    return null
  }
}

// отладка: первые 10 минут после запуска
ServerEvents.tick(event => {
  TICKS++
  if (TICKS > DEBUG_TICKS || TICKS % 600 !== 0) return
  try {
    event.server.getPlayerList().getPlayers().forEach(p => {
      if (dimId(p.level) !== TALOS) return
      var st = readState(p)
      var world = $T.get(p, $Trait.WORLD)
      console.info('[forpost_ship_climate] ' + p.username + (shipAt(p) ? ' в корабле' : ' снаружи') +
        ': без поправки ' + toC(st.base) + '°C, поправка ' + st.old.toFixed(2) + ', итого ' + toC(world) + '°C')
    })
  } catch (e) { console.error('[forpost_ship_climate] debug: ' + e) }
})

// один раз сбросить застрявшую температуру тела у тех, кто играл до исправления
PlayerEvents.loggedIn(event => {
  var p = event.player
  if (p.persistentData.getBoolean('forpost_temp_fix_1005')) return
  p.persistentData.putBoolean('forpost_temp_fix_1005', true)
  try { $T.set(p, $Trait.CORE, 0) } catch (e) { console.error('[forpost_ship_climate] reset: ' + e) }
})

global.forpostShipCooling = shadeValue
global.forpostShipAt = shipAt

})()
