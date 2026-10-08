// Форпост: дерево из саженца — ровно за 10 костной муки.
// Каждое нажатие мукой на саженец добавляет 1 к прогрессу (видно над хотбаром: «Саженец 3/10»),
// на 10-й раз дерево вырастает. Обычный случайный рост от муки отключён — результат всегда предсказуем.
// Работает для любых саженцев с тегом minecraft:saplings, в том числе из модов.
// Если дереву не хватает места или грунт не тот — прогресс сохраняется, можно расчистить место и нажать ещё раз.
// Прогресс хранится в памяти сервера (после перезапуска начинается заново).
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

var NEED = 10
var TRIES = 8
var PROGRESS = {} // "измерение|x|y|z" -> { id, n }

function grow(level, pos, startId) {
  for (var i = 0; i < TRIES; i++) {
    if (String(level.getBlock(pos).id) !== startId) return true
    var state = level.getBlockState(pos)
    var b = state.getBlock()
    if (!b.isValidBonemealTarget || !b.isValidBonemealTarget(level, pos, state, false)) return false
    b.performBonemeal(level, level.getRandom(), pos, state)
  }
  return String(level.getBlock(pos).id) !== startId
}

BlockEvents.rightClicked(event => {
  var item = event.item
  if (!item || String(item.id) !== 'minecraft:bone_meal') return
  if (String(event.hand) !== 'MAIN_HAND') return
  var block = event.block
  if (!block.hasTag('minecraft:saplings')) return
  var level = event.level
  var pos = block.pos
  var player = event.player
  // ВАЖНО: в KubeJS 6 event.cancel() сразу прерывает обработчик, поэтому отменяем ванильный рост в самом конце
  try {
    var id = String(block.id)
    var key = String(level.dimension) + '|' + pos.getX() + '|' + pos.getY() + '|' + pos.getZ()
    var p = PROGRESS[key]
    if (!p || p.id !== id) p = PROGRESS[key] = { id: id, n: 0 }
    if (p.n < NEED) { // при 10/10 мука больше не тратится — только повторная попытка вырасти
      p.n++
      if (!player.isCreative()) item.shrink(1)
    }
    level.levelEvent(1505, pos, 15) // частицы костной муки
    if (p.n < NEED) {
      player.displayClientMessage(Text.green('Саженец: ' + p.n + '/' + NEED + ' костной муки'), true)
    } else if (grow(level, pos, id)) {
      delete PROGRESS[key]
      player.displayClientMessage(Text.green('Дерево выросло!'), true)
    } else {
      player.displayClientMessage(Text.gray('Саженец готов (10/10), но дереву не хватает места или нужен другой грунт'), true)
    }
  } catch (e) {
    console.error('[forpost_bonemeal] ' + e)
  }
  event.cancel() // свой рост вместо случайного (после всей работы — cancel() завершает обработчик)
})

})()
