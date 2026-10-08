// Форпост: пауза жажды (Thirst Was Taken) на время «Купола» и катсцены посадки.
// global.forpostThirstPause(player, paused, refill) — остановить/вернуть тик жажды; refill — наполнить шкалу.
// global.forpostThirstFill(player) — просто наполнить шкалу (стартовый набор, посадка).
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {
var $Caps = null
function cap(player) {
  if ($Caps === null) { try { $Caps = Java.loadClass('dev.ghen.thirst.foundation.common.capability.ModCapabilities') } catch (e) { $Caps = false; console.warn('[forpost_thirst] Thirst Was Taken не найден: ' + e) } }
  if (!$Caps) return null
  try { return player.getCapability($Caps.PLAYER_THIRST).orElse(null) } catch (e) { return null }
}
function fill(c, player) { c.setThirst(20); c.setQuenched(5); c.setExhaustion(0); c.updateThirstData(player) }
global.forpostThirstPause = function (player, paused, refill) {
  var c = cap(player); if (!c) return
  try {
    c.setShouldTickThirst(!paused)
    if (refill) fill(c, player); else c.updateThirstData(player)
  } catch (e) { console.warn('[forpost_thirst] pause: ' + e) }
}
global.forpostThirstFill = function (player) {
  var c = cap(player); if (!c) return
  try { fill(c, player) } catch (e) { console.warn('[forpost_thirst] fill: ' + e) }
}
// страховка: при входе вне «Купола» и не в капсуле — тик жажды включён
PlayerEvents.loggedIn(event => {
  var pd = event.player.persistentData
  if (pd.getBoolean('forpost_in_kupol') || pd.getBoolean('forpost_descent')) return
  var c = cap(event.player); if (!c) return
  try { if (!c.getShouldTickThirst()) { c.setShouldTickThirst(true); c.updateThirstData(event.player) } } catch (e) {}
})
})()
