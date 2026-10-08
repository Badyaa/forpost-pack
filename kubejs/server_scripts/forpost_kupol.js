// Форпост: «Купол» — стартовое лобби в небе.
// Обзорный модуль «Рассвета-7» завис на парашютах высоко над Талосом (своё измерение varkin_system:kupol).
// Новый игрок попадает сюда, MAT в чате объясняет, что делать, а игрок выбирает табличкой:
//   ОДИН (панель на юге)      — своя капсула далеко от остальных;
//   С ДРУГОМ (панель на севере) — таблички с именами игроков, у которых уже есть база.
// После выбора — «сброс капсулы» (катсцена из forpost_intro.js) и посадка на базу.
// Команды: /lobby (или /купол) — вернуться в «Купол» и выбрать базу заново.
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

var KUPOL = 'varkin_system:kupol'
var SLOTS = 8                       // таблички с именами (по числу мест на сервере)
var SIGN_Y = 251
var FRIEND_Z = -7, FRIEND_X0 = -4   // таблички друзей: x = -4..3, панель на севере
var SOLO_Z = 7                      // табличка ОДИН: (0, 251, 7), панель на юге
var HINT_EVERY = 50 * 20            // повтор подсказки, тиков
var MAT = '§8[MAT]§r '
var SIGN_BLOCK = 'minecraft:dark_oak_wall_sign' // тёмное дерево + светящийся текст = читается издалека
var BUILD_FLAG = 'forpost_kupol_built_v3'  // v2: перестроить таблички (были бирюзовые, текст не читался)

function run(server, cmd) { return server.runCommandSilent(cmd) }
function inDim(server, cmd) { return run(server, 'execute in ' + KUPOL + ' run ' + cmd) }
function dimId(level) {
  var s = String(level.dimension)
  var m = s.match(/([a-z0-9_.-]+:[a-z0-9_.\/-]+)\]?$/)
  return m ? m[1] : s
}
function inKupol(entity) { return dimId(entity.level) === KUPOL }
function say(player, text) { player.tell(text) }
function online(server, n) { return server.getPlayerList().getPlayerByName(n) }

// ---------- постройка «Купола» (один раз на мир) ----------
function build(server) {
  var level = server.getLevel(KUPOL)
  if (!level) { console.error('[forpost_kupol] измерение ' + KUPOL + ' не найдено — проверь датапак config/openloader/data/varkin_system'); return false }
  var set = (x, y, z, id, props) => { var b = level.getBlock(x, y, z); if (props) b.set(id, props); else b.set(id) }
  var x, y, z, d
  // пол: круг радиусом 10, по краю железо, в центре лампа
  for (x = -11; x <= 11; x++) for (z = -11; z <= 11; z++) {
    d = Math.sqrt(x * x + z * z)
    if (d > 10.5) continue
    set(x, 248, z, 'minecraft:deepslate')
    set(x, 249, z, d > 9.5 ? 'minecraft:iron_block' : d <= 1.5 ? 'minecraft:sea_lantern'
      : ((x + z) % 2 === 0 ? 'minecraft:polished_deepslate' : 'minecraft:deepslate_tiles'))
  }
  // стеклянный купол с железными рёбрами
  for (x = -11; x <= 11; x++) for (y = 250; y <= 260; y++) for (z = -11; z <= 11; z++) {
    d = Math.sqrt(x * x + (y - 249) * (y - 249) + z * z)
    if (d < 9.5 || d > 10.5) continue
    var rib = x === 0 || z === 0 || Math.abs(x) === Math.abs(z) || y >= 259
    set(x, y, z, rib ? 'minecraft:iron_block' : 'minecraft:glass')
  }
  // тросы парашюта уходят вверх
  ;[[7, 7], [7, -7], [-7, 7], [-7, -7]].forEach(p => { for (var yy = 256; yy <= 300; yy++) set(p[0], yy, p[1], 'minecraft:chain') })
  // панель «С ДРУГОМ» (север)
  for (x = -5; x <= 4; x++) for (y = 250; y <= 253; y++) set(x, y, -8, 'minecraft:polished_blackstone')
  for (var i = 0; i < SLOTS; i++) set(FRIEND_X0 + i, SIGN_Y, FRIEND_Z, SIGN_BLOCK, { facing: 'south' })
  set(-1, 252, FRIEND_Z, SIGN_BLOCK, { facing: 'south' })
  set(0, 252, FRIEND_Z, SIGN_BLOCK, { facing: 'south' })
  // панель «ОДИН» (юг) + справочные таблички
  for (x = -3; x <= 3; x++) for (y = 250; y <= 253; y++) set(x, y, 8, 'minecraft:polished_blackstone')
  // v3: две кнопки — ОДИН («Искра») слева, ВДВОЁМ («Рассвет») справа
  ;[[0, 251], [0, 252], [-2, 251], [2, 251]].forEach(p => set(p[0], p[1], SOLO_Z, 'minecraft:air'))
  ;[[-1, 251], [-1, 252], [1, 251], [1, 252], [-3, 251], [3, 251]].forEach(p => set(p[0], p[1], SOLO_Z, SIGN_BLOCK, { facing: 'north' }))
  return true
}

