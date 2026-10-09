// Только var: в Rhino (KubeJS) const/let внутри блоков дают «redeclaration of var» при повторном вызове.
// IIFE: всё внутри функции, чтобы имена не конфликтовали с другими скриптами KubeJS (общая область видимости)
;(function () {
// Форпост: базы игроков на Талосе + мобы вокруг баз.
//
// При первом входе игрок выбирает в чате:
//   [Своя база]        — свой корабль далеко от остальных (3000 блоков), свои квесты
//   [К базе <игрок>]   — переезд на базу друга, играете вместе (группу в книге квестов создать вручную)
// Команды (для всех игроков): /base (или /база) — домой; /base menu — меню; /base list — список баз;
//   /base join <номер> — переехать на другую базу.
//
// Мобы на Талосе (minecraft:overworld):
//   - кадавры везде заменяются обычными зомби (горят утром);
//   - в радиусе 7 чанков от КАЖДОЙ базы появляются только обычные зомби, скелеты, пауки, криперы.

var TALOS = 'minecraft:overworld'
var BASE_DISTANCE = 3000          // блоков между центром карты и новыми базами
var SAFE_RADIUS = 7 * 16          // 7 чанков
var SHIP_TEMPLATE = 'forpost:ship' // старый корабль (больше не ставится)
// Новые корабли: размер шаблона и точка появления внутри (относительно угла шаблона)
var SHIPS = {
  solo: { tpl: 'forpost:iskra', patch: 'forpost:iskra_patch3', name: '«Искра»', w: 53, d: 33, ix: 26, iy: 3, iz: 16 },
  duo: { tpl: 'forpost:rassvet', patch: 'forpost:rassvet_patch3', name: '«Рассвет»', w: 82, d: 47, ix: 36, iy: 3, iz: 20 }
}
var SHIP_VER = 3 // v3: шлюз с раздвижными дверями и кнопками, корпус без дыр, спальники целиком

// Корабли, поставленные до v3, дочиняются заплаткой: ставятся только изменённые блоки
// (двери, кнопки, трап, заделанные дыры), вещи игроков и сундуки не трогаются.
function upgradeShips(server) {
  var list = bases(server)
  var todo = list.filter(b => b.kind && SHIPS[b.kind] && b.sx !== undefined && (b.ver || 2) < SHIP_VER)
  todo.forEach((b, i) => {
    var ship = SHIPS[b.kind]
    var ox = b.sx - ship.ix, oy = b.sy - ship.iy, oz = b.sz - ship.iz
    var x1 = ox - 2, z1 = oz - 2, x2 = ox + ship.w + 2, z2 = oz + ship.d + 2
    server.scheduleInTicks(40 + i * 100, () => {
      run(server, `execute in ${TALOS} run forceload add ${x1} ${z1} ${x2} ${z2}`)
      server.scheduleInTicks(80, () => {
        run(server, `execute in ${TALOS} run place template ${ship.patch} ${ox} ${oy} ${oz}`)
        b.ver = SHIP_VER
        saveBases(server)
        console.info(`[forpost_bases] база ${b.id}: корабль обновлён до v${SHIP_VER} (${ox} ${oy} ${oz})`)
        server.scheduleInTicks(100, () => run(server, `execute in ${TALOS} run forceload remove ${x1} ${z1} ${x2} ${z2}`))
      })
    })
  })
}
// Корабль по умолчанию (стартовый, поставлен модом Starter Structure). Центр и точка появления внутри.
// Стартовый корабль ставит Starter Structure у точки спавна мира (+10 по Z). Точку внутри ищем при первом выборе.
var FIRST_OFFSET = { cz: 10, ix: -2, iz: 11 }

var HUSKS = ['minecraft:husk', 'specialmobs:huskzombie']
var RIG = { x: -2008, z: 2124 }, RIG_KEEP_R = 100 // у нефтяной вышки кадавры остаются (квест «Зачистка охраны»)
var ALLOWED_NEAR_BASE = [
  'minecraft:zombie', 'minecraft:skeleton', 'minecraft:spider', 'minecraft:creeper',
  'specialmobs:zombie', 'specialmobs:skeleton', 'specialmobs:spider', 'specialmobs:creeper'
]
var STARTER_KIT = [
  'thermal:wrench',
  'exdeorum:oak_sieve',
  'exdeorum:string_mesh',
  'crafting_on_a_stick:crafting_table',
  '4x kubejs:nutrient_brick',
  '16x minecraft:torch'
]

var $Heightmap = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')

// ---------- хранилище баз ----------
var BASES = null // [{id, owner, x, z, sx, sy, sz}]

function loadBases(server) {
  var raw = server.persistentData.getString('forpost_bases')
  BASES = raw ? JSON.parse(raw) : []
  if (BASES.length === 0) {
    var sp = server.getLevel(TALOS).getSharedSpawnPos()
    BASES.push({ id: 0, owner: '', x: sp.getX(), z: sp.getZ() + FIRST_OFFSET.cz })
    saveBases(server)
  }
  return BASES
}
// пол внутри корабля: снизу вверх ищем твёрдый блок, над которым два блока воздуха
function findFloor(level, x, y0, z) {
  for (var y = y0 - 8; y < y0 + 24; y++) {
    if (level.getBlock(x, y - 1, z).id !== 'minecraft:air' && level.getBlock(x, y, z).id === 'minecraft:air' && level.getBlock(x, y + 1, z).id === 'minecraft:air') return y
  }
  return y0 + 1
}
function fillFirstBase(server, b) {
  if (b.sx !== undefined) return
  var level = server.getLevel(TALOS)
  var sp = level.getSharedSpawnPos()
  b.sx = sp.getX() + FIRST_OFFSET.ix; b.sz = sp.getZ() + FIRST_OFFSET.iz
  b.sy = findFloor(level, b.sx, sp.getY(), b.sz)
  saveBases(server)
}
function saveBases(server) {
  server.persistentData.putString('forpost_bases', JSON.stringify(BASES))
}
function bases(server) { return BASES || loadBases(server) }
function playerBase(server, player) {
  var id = player.persistentData.getInt('forpost_base') - 1 // 0 = не выбрано
  return id >= 0 ? bases(server).find(b => b.id === id) : null
}

// ---------- действия ----------
function run(server, cmd) { server.runCommandSilent(cmd) }

function sendHome(server, player, base) {
  var n = player.username
  run(server, `execute in ${TALOS} run tp ${n} ${base.sx + 0.5} ${base.sy} ${base.sz + 0.5}`)
  run(server, `execute in ${TALOS} run spawnpoint ${n} ${base.sx} ${base.sy} ${base.sz}`)
}

function giveKit(server, player) {
  if (player.persistentData.getBoolean('forpost_kit')) return
  player.persistentData.putBoolean('forpost_kit', true)
  STARTER_KIT.forEach(i => player.give(i))
  run(server, `give ${player.username} minecraft:potion{Potion:"minecraft:water",Purity:3} 6`)
  run(server, `give ${player.username} cold_sweat:filled_waterskin 2`)
  if (global.forpostThirstFill) global.forpostThirstFill(player)
  player.tell(Text.gold('Стартовый набор выжившего выдан. Следи за едой (зерновые!), водой и температурой.'))
}

function landedHints(server, player, base) {
  var n = player.username
  var mine = base.owner === n
  var at = (t, f) => server.scheduleInTicks(t, () => { var p = server.getPlayerList().getPlayerByName(n); if (p) f(p) })
  at(20, p => p.tell('§8[MAT]§r §aПосадка завершена. ' + (mine ? 'Это твоя база №' + base.id + '.' : 'Ты на базе игрока ' + base.owner + '.') + ' §7Вернуться сюда в любой момент — §f/base§7.'))
  at(80, p => p.tell('§8[MAT]§r §7Первое дело — §fкнига квестов§7 в инвентаре: глава «Пролог», дальше «Основы выживания». Там по шагам: вода, еда, температура, ночь.'))
  at(140, p => p.tell('§8[MAT]§r §7Вокруг базы 7 чанков — лёгкая зона: только зомби, скелеты, пауки и криперы. Дальше — опаснее, туда позже.'))
  if (!mine) at(200, p => p.tell('§8[MAT]§r §bЧтобы квесты шли вместе: книга квестов → вкладка «Группа» → вступить в группу ' + base.owner + '. Награду получит каждый.'))
  at(260, p => p.tell('§7Команды: §f/base§7 — домой, §f/lobby§7 — «Купол» (сменить базу), §f/intro§7 — повторить посадку, §f/base list§7 — все базы.'))
}

function assign(server, player, base) {
  player.persistentData.putInt('forpost_base', base.id + 1)
  player.persistentData.putBoolean('forpost_assign_pending', true) // 09.10: снимется в done(); если игрок выйдет во время катсцены — доделаем при входе
  var done = () => {
    player.persistentData.putBoolean('forpost_assign_pending', false) // 09.10
    sendHome(server, player, base)
    giveKit(server, player)
    landedHints(server, player, base)
    if (global.forpostProtect) global.forpostProtect(server, player, base)
    if (global.forpostRefreshSigns) global.forpostRefreshSigns(server)
  }
  var fromKupol = player.persistentData.getBoolean('forpost_in_kupol')
  if (fromKupol && global.forpostDescent) global.forpostDescent(server, player, base, done)
  else done()
}

var CHOOSE_LOCK = {} // 09.10: ник -> время последнего chooseOwn (мс), защита от двойного клика

function chooseOwn(server, player, kind) {
  // 09.10: двойной «/base own» (кнопки в чате) создавал две базы: база назначается игроку только в конце tryPlace (через 3+ с).
  var nowMs = Date.now()
  var lastMs = CHOOSE_LOCK[player.username]
  if (lastMs && nowMs - lastMs < 3000) return
  CHOOSE_LOCK[player.username] = nowMs
  var uid = String(player.uuid)
  var mineBase = bases(server).find(b => b.id !== 0 && b.owner && (b.owner === player.username || (b.ownerId && b.ownerId === uid)))
  if (mineBase) {
    if (mineBase.sx === undefined) { player.tell(Text.yellow('Твоя база №' + mineBase.id + ' уже строится — подожди несколько секунд.')); return }
    player.tell(Text.yellow('У тебя уже есть своя база №' + mineBase.id + ' — возвращаю на неё.'))
    assign(server, player, mineBase)
    return
  }
  var ship = SHIPS[kind] || SHIPS.solo
  kind = SHIPS[kind] ? kind : 'solo'
  var list = bases(server)
  // старый стартовый корабль у спавна (база №0) больше не выдаём; если он был твоим — освобождаем
  list.forEach(b => { if (b.id === 0 && b.owner === player.username) { b.owner = ''; b.ownerId = '' } })
  var id = list.length
  var base = { id: id, owner: player.username, ownerId: String(player.uuid), kind: kind, ver: SHIP_VER, x: 0, z: 0 } // резервируем номер сразу
  list.push(base)
  var angle = id * 2.39996 // золотой угол — базы не встанут рядом друг с другом
  var cx = Math.round(Math.cos(angle) * BASE_DISTANCE)
  var cz = Math.round(Math.sin(angle) * BASE_DISTANCE)
  base.x = cx; base.z = cz
  saveBases(server)
  player.tell(Text.yellow('Готовлю место посадки для корабля ' + ship.name + '… подожди несколько секунд.'))
  var r = Math.ceil(Math.max(ship.w, ship.d) / 2) + 16
  var x1 = cx - r, z1 = cz - r, x2 = cx + r, z2 = cz + r
  run(server, `execute in ${TALOS} run forceload add ${x1} ${z1} ${x2} ${z2}`)
  var tryPlace = attempt => {
    var level = server.getLevel(TALOS)
    var h = level.getHeight($Heightmap.MOTION_BLOCKING_NO_LEAVES, cx, cz)
    var ox = cx - Math.floor(ship.w / 2), oy = h - 1, oz = cz - Math.floor(ship.d / 2)
    run(server, `execute in ${TALOS} run place template ${ship.tpl} ${ox} ${oy} ${oz}`)
    // пол внутри корабля — проверка, что шаблон встал (чанки могли ещё не догрузиться)
    var floor = level.getBlock(ox + ship.ix, oy + ship.iy - 1, oz + ship.iz).id
    if (floor === 'minecraft:air' && attempt < 6) {
      server.scheduleInTicks(60, () => tryPlace(attempt + 1))
      return
    }
    base.sx = ox + ship.ix; base.sy = oy + ship.iy; base.sz = oz + ship.iz
    saveBases(server)
    assign(server, player, base)
    player.tell(Text.green(`Твоя база №${id} (${ship.name}): ${cx}, ${cz}. Возвращаться — /base`))
    if (floor === 'minecraft:air') console.warn(`[forpost_bases] корабль ${ship.tpl} для базы ${id} мог не встать (${ox} ${oy} ${oz})`)
    else console.info(`[forpost_bases] база ${id}: ${ship.tpl} для ${player.username} в ${ox} ${oy} ${oz}`)
    server.scheduleInTicks(200, () => run(server, `execute in ${TALOS} run forceload remove ${x1} ${z1} ${x2} ${z2}`))
  }
  server.scheduleInTicks(60, () => tryPlace(0))
}

function joinBase(server, player, id) {
  var base = bases(server).find(b => b.id === id)
  if (!base || !base.owner) { player.tell(Text.red('Такой базы нет.')); return }
  if (base.sx === undefined) { player.tell(Text.yellow('Эта база ещё строится, попробуй через минуту.')); return }
  assign(server, player, base)
  player.tell(Text.green(`Ты на базе игрока ${base.owner}. Чтобы квесты шли вместе: книга квестов → вкладка группы → вступить в группу ${base.owner}.`))
}

function showMenu(server, player) {
  var n = player.username
  var btn = (label, color, cmd, hover) =>
    `{"text":"[${label}]","color":"${color}","bold":true,"clickEvent":{"action":"run_command","value":"${cmd}"},"hoverEvent":{"action":"show_text","contents":"${hover}"}}`
  var parts = ['{"text":"\\n=== Выбери, как играть (или /lobby — «Купол») ===\\n","color":"gold"}',
    btn('Один: «Искра»', 'green', '/base own', 'Малый корабль, один чёрный ящик'), '{"text":"  "}',
    btn('Вдвоём: «Рассвет»', 'aqua', '/base duo', 'Большой корабль на двоих, два чёрных ящика; друг выберет твоё имя'), '{"text":"\\n"}']
  bases(server).filter(b => b.owner && b.owner !== n).forEach(b => {
    parts.push(btn(`К базе ${b.owner}`, 'aqua', `/base join ${b.id}`, `Жить и выполнять квесты вместе с ${b.owner}`))
    parts.push('{"text":"  "}')
  })
  run(server, `tellraw ${n} [${parts.join(',')}]`)
}

// ---------- события ----------
ServerEvents.loaded(event => { loadBases(event.server); try { upgradeShips(event.server) } catch (e) { console.error('[forpost_bases] upgrade: ' + e) } })

PlayerEvents.loggedIn(event => {
  var player = event.player, server = event.server
  // вышел во время «сброса капсулы» — просто ставим на базу
  if (player.persistentData.getBoolean('forpost_descent')) {
    var b = playerBase(server, player)
    player.persistentData.putBoolean('forpost_descent', false)
    player.persistentData.putBoolean('forpost_in_kupol', false)
    var pending = player.persistentData.getBoolean('forpost_assign_pending') // 09.10
    player.persistentData.putBoolean('forpost_assign_pending', false) // 09.10
    server.scheduleInTicks(20, () => {
      run(server, 'gamemode survival ' + player.username)
      if (b && b.sx !== undefined) {
        sendHome(server, player, b); giveKit(server, player)
        // 09.10: onDone катсцены не вызывался — делаем привязку привата/группы OPAC и таблички при входе (forpostProtect идемпотентен)
        try {
          if (global.forpostProtect) global.forpostProtect(server, player, b)
          if (global.forpostRefreshSigns) global.forpostRefreshSigns(server)
        } catch (e) { console.error('[forpost_bases] login protect: ' + e) }
        if (pending) landedHints(server, player, b)
      }
    })
  }
  // новые игроки попадают в «Купол» (forpost_kupol.js)
})

ServerEvents.commandRegistry(event => {
  var Commands = event.commands, Arguments = event.arguments
  var build = name => Commands.literal(name)
    .requires(src => true)
    .executes(ctx => {
      var p = ctx.source.playerOrException, s = ctx.source.server
      var b = playerBase(s, p)
      if (b && b.sx !== undefined) sendHome(s, p, b); else showMenu(s, p)
      return 1
    })
    .then(Commands.literal('menu').executes(ctx => { showMenu(ctx.source.server, ctx.source.playerOrException); return 1 }))
    .then(Commands.literal('own').executes(ctx => {
      var p = ctx.source.playerOrException, s = ctx.source.server
      var b = playerBase(s, p)
      if (b && b.owner === p.username && b.id !== 0) { p.tell(Text.yellow('У тебя уже есть своя база — /base')); return 0 }
      chooseOwn(s, p, 'solo'); return 1
    }))
    .then(Commands.literal('duo').executes(ctx => {
      var p = ctx.source.playerOrException, s = ctx.source.server
      var b = playerBase(s, p)
      if (b && b.owner === p.username && b.id !== 0) { p.tell(Text.yellow('У тебя уже есть своя база — /base')); return 0 }
      chooseOwn(s, p, 'duo'); return 1
    }))
    .then(Commands.literal('list').executes(ctx => {
      var p = ctx.source.playerOrException
      bases(ctx.source.server).filter(b => b.owner).forEach(b => p.tell(`№${b.id} — ${b.owner} (${b.x}, ${b.z})`))
      return 1
    }))
    .then(Commands.literal('join').then(Commands.argument('id', Arguments.INTEGER.create(event)).executes(ctx => {
      joinBase(ctx.source.server, ctx.source.playerOrException, Arguments.INTEGER.getResult(ctx, 'id')); return 1
    })))
  event.register(build('base'))
  event.register(build('база'))
})

global.forpostBases = bases
global.forpostShips = SHIPS
global.forpostPlayerBase = playerBase
global.forpostOwnBase = (server, player) => { var b = playerBase(server, player); return b && b.owner === player.username && b.id !== 0 ? b : null }
global.forpostSendHome = sendHome
global.forpostChooseOwn = chooseOwn
global.forpostJoin = joinBase

// Мобы: замена кадавров и лёгкие зоны вокруг баз
EntityEvents.spawned(event => {
  var e = event.entity
  var level = event.level
  if (level.dimension.toString() !== TALOS) return
  if (!e.isMonster()) return
  var type = String(e.type)

  var dxw = e.x - RIG.x, dzw = e.z - RIG.z
  if (HUSKS.includes(type) && dxw * dxw + dzw * dzw >= RIG_KEEP_R * RIG_KEEP_R) {
    var x = e.x, y = e.y, z = e.z
    level.server.scheduleInTicks(1, () => {
      var zombie = level.createEntity('minecraft:zombie')
      zombie.setPos(x, y, z)
      zombie.spawn()
    })
    event.cancel() // в KubeJS 6 cancel() завершает обработчик — поэтому последним
  }

  if (ALLOWED_NEAR_BASE.includes(type)) return
  var r2 = SAFE_RADIUS * SAFE_RADIUS
  for (var b of bases(level.server)) {
    var dx = e.x - b.x, dz = e.z - b.z
    if (dx * dx + dz * dz < r2) { event.cancel(); return }
  }
})

})()
