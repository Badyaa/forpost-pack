// Форпост: журнал событий для «Вестника Форпоста» (Telegram-бот читает его через RCON).
// Копит события (смерти, входы/выходы, посадки, тревоги, ракеты…) в server.persistentData и отдаёт пачками:
//   /forpost_news dump <fromId> [count]   — JSON-строки событий с id > fromId (по умолчанию 12 штук; RCON режет ответ на 4 КБ)
//   /forpost_news last                    — id последнего события
//   /forpost_news add <type> <json>       — добавить событие извне (HQM command-награды, другие скрипты)
//   /forpost_news clear                   — очистить журнал (админ)
// Плюс: счётчики активности (деревья, урожай, ягоды/фрукты/овощи, руда, посадки, сито, молот, крафты, еда/питьё, блоки, убитые мобы, сон) и события колоний MineColonies
// (новая колония, здание построено/улучшено, житель родился/умер/сменил профессию, гость в колонии).
// Из других скриптов: global.forpostNews(server, 'type', { ...поля })
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS). event.cancel() не используется.
// 08.10.2026: ответы команд через sendSystemMessage (sendSuccess с функцией отдавал по RCON «ArrowFunction…»), лимит размера журнала,
//             запись выходов при остановке сервера, достижения.
;(function () {

var MAX = 400          // сколько событий хранить (не больше; дополнительно режется по размеру, см. BYTES)
var BYTES = 60000      // NBT-строка в файле мира не может быть длиннее 65535 байт — держим журнал меньше
var KEY = 'forpost_news'
var SESSION = {}       // ник → { login: ms, deaths: n }
var STOPPING = false   // сервер останавливается — выходы уже записаны в ServerEvents.unloaded
function utf8len(str) { var n = 0; for (var i = 0; i < str.length; i++) { var c = str.charCodeAt(i); n += c < 0x80 ? (c ? 1 : 2) : c < 0x800 ? 2 : 3 } return n }

function now() { return Date.now() }
function load(server) {
  try { var raw = server.persistentData.getString(KEY); if (raw && raw.length) return JSON.parse(raw) } catch (e) { console.error('[forpost_news] load: ' + e) }
  return { last: 0, items: [] }
}
function save(server, st) {
  var raw = JSON.stringify(st)
  while (st.items.length > 1 && utf8len(raw) > BYTES) { st.items.splice(0, Math.max(1, Math.ceil(st.items.length / 10))); raw = JSON.stringify(st) }
  server.persistentData.putString(KEY, raw)
}

function push(server, type, data) {
  try {
    var st = load(server)
    var id = st.last + 1
    var rec = { id: id, t: now(), type: type }
    if (data) Object.keys(data).forEach(k => { if (data[k] !== undefined && data[k] !== null) rec[k] = data[k] })
    st.items.push(rec)
    while (st.items.length > MAX) st.items.shift()
    st.last = id
    save(server, st)
  } catch (e) { console.error('[forpost_news] push: ' + e) }
}
global.forpostNews = push

function dimOf(entity) { var s = String(entity.level.dimension); var m = s.match(/([a-z0-9_.-]+:[a-z0-9_.\/-]+)\]?$/); return m ? m[1] : s }
function baseOf(server, player) {
  try { var b = global.forpostPlayerBase ? global.forpostPlayerBase(server, player) : null; return b ? { base: b.id, owner: b.owner } : {} } catch (e) { return {} }
}

// ---- события ----
PlayerEvents.loggedIn(event => {
  var p = event.player, s = event.server
  SESSION[p.username] = { login: now(), deaths: 0 }
  push(s, 'login', Object.assign({ player: p.username, online: s.getPlayerList().getPlayerCount() }, baseOf(s, p)))
})
PlayerEvents.loggedOut(event => {
  if (STOPPING) return
  var p = event.player, s = event.server
  var ss = SESSION[p.username]
  var mins = ss ? Math.round((now() - ss.login) / 60000) : null
  delete SESSION[p.username]
  flushAct(s, p.username)
  push(s, 'logout', { player: p.username, minutes: mins, deaths_session: ss ? ss.deaths : null })
})
EntityEvents.death(event => {
  var e = event.entity
  if (!e.isPlayer()) return
  var s = event.server
  var src = event.source
  var killer = null, type = null
  try { type = String(src.getType ? src.getType() : src.type) } catch (err) {}
  try { var a = src.getActual ? src.getActual() : (src.actual || null); if (a) killer = String(a.type) + (a.isPlayer() ? ':' + a.username : '') } catch (err) {}
  var ss = SESSION[e.username]; if (ss) ss.deaths++
  var rec = { player: e.username, cause: type, killer: killer, dim: dimOf(e), x: Math.round(e.x), y: Math.round(e.y), z: Math.round(e.z), night: e.level.isNight ? !!e.level.isNight() : null }
  try { rec.msg = String(src.getLocalizedDeathMessage(e).getString()) } catch (err) {}
  push(s, 'death', Object.assign(rec, baseOf(s, e)))
})
// убийства игроком «важных» мобов — боссы, начальник охраны, кадавры у вышки
EntityEvents.death(event => {
  var e = event.entity
  if (e.isPlayer()) return
  var a = null; try { a = event.source.getActual ? event.source.getActual() : null } catch (err) {}
  if (!a || !a.isPlayer()) return
  var t = String(e.type)
  try { if (e.isMonster() && !a.isCreative()) act(a).mobs++ } catch (err) {}
  var name = null; try { if (e.hasCustomName()) name = String(e.customName.getString()) } catch (err) {}
  // важные: именные, настоящие боссы (по типу или запасу здоровья ≥ 150). «brute» из specialmobs — обычный усиленный моб, не босс
  var hp = 0; try { hp = e.getMaxHealth() } catch (err) {}
  var important = name !== null || /ender_dragon|wither$|warden|:giant$|boss|elder_guardian/i.test(t) || hp >= 150
  if (!important) return
  push(event.server, 'kill', { player: a.username, mob: t, name: name, dim: dimOf(e) })
})
// 10 минут игры подряд ночью на улице — «ночные приключения»; редкие штуки ловим по событиям выше, этого хватит для юмора


// ---- хозяйственная активность: деревья, урожай, ягоды, руда, посадки (копится и сбрасывается раз в 30 мин и при выходе) ----
var ACT = {} // ник → { logs, crops, berries, fruits, veggies, ores, stone, planted }
// 09.10: поле drank убрано из счётчиков — ItemEvents.foodEaten (миксин LivingEntity.eat) срабатывает только для съедобных
// предметов; бутылки воды (зелья), бурдюки Cold Sweat и питьё Thirst Was Taken его не вызывают, поэтому drank всегда был 0.
// В KubeJS 6 (2001.6.5) нет серверного события завершения использования предмета (finishUsing есть только у своих предметов).
function act(player) { var n = player.username; if (!ACT[n]) ACT[n] = { logs: 0, crops: 0, berries: 0, fruits: 0, veggies: 0, ores: 0, stone: 0, planted: 0, sieve: 0, hammer: 0, crafted: 0, eaten: 0, placed: 0, mobs: 0, slept: 0 }; return ACT[n] }
function hasTag(block, tag) { try { return block.hasTag(tag) } catch (e) { return false } }
function foodKind(id) {
  id = String(id)
  if (/berr/.test(id)) return 'berries'
  if (/apple|melon_slice|fruit|banana|orange|cherry|peach|pear|plum|grape|mango|kiwi|lemon|lime|coconut|pineapple|fig|date/.test(id)) return 'fruits'
  if (/carrot|potato|beetroot|tomato|cabbage|onion|pumpkin|turnip|radish|cucumber|pepper|lettuce|corn|eggplant|garlic|vegetable|mushroom/.test(id)) return 'veggies'
  return null
}
BlockEvents.broken(event => {
  var p = event.player; if (!p || !p.isPlayer() || p.isCreative()) return
  var b = event.block, a = act(p)
  try { if (/hammer/.test(String(p.mainHandItem.id))) a.hammer++ } catch (e) {}
  if (hasTag(b, 'minecraft:logs')) a.logs++
  else if (hasTag(b, 'forge:ores') || hasTag(b, 'minecraft:coal_ores') || hasTag(b, 'minecraft:iron_ores') || hasTag(b, 'minecraft:copper_ores') || /_ore$/.test(String(b.id))) a.ores++
  else if (hasTag(b, 'minecraft:crops')) { try { var age = b.properties.get('age'); var max = b.blockState.getBlock().getStateDefinition().getProperty('age').getPossibleValues().size() - 1; if (String(age) === String(max)) a.crops++ } catch (e) { a.crops++ } }
  else if (/stone|deepslate|sandstone|andesite|granite|diorite/.test(String(b.id)) && !/_ore/.test(String(b.id))) a.stone++
})
BlockEvents.placed(event => {
  var p = event.player; if (!p || !p.isPlayer() || p.isCreative()) return
  var b = event.block, a = act(p)
  a.placed++
  if (hasTag(b, 'minecraft:saplings') || hasTag(b, 'minecraft:crops') || /sapling|seeds|_bush$/.test(String(b.id))) a.planted++
})
BlockEvents.rightClicked(event => {
  if (String(event.hand) !== 'MAIN_HAND') return // 09.10: событие приходит для обеих рук — без фильтра сито и ночёвки считались дважды
  var p = event.player; if (!p || p.isCreative()) return
  var id = String(event.block.id)
  if (/sieve/.test(id)) act(p).sieve++
  else if (/_bed$/.test(id)) act(p).slept++
})
ItemEvents.crafted(event => { var p = event.player; if (!p || p.isCreative()) return; act(p).crafted += event.item.count })
ItemEvents.foodEaten(event => {
  var p = event.player; if (!p || p.isCreative()) return
  act(p).eaten++ // 09.10: drank убран (см. выше) — съедобные напитки (мёд, соки) считаются приёмом пищи
})
ItemEvents.pickedUp(event => {
  var p = event.player; if (!p || p.isCreative()) return
  var kind = foodKind(event.item.id); if (!kind) return
  act(p)[kind] += event.item.count
})
function flushAct(server, name) {
  var a = ACT[name]; if (!a) return
  var any = Object.keys(a).some(k => a[k] > 0)
  if (any) push(server, 'activity', Object.assign({ player: name }, a))
  delete ACT[name]
}
var TICKS = 0 // свой счётчик: event.server.tickCount в KubeJS 6 недоступен
ServerEvents.tick(event => {
  if (++TICKS % 36000 !== 0) return // каждые 30 минут
  Object.keys(ACT).forEach(n => flushAct(event.server, n))
})

// ---- события колоний MineColonies (через её собственную шину событий) ----
function colonyName(c) { try { return String(c.getName()) } catch (e) { return '?' } }
function colonyOwner(c) { try { return String(c.getPermissions().getOwnerName()) } catch (e) { return '' } }
function citizens(c) { try { return c.getCitizenManager().getCurrentCitizenCount() } catch (e) { return null } }
function buildingId(b) { try { return String(b.getBuildingType().getRegistryName()).replace(/^minecolonies:/, '') } catch (e) { try { return String(b.getSchematicName()) } catch (e2) { return '?' } } }
function citizenJob(cit) { try { var j = cit.getJob(); return j ? String(j.getJobRegistryEntry().getKey()).replace(/^minecolonies:/, '') : null } catch (e) { return null } }
function subscribeColony(server) {
  var $Proxy
  try { $Proxy = Java.loadClass('com.minecolonies.api.MinecoloniesAPIProxy') } catch (e) { console.warn('[forpost_news] MineColonies не найден: ' + e); return }
  var bus = $Proxy.getInstance().getEventBus()
  function on(cls, fn) { try { bus.subscribe(Java.loadClass(cls), ev => { try { fn(ev) } catch (e) { console.error('[forpost_news] ' + cls + ': ' + e) } }) } catch (e) { console.warn('[forpost_news] нет события ' + cls + ': ' + e) } }
  var E = 'com.minecolonies.api.eventbus.events.colony.'
  on(E + 'ColonyCreatedModEvent', ev => { var c = ev.getColony(); push(server, 'colony.new', { colony: colonyName(c), player: colonyOwner(c) }) })
  on(E + 'buildings.BuildingConstructionModEvent', ev => {
    var c = ev.getColony(), b = ev.getBuilding(), wo = ev.getWorkOrder()
    var type = String(wo.getWorkOrderType()).toLowerCase() // build / upgrade / repair / remove
    push(server, 'colony.building', { colony: colonyName(c), player: colonyOwner(c), building: buildingId(b), level: wo.getTargetLevel(), kind: type })
  })
  on(E + 'citizens.CitizenAddedModEvent', ev => { var c = ev.getColony(), cit = ev.getCitizen(); push(server, 'colony.citizen_new', { colony: colonyName(c), player: colonyOwner(c), citizen: String(cit.getName()), child: !!cit.isChild(), citizens: citizens(c) }) })
  on(E + 'citizens.CitizenDiedModEvent', ev => { var c = ev.getColony(), cit = ev.getCitizen(); var src = null; try { src = String(ev.getDamageSource().getMsgId()) } catch (e) {}
    push(server, 'colony.citizen_died', { colony: colonyName(c), player: colonyOwner(c), citizen: String(cit.getName()), job: citizenJob(cit), cause: src, citizens: citizens(c) }) })
  on(E + 'citizens.CitizenJobChangedModEvent', ev => { var c = ev.getColony(), cit = ev.getCitizen(); var job = citizenJob(cit); if (!job) return
    push(server, 'colony.citizen_job', { colony: colonyName(c), player: colonyOwner(c), citizen: String(cit.getName()), job: job }) })
  on(E + 'permissions.PlayerEnteringModEvent', ev => { try { var c = ev.getColony(), pl = ev.getPlayer(); if (pl && String(pl.username) !== colonyOwner(c)) push(server, 'colony.visitor', { colony: colonyName(c), player: String(pl.username), owner: colonyOwner(c) }) } catch (e) {} })
  console.info('[forpost_news] подписка на события MineColonies включена')
}
ServerEvents.loaded(event => { STOPPING = false; subscribeColony(event.server) })

// ---- остановка сервера: записать выход всех, кто онлайн, и сбросить их активность (иначе пропадает до 30 мин игры) ----
ServerEvents.unloaded(event => {
  var s = event.server
  STOPPING = true
  try {
    var list = s.getPlayerList().getPlayers()
    for (var i = 0; i < list.size(); i++) {
      var name = String(list.get(i).username)
      var ss = SESSION[name]
      flushAct(s, name)
      push(s, 'logout', { player: name, minutes: ss ? Math.round((now() - ss.login) / 60000) : null, deaths_session: ss ? ss.deaths : null, reason: 'stop' })
      delete SESSION[name]
    }
  } catch (e) { console.error('[forpost_news] unloaded: ' + e) }
})

// ---- достижения (только те, что видны игроку: с названием и всплывашкой) ----
PlayerEvents.advancement(event => {
  try {
    var adv = event.advancement
    if (!adv || !adv.hasDisplay()) return
    var id = String(adv.id())
    if (/^minecraft:recipes\//.test(id)) return
    push(event.server, 'advancement', { player: event.player.username, adv: id, title: String(adv.getTitle().getString()) })
  } catch (e) { console.error('[forpost_news] advancement: ' + e) }
})

// ---- команды ----
ServerEvents.commandRegistry(event => {
  var Commands = event.commands, Arguments = event.arguments
  function reply(ctx, text) { ctx.source.sendSystemMessage(Text.of(text)) }
  event.register(Commands.literal('forpost_news')
    .requires(src => src.hasPermission(2))
    .then(Commands.literal('last').executes(ctx => { reply(ctx, String(load(ctx.source.server).last)); return 1 }))
    .then(Commands.literal('clear').executes(ctx => { ctx.source.server.persistentData.remove(KEY); reply(ctx, 'ok'); return 1 }))
    .then(Commands.literal('dump')
      .then(Commands.argument('from', Arguments.INTEGER.create(event))
        .executes(ctx => dump(ctx, Arguments.INTEGER.getResult(ctx, 'from'), 12))
        .then(Commands.argument('count', Arguments.INTEGER.create(event))
          .executes(ctx => dump(ctx, Arguments.INTEGER.getResult(ctx, 'from'), Arguments.INTEGER.getResult(ctx, 'count'))))))
    .then(Commands.literal('add')
      .then(Commands.argument('type', Arguments.WORD.create(event))
        .then(Commands.argument('json', Arguments.GREEDY_STRING.create(event))
          .executes(ctx => {
            var type = Arguments.WORD.getResult(ctx, 'type'), raw = Arguments.GREEDY_STRING.getResult(ctx, 'json')
            var data = {}
            try { data = JSON.parse(raw) } catch (e) { data = { text: raw } }
            // HQM command rewards подставляют @p — добавим ник, если его нет
            try { if (!data.player && ctx.source.entity && ctx.source.entity.isPlayer()) data.player = ctx.source.entity.username } catch (e) {}
            push(ctx.source.server, type, data); reply(ctx, 'ok'); return 1
          })))))
  function dump(ctx, from, count) {
    var st = load(ctx.source.server), out = []
    for (var i = 0; i < st.items.length && out.length < count; i++) if (st.items[i].id > from) out.push(JSON.stringify(st.items[i]))
    reply(ctx, out.length ? out.join('\n') : 'EMPTY')
    return 1
  }
})

})()