function sign(server, x, y, z, lines, dye, cmd) {
  var m = []
  for (var i = 0; i < 4; i++) {
    var c = { text: lines[i] || '' }
    if (cmd && i === 0) c.clickEvent = { action: 'run_command', value: cmd }
    m.push("'" + JSON.stringify(c) + "'")
  }
  inDim(server, 'data merge block ' + x + ' ' + y + ' ' + z + ' {is_waxed:1b,front_text:{messages:[' + m.join(',') + '],color:"' + (dye || 'white') + '",has_glow_text:1b}}')
}

function ownersList(server) {
  var list = global.forpostBases ? global.forpostBases(server) : []
  return list.filter(b => b.owner && b.sx !== undefined)
}

function refreshSigns(server) {
  var owners = ownersList(server)
  for (var i = 0; i < SLOTS; i++) {
    var b = owners[i]
    var cmd = '/kupol_pick friend ' + i
    if (b) sign(server, FRIEND_X0 + i, SIGN_Y, FRIEND_Z, ['База ' + b.id, b.owner, '', '[ ПКМ ]'], 'light_blue', cmd)
    else sign(server, FRIEND_X0 + i, SIGN_Y, FRIEND_Z, ['', 'пусто', '', ''], 'gray', cmd)
  }
  sign(server, -1, 252, FRIEND_Z, ['С ДРУГОМ', 'на базу', 'к другу', ''], 'light_blue')
  sign(server, 0, 252, FRIEND_Z, ['выбери', 'имя ниже', '[ ПКМ ]', ''], 'light_blue')
  // панель смотрит на север, игрок стоит лицом на юг: x=+1 у него слева, x=-1 справа
  sign(server, 1, 252, SOLO_Z, ['ОДИН', 'малый корабль', '«Искра»', ''], 'lime', '/kupol_pick solo')
  sign(server, 1, 251, SOLO_Z, ['', '[ ПКМ ]', '', ''], 'lime', '/kupol_pick solo')
  sign(server, -1, 252, SOLO_Z, ['ВДВОЁМ', 'большой', '«Рассвет»', ''], 'aqua', '/kupol_pick duo')
  sign(server, -1, 251, SOLO_Z, ['[ ПКМ ]', 'друг потом', 'выберет', 'твоё имя'], 'aqua', '/kupol_pick duo')
  sign(server, 3, 251, SOLO_Z, ['/base', 'домой', '', ''], 'yellow')
  sign(server, -3, 251, SOLO_Z, ['/lobby', 'сюда', '', ''], 'yellow')
}

function ensureBuilt(server) {
  if (server.persistentData.getBoolean(BUILD_FLAG)) return
  inDim(server, 'forceload add -16 -16 15 15')
  server.scheduleInTicks(20, () => {
    try {
      if (build(server)) {
        server.persistentData.putBoolean(BUILD_FLAG, true)
        refreshSigns(server)
        console.info('[forpost_kupol] «Купол» построен')
      }
    } catch (e) { console.error('[forpost_kupol] build: ' + e) }
  })
}

// ---------- вход в «Купол» ----------
var IN = {} // ник → { tick }

