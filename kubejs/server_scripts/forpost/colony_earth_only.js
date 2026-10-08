// Форпост / T4L0S — колония MineColonies только на Земле.
// На Талосе (minecraft:overworld) нельзя поставить ратушу и лагерь/корабль снабжения:
// Земля — единственное место, где можно возродить колонию.
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS). event.cancel() — последним.
;(function () {
var TALOS = 'minecraft:overworld'
var MSG = '§cНа Талосе колонию не основать. Сигнал маяка ведёт на Землю — постройте ракету (глава «Курс на Землю»).'
var COLONY_BLOCKS = ['minecolonies:blockhuttownhall']
var COLONY_ITEMS = ['minecolonies:supplycampdeployer', 'minecolonies:supplychestdeployer']
function dimId(level) { var s = String(level.dimension); var m = s.match(/([a-z0-9_.-]+:[a-z0-9_.\/-]+)\]?$/); return m ? m[1] : s }

BlockEvents.placed(event => {
  if (!event.entity || !event.entity.isPlayer()) return
  if (dimId(event.level) !== TALOS) return
  if (!COLONY_BLOCKS.includes(String(event.block.id))) return
  event.entity.tell(MSG)
  event.cancel()
})

ItemEvents.rightClicked(event => {
  if (dimId(event.level) !== TALOS) return
  if (!COLONY_ITEMS.includes(String(event.item.id))) return
  event.player.tell(MSG)
  event.cancel()
})
})()
