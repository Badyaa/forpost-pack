// Форпост: одна книга квестов на игрока.
// Мод книги квестов при каждой смерти кладёт новую книгу, а старая остаётся в трупе — книги копятся.
// Раз в 2 секунды у каждого игрока остаётся ровно одна книга, лишние убираются (с сообщением MAT).
// Команды: /книга (или /questbook) — выдать книгу, если её нет.
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

var BOOK = 'hardcorequesting:quest_book'
var MAT = '§8[MAT]§r '

function isBook(st) { return st && !st.isEmpty() && String(st.id) === BOOK }

function countBooks(inv) {
  var n = 0
  for (var i = 0; i < inv.getContainerSize(); i++) { var st = inv.getItem(i); if (isBook(st)) n += st.getCount() }
  return n
}

function trim(player) {
  var inv = player.getInventory()
  var kept = false, removed = 0
  for (var i = 0; i < inv.getContainerSize(); i++) {
    var st = inv.getItem(i)
    if (!isBook(st)) continue
    var c = st.getCount()
    if (!kept) {
      kept = true
      if (c > 1) { st.shrink(c - 1); removed += c - 1 }
    } else {
      st.shrink(c); removed += c
    }
  }
  if (removed > 0) {
    inv.setChanged()
    player.tell(MAT + '§7Лишние книги квестов убраны (' + removed + '). Книга одна на игрока — прогресс в ней общий.')
  }
}

PlayerEvents.tick(event => {
  var player = event.player
  if (player.age % 40 !== 0) return
  try { if (countBooks(player.getInventory()) > 1) trim(player) } catch (e) { console.error('[forpost_questbook] ' + e) }
})

ServerEvents.commandRegistry(event => {
  var Commands = event.commands
  var give = name => event.register(Commands.literal(name).requires(src => true).executes(ctx => {
    var p = ctx.source.playerOrException
    if (countBooks(p.getInventory()) > 0) { p.tell(MAT + '§7Книга квестов уже у тебя в инвентаре.'); return 0 }
    p.give(BOOK)
    p.tell(MAT + '§aВыдана книга квестов.')
    return 1
  }))
  give('книга'); give('questbook')
})

})()