function toKupol(server, player) {
  if (global.forpostThirstPause) global.forpostThirstPause(player, true, false)
  var n = player.username
  ensureBuilt(server)
  player.persistentData.putBoolean('forpost_in_kupol', true)
  run(server, 'gamemode adventure ' + n)
  run(server, 'execute in ' + KUPOL + ' run tp ' + n + ' 0.5 250 0.5 180 10')
  run(server, 'effect clear ' + n)
  refreshSigns(server)
  IN[n] = { tick: 0 }
  story(server, player)
}

function story(server, player) {
  var n = player.username
  var t = (text, sub, fi, st, fo) => {
    run(server, 'title ' + n + ' times ' + fi + ' ' + st + ' ' + fo)
    run(server, 'title ' + n + ' subtitle ' + JSON.stringify({ text: sub, color: 'gray' }))
    run(server, 'title ' + n + ' title ' + JSON.stringify({ text: text, color: 'gold', bold: true }))
  }
  var snd = (id, v, p) => run(server, 'execute as ' + n + ' at @s run playsound ' + id + ' master @s ~ ~ ~ ' + v + ' ' + p)
  var at = (ticks, f) => server.scheduleInTicks(ticks, () => { var p = online(server, n); if (p && IN[n]) f(p) })
  t('«Купол»', 'обзорный модуль «Рассвета-7»', 20, 80, 20)
  snd('minecraft:block.beacon.ambient', 1, 0.6)
  at(60, p => say(p, MAT + '§2Аварийный режим. Ты в обзорном модуле «Купол» — он оторвался от «Рассвета-7» при входе в атмосферу и держится на парашютах.'))
  at(140, p => say(p, MAT + '§2Внизу — планета T4L0S. Неизвестная: пыль, жара, радиация. Экипаж не отвечает. Связи нет.'))
  at(220, p => { say(p, MAT + '§aПереселенец — жив. Надел на Земле — зарезервирован. Модуль долго не продержится: выбери точку посадки.'); snd('minecraft:block.note_block.bit', 1, 1.6) })
  at(300, p => say(p, '§a▶ ОДИН§7 / §b▶ ВДВОЁМ§7 — таблички на панели §fпозади тебя§7 (юг): малый корабль «Искра» или большой «Рассвет» на двоих, в 3000 блоках от остальных.'))
  at(360, p => say(p, '§b▶ С ДРУГОМ§7 — панель §fперед тобой§7 (север): имена выживших, у которых уже есть база. Приземлишься к нему и играете вместе.'))
  at(420, p => { say(p, '§7Подойди к табличке и нажми §fправую кнопку мыши§7 — или кнопку прямо в чате:'); chatButtons(server, p) })
  at(480, p => say(p, '§7Команды на будущее: §f/base§7 — домой, §f/lobby§7 — вернуться в «Купол», §f/intro§7 — повторить посадку.'))
}

function leaveKupol(server, player) {
  if (global.forpostThirstPause) global.forpostThirstPause(player, false, true)
  delete IN[player.username]
  player.persistentData.putBoolean('forpost_in_kupol', false)
}

function busy(player) {
  var st = IN[player.username]
  if (st && st.picked) return true
  if (st) st.picked = true
  return false
}

function pickSolo(server, player, kind) {
  kind = kind || 'solo'
  if (!inKupol(player) || busy(player)) return
  var own = global.forpostOwnBase ? global.forpostOwnBase(server, player) : null
  if (own) {
    say(player, MAT + '§eУ тебя уже есть своя база №' + own.id + ' — возвращаю на неё.')
    leaveKupol(server, player)
    run(server, 'gamemode survival ' + player.username)
    global.forpostSendHome(server, player, own)
    return
  }
  say(player, MAT + (kind === 'duo' ? '§bТочка посадки: большой корабль «Рассвет» на двоих. Готовлю сброс…' : '§aТочка посадки: малый корабль «Искра». Готовлю сброс…'))
  global.forpostChooseOwn(server, player, kind)
}

function pickFriend(server, player, slot) {
  if (!inKupol(player)) return
  var b = ownersList(server)[slot]
  if (!b) { say(player, MAT + '§7Пусто: ни у кого ещё нет базы. Выбери §aОДИН§7 — панель позади тебя.'); return }
  if (busy(player)) return
  if (b.owner === player.username) { say(player, MAT + '§eЭто твоя собственная база. Возвращаю.'); leaveKupol(server, player); run(server, 'gamemode survival ' + player.username); global.forpostSendHome(server, player, b); return }
  say(player, MAT + '§bТочка посадки: база игрока ' + b.owner + '. Готовлю сброс…')
  global.forpostJoin(server, player, b.id)
}

