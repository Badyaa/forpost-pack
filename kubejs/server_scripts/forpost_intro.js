// Форпост: катсцена «сброс капсулы» (~30 с) — посадка из «Купола» на выбранную базу.
// Камера (режим наблюдателя) падает с неба к базе, облетает корабль и «входит» внутрь; по центру титры,
// в чате — MAT. В конце игрок оказывается на базе в выживании, получает стартовый набор и подсказки.
// Команды: /intro — посмотреть посадку на свою базу ещё раз; /intro skip — пропустить.
// Вызов из других скриптов: global.forpostDescent(server, player, base, onDone)
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

var TALOS = 'minecraft:overworld'
var LENGTH = 30 * 20                        // тиков
var RUN = {}                                // ник → { tick, ship, eye, done }

var lerp = (a, b, k) => a + (b - a) * k
var smooth = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k) }
var mix = (p, q, k) => ({ x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k), z: lerp(p.z, q.z, k) })
var ORBIT_R = 28, ORBIT_DY = 11, ORBIT_A0 = -2.2, ORBIT_A1 = -2.2 + Math.acos(-1) * 0.9

function camera(st, s) {
  var SHIP = st.ship, EYE = st.eye
  var R = (dx, dy, dz) => ({ x: SHIP.x + dx, y: SHIP.y + dy, z: SHIP.z + dz })
  var orbit = a => ({ x: SHIP.x + Math.cos(a) * ORBIT_R, y: SHIP.y + ORBIT_DY, z: SHIP.z + Math.sin(a) * ORBIT_R })
  var look = { x: EYE.x + 12, y: EYE.y, z: EYE.z }
  if (s < 5) return { pos: mix(R(60, 230, -90), R(50, 200, -80), s / 5), look: SHIP }            // высоко в небе
  if (s < 12) { var k = Math.pow((s - 5) / 7, 2); return { pos: mix(R(50, 200, -80), orbit(ORBIT_A0), k), look: SHIP } } // падение
  if (s < 22) return { pos: orbit(lerp(ORBIT_A0, ORBIT_A1, (s - 12) / 10)), look: SHIP }           // облёт
  if (s < 27) { var k2 = smooth((s - 22) / 5); return { pos: mix(orbit(ORBIT_A1), EYE, k2), look: mix(SHIP, look, k2) } }
  return { pos: EYE, look: look }
}

var T = (text, color, bold) => JSON.stringify({ text: text, color: color || 'white', bold: !!bold })

function cue(server, n, st, tick) {
  var run = c => server.runCommandSilent(c)
  var title = (t, sub, fi, stay, fo) => {
    run('title ' + n + ' times ' + (fi || 10) + ' ' + (stay || 80) + ' ' + (fo || 15))
    run('title ' + n + ' subtitle ' + sub)
    run('title ' + n + ' title ' + t)
  }
  var sound = (id, vol, pitch) => run('execute as ' + n + ' at @s run playsound ' + id + ' master @s ~ ~ ~ ' + (vol || 1) + ' ' + (pitch || 1))
  switch (tick) {
    case 1: run('effect give ' + n + ' minecraft:darkness 3 0 true'); sound('minecraft:block.beacon.deactivate', 1, 0.5); sound('minecraft:entity.generic.explode', 0.8, 0.5); break
    case 20: title(T('СБРОС КАПСУЛЫ', 'red', true), T('MAT: держись.', 'gray'), 5, 70, 15); sound('minecraft:item.elytra.flying', 0.6, 0.6); break
    case 110: title(T('T4L0S', 'gold', true), T('Неизвестная планета. Пустыня. Жара. Радиация.', 'gold'), 15, 90, 15); break
    case 160: case 180: case 200: sound('minecraft:block.note_block.bit', 1, 0.6); break
    case 240: title(T(st.label, 'aqua', true), T(st.sub, 'gray'), 15, 90, 15); sound('minecraft:block.beacon.activate', 1, 0.8); break
    case 440: sound('minecraft:entity.lightning_bolt.impact', 1, 0.6); run('effect give ' + n + ' minecraft:darkness 2 0 true'); break
    case 470: title(T('Выживи.', 'gold', true), T('Почини корабль. Построй ракету. Вернись домой.'), 15, 100, 20); sound('minecraft:ui.toast.challenge_complete', 0.6, 0.8); break
    case 560: run('title ' + n + ' actionbar ' + T('ФОРПОСТ · сборка badya1079', 'gold')); break
  }
}

