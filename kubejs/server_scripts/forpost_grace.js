// Форпост: «первые дни» — защита новичка от мобов.
// Первые 3 игровых дня (60 минут игры в сети) у каждого игрока:
//   Сопротивление II — получаешь на 40% меньше урона,
//   Сила I — бьёшь на 3 больше (зомби падает с 2–3 ударов даже рукой).
// Время считается только пока игрок в игре и не в «Куполе». MAT предупреждает о начале, середине и конце.
// Игрокам, которые уже играли до этого обновления, защита тоже выдаётся с полного срока.
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

var TOTAL = 3 * 24000      // 3 игровых дня в тиках = 60 минут
var STEP = 100             // проверка раз в 5 секунд
var KEY = 'forpost_grace'
var MAT = '§8[MAT]§r '

function dimId(level) {
  var s = String(level.dimension)
  var m = s.match(/([a-z0-9_.-]+:[a-z0-9_.\/-]+)\]?$/)
  return m ? m[1] : s
}

PlayerEvents.tick(event => {
  var p = event.player
  if (p.age % STEP !== 0) return
  try {
    var pd = p.persistentData
    if (!pd.getBoolean(KEY + '_init')) {
      pd.putBoolean(KEY + '_init', true)
      pd.putInt(KEY, TOTAL)
      p.tell(MAT + '§aПервые дни на Талосе: 3 игровых дня ты получаешь на 40% меньше урона и бьёшь сильнее. Обустройся, найди воду и сделай оружие.')
    }
    var left = pd.getInt(KEY)
    if (left <= 0) return
    if (dimId(p.level) === 'varkin_system:kupol' || p.isCreative() || p.isSpectator()) return
    left -= STEP
    pd.putInt(KEY, left)
    var n = p.username
    var srv = p.server
    srv.runCommandSilent('effect give ' + n + ' minecraft:resistance 8 1 true')
    srv.runCommandSilent('effect give ' + n + ' minecraft:strength 8 0 true')
    if (left === TOTAL / 2) p.tell(MAT + '§eЗащита первых дней: осталось полтора игровых дня (30 минут).')
    if (left === 6000) p.tell(MAT + '§eЗащита первых дней заканчивается через 5 минут — держи оружие и броню под рукой.')
    if (left <= 0) p.tell(MAT + '§6Защита первых дней закончилась. Дальше — по-настоящему. Удачи, переселенец.')
  } catch (e) { console.error('[forpost_grace] ' + e) }
})

// для админа: /forpost_grace <ник> <минуты> — выдать/продлить защиту
ServerEvents.commandRegistry(event => {
  var Commands = event.commands, Arguments = event.arguments
  event.register(Commands.literal('forpost_grace').requires(src => src.hasPermission(2))
    .then(Commands.argument('player', Arguments.PLAYER.create(event))
      .then(Commands.argument('minutes', Arguments.INTEGER.create(event)).executes(ctx => {
        var p = Arguments.PLAYER.getResult(ctx, 'player')
        var min = Arguments.INTEGER.getResult(ctx, 'minutes')
        p.persistentData.putBoolean(KEY + '_init', true)
        p.persistentData.putInt(KEY, Math.round(min * 1200 / STEP) * STEP)
        p.tell(MAT + '§aЗащита первых дней: ' + min + ' мин.')
        ctx.source.sendSuccess(() => Text.of('Защита ' + p.username + ': ' + min + ' мин.'), false)
        return 1
      }))))
})

})()