// кнопки в чате — запасной способ выбора
function chatButtons(server, player) {
  var parts = [{ text: '' }, { text: '[ ОДИН: «Искра» ]', color: 'green', bold: true, clickEvent: { action: 'run_command', value: '/kupol_pick solo' }, hoverEvent: { action: 'show_text', contents: 'Малый корабль далеко от всех' } },
    { text: '  ' }, { text: '[ ВДВОЁМ: «Рассвет» ]', color: 'aqua', bold: true, clickEvent: { action: 'run_command', value: '/kupol_pick duo' }, hoverEvent: { action: 'show_text', contents: 'Большой корабль на двоих; друг потом выберет твоё имя' } }]
  ownersList(server).forEach((b, i) => {
    if (i >= SLOTS) return
    parts.push({ text: '  ' })
    parts.push({ text: '[ К ' + b.owner + ' ]', color: 'aqua', bold: true, clickEvent: { action: 'run_command', value: '/kupol_pick friend ' + i }, hoverEvent: { action: 'show_text', contents: 'Жить и играть на базе ' + b.owner } })
  })
  run(server, 'tellraw ' + player.username + ' ' + JSON.stringify(parts))
}

// в «Куполе» нельзя пострадать и нельзя упасть
EntityEvents.hurt(event => {
  if (event.entity.isPlayer() && inKupol(event.entity)) event.cancel()
})

ServerEvents.tick(event => {
  var server = event.server
  Object.keys(IN).forEach(n => {
    var p = online(server, n)
    if (!p) { delete IN[n]; return }
    if (!inKupol(p)) { delete IN[n]; return }
    var st = IN[n]
    st.tick++
    if (st.tick % 20 === 0 && (p.y < 240 || Math.abs(p.x) > 14 || Math.abs(p.z) > 14)) {
      run(server, 'execute in ' + KUPOL + ' run tp ' + n + ' 0.5 250 0.5 180 10')
    }
    if (st.tick % HINT_EVERY === 0) {
      say(p, MAT + '§7Жду выбора точки посадки. §aОДИН§7 — панель позади (юг), §bС ДРУГОМ§7 — имена впереди (север). ПКМ по табличке или кнопка:')
      chatButtons(server, p)
    }
  })
})

ServerEvents.loaded(event => { try { ensureBuilt(event.server) } catch (e) { console.error('[forpost_kupol] ' + e) } })

PlayerEvents.loggedIn(event => {
  var player = event.player, server = event.server
  var hasBase = global.forpostPlayerBase ? !!global.forpostPlayerBase(server, player) : false
  if (hasBase && !player.persistentData.getBoolean('forpost_in_kupol')) return
  server.scheduleInTicks(40, () => { var p = online(server, player.username); if (p) toKupol(server, p) })
})

ServerEvents.commandRegistry(event => {
  var Commands = event.commands
  var reg = name => event.register(Commands.literal(name).requires(src => true).executes(ctx => {
    var p = ctx.source.playerOrException
    toKupol(ctx.source.server, p)
    return 1
  }))
  reg('lobby'); reg('купол')
  var Arguments = event.arguments
  event.register(Commands.literal('kupol_pick').requires(src => true)
    .then(Commands.literal('solo').executes(ctx => { pickSolo(ctx.source.server, ctx.source.playerOrException, 'solo'); return 1 }))
    .then(Commands.literal('duo').executes(ctx => { pickSolo(ctx.source.server, ctx.source.playerOrException, 'duo'); return 1 }))
    .then(Commands.literal('friend').then(Commands.argument('slot', Arguments.INTEGER.create(event)).executes(ctx => {
      pickFriend(ctx.source.server, ctx.source.playerOrException, Arguments.INTEGER.getResult(ctx, 'slot')); return 1
    }))))
})

global.forpostToKupol = toKupol
global.forpostLeaveKupol = leaveKupol
global.forpostRefreshSigns = refreshSigns

})()