var online = (server, n) => server.getPlayerList().getPlayerByName(n)

function start(server, player, base, onDone) {
  var n = player.username
  if (RUN[n]) return
  var eye = { x: base.sx + 0.5, y: base.sy + 1.6, z: base.sz + 0.5 }
  var ship = { x: base.x, y: base.sy, z: base.z }
  var mine = base.owner === n
  RUN[n] = {
    tick: 0, ship: ship, eye: eye, done: onDone,
    label: mine ? 'База №' + base.id : 'База игрока ' + base.owner,
    sub: mine ? 'Твоя точка посадки. Координаты: ' + base.x + ', ' + base.z : 'Ты приземляешься к другу. Координаты: ' + base.x + ', ' + base.z
  }
  player.persistentData.putBoolean('forpost_descent', true)
  if (global.forpostThirstPause) global.forpostThirstPause(player, true, false)
  server.runCommandSilent('gamemode spectator ' + n)
  server.runCommandSilent('execute in ' + TALOS + ' run forceload add ' + (base.x - 48) + ' ' + (base.z - 48) + ' ' + (base.x + 48) + ' ' + (base.z + 48))
  server.runCommandSilent('tellraw ' + n + ' ' + T('(пропустить: /intro skip)', 'dark_gray'))
}

function finish(server, player) {
  var n = player.username
  var st = RUN[n]
  delete RUN[n]
  player.persistentData.putBoolean('forpost_descent', false)
  if (global.forpostThirstPause) global.forpostThirstPause(player, false, true)
  if (global.forpostLeaveKupol) global.forpostLeaveKupol(server, player)
  server.runCommandSilent('title ' + n + ' clear')
  server.runCommandSilent('effect clear ' + n + ' minecraft:darkness')
  server.runCommandSilent('gamemode survival ' + n)
  if (st && st.ship) server.scheduleInTicks(100, () => server.runCommandSilent('execute in ' + TALOS + ' run forceload remove ' + (st.ship.x - 48) + ' ' + (st.ship.z - 48) + ' ' + (st.ship.x + 48) + ' ' + (st.ship.z + 48)))
  if (st && st.done) { try { st.done() } catch (e) { console.error('[forpost_intro] done: ' + e) } }
}

ServerEvents.tick(event => {
  var server = event.server
  Object.keys(RUN).forEach(n => {
    var player = online(server, n)
    if (!player) { delete RUN[n]; return } // вышел — при входе forpost_bases.js вернёт на базу
    try {
      var st = RUN[n]
      st.tick++
      if (st.tick >= LENGTH) { finish(server, player); return }
      cue(server, n, st, st.tick)
      if (st.tick % 2 === 0) {
        var c = camera(st, st.tick / 20)
        var f = v => v.toFixed(2)
        server.runCommandSilent('execute in ' + TALOS + ' run tp ' + n + ' ' + f(c.pos.x) + ' ' + f(c.pos.y) + ' ' + f(c.pos.z) + ' facing ' + f(c.look.x) + ' ' + f(c.look.y) + ' ' + f(c.look.z))
      }
    } catch (e) {
      console.error('[forpost_intro] ' + e)
      finish(server, player)
    }
  })
})

ServerEvents.commandRegistry(event => {
  var Commands = event.commands
  event.register(Commands.literal('intro')
    .requires(src => true)
    .executes(ctx => {
      var p = ctx.source.playerOrException, s = ctx.source.server
      var b = global.forpostPlayerBase ? global.forpostPlayerBase(s, p) : null
      if (!b || b.sx === undefined) { p.tell('§eСначала выбери базу в «Куполе» (/lobby).'); return 0 }
      start(s, p, b, () => global.forpostSendHome(s, p, b))
      return 1
    })
    .then(Commands.literal('skip').executes(ctx => {
      var p = ctx.source.playerOrException
      if (RUN[p.username]) finish(ctx.source.server, p)
      return 1
    })))
})

global.forpostDescent = start
global.forpostDescentSkip = function (server, player) { if (RUN[player.username]) finish(server, player) }

})()
