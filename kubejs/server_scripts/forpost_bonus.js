// Форпост: «бонус» — снять все штрафы выживания с игрока.
// Жажда — полная, температура тела — норма, питание — сбалансировано, сытость и здоровье — полные,
// вредные эффекты (слабость, замедление, отравление и т. п.) — сняты, огонь — потушен.
// Команда для админа и Telegram-бота: /forpost_bonus <ник> или /forpost_bonus all
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

var MAT = '§8[MAT]§r '
var DIET_GROUPS = ['proteins', 'fruits', 'vegetables', 'grains']
var DIET_LEVEL = 0.6   // 60% — без штрафов, с небольшим плюсом
var SUGARS = 0.3

var $T = null, $Trait = null, $Thirst = null, $Harmful = null
function load() {
  if ($T !== null) return
  try { $T = Java.loadClass('com.momosoftworks.coldsweat.api.util.Temperature'); $Trait = Java.loadClass('com.momosoftworks.coldsweat.api.util.Temperature$Trait') } catch (e) { $T = false }
  try { $Thirst = Java.loadClass('dev.ghen.thirst.foundation.common.capability.ModCapabilities').PLAYER_THIRST } catch (e) { $Thirst = false }
  try { $Harmful = Java.loadClass('net.minecraft.world.effect.MobEffectCategory').HARMFUL } catch (e) { $Harmful = false }
}

function bonus(server, player) {
  load()
  var n = player.username
  var done = []
  // жажда
  try {
    if ($Thirst) {
      var cap = player.getCapability($Thirst).orElse(null)
      if (cap) { cap.setThirst(20); cap.setQuenched(5); cap.setExhaustion(0); cap.updateThirstData(player); done.push('жажда') }
    }
  } catch (e) { console.error('[forpost_bonus] thirst: ' + e) }
  // температура тела
  try { if ($T) { $T.set(player, $Trait.CORE, 0); done.push('температура') } } catch (e) { console.error('[forpost_bonus] temp: ' + e) }
  // питание (Diet)
  try {
    DIET_GROUPS.forEach(g => server.runCommandSilent('diet set ' + n + ' ' + g + ' ' + DIET_LEVEL))
    server.runCommandSilent('diet set ' + n + ' sugars ' + SUGARS)
    done.push('питание')
  } catch (e) { console.error('[forpost_bonus] diet: ' + e) }
  // вредные эффекты
  try {
    if ($Harmful) {
      var bad = []
      player.getActiveEffects().forEach(inst => { if (inst.getEffect().getCategory() === $Harmful) bad.push(inst.getEffect()) })
      bad.forEach(eff => player.removeEffect(eff))
      done.push('эффекты (' + bad.length + ')')
    }
  } catch (e) { console.error('[forpost_bonus] effects: ' + e) }
  // сытость, здоровье, огонь
  try {
    player.getFoodData().setFoodLevel(20)
    player.getFoodData().setSaturation(10)
    player.setHealth(player.getMaxHealth())
    player.setRemainingFireTicks(0)
    done.push('сытость и здоровье')
  } catch (e) { console.error('[forpost_bonus] food: ' + e) }
  server.runCommandSilent('execute as ' + n + ' at @s run playsound minecraft:entity.player.levelup master @s ~ ~ ~ 0.7 1.4')
  player.tell(MAT + '§aБонус от командования: штрафы сняты — ' + done.join(', ') + '.')
  return n + ': ' + done.join(', ')
}

ServerEvents.commandRegistry(event => {
  var Commands = event.commands, Arguments = event.arguments
  event.register(Commands.literal('forpost_bonus')
    .requires(src => src.hasPermission(2))
    .then(Commands.literal('all').executes(ctx => {
      var server = ctx.source.server
      var res = []
      server.getPlayerList().getPlayers().forEach(p => res.push(bonus(server, p)))
      var msg = res.length ? 'Бонус выдан: ' + res.join('; ') : 'Никого нет в игре'
      ctx.source.sendSuccess(() => Text.of(msg), false)
      return res.length
    }))
    .then(Commands.argument('player', Arguments.PLAYER.create(event)).executes(ctx => {
      var p = Arguments.PLAYER.getResult(ctx, 'player')
      var msg = 'Бонус выдан: ' + bonus(ctx.source.server, p)
      ctx.source.sendSuccess(() => Text.of(msg), false)
      return 1
    })))
})

global.forpostBonus = bonus

})()
