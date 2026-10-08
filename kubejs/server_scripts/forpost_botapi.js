// Форпост: служебные команды для Telegram-бота (через RCON, только для операторов).
//   /forpost_api where          — где игроки: ник|мир|x|y|z|здоровье|еда|база
//   /forpost_api bases          — все базы: id|владелец|корабль|x|z
//   /forpost_api freebase <id>  — освободить брошенную базу (корабль остаётся в мире, просто пропадает из списков)
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

function dimId(level) {
  var s = String(level.dimension)
  var m = s.match(/([a-z0-9_.-]+:[a-z0-9_.\/-]+)\]?$/)
  return m ? m[1] : s
}

function out(ctx, text) {
  ctx.source.sendSuccess(() => Text.of(text), false)
}

ServerEvents.commandRegistry(event => {
  var Commands = event.commands, Arguments = event.arguments
  event.register(Commands.literal('forpost_api').requires(src => src.hasPermission(2))
    .then(Commands.literal('where').executes(ctx => {
      var server = ctx.source.server
      var lines = []
      server.getPlayerList().getPlayers().forEach(p => {
        var base = ''
        try { var b = global.forpostPlayerBase ? global.forpostPlayerBase(server, p) : null; if (b) base = '№' + b.id + (b.owner ? ' ' + b.owner : '') } catch (e) {}
        lines.push([p.username, dimId(p.level), Math.floor(p.x), Math.floor(p.y), Math.floor(p.z),
          Math.round(p.health), p.foodData.foodLevel, base].join('|'))
      })
      out(ctx, lines.length ? lines.join('\n') : 'EMPTY')
      return lines.length
    }))
    .then(Commands.literal('bases').executes(ctx => {
      var server = ctx.source.server
      var list = global.forpostBases ? global.forpostBases(server) : []
      var lines = list.filter(b => b.owner).map(b => [b.id, b.owner, b.kind || 'old', b.sx !== undefined ? b.sx : b.x, b.sz !== undefined ? b.sz : b.z].join('|'))
      out(ctx, lines.length ? lines.join('\n') : 'EMPTY')
      return lines.length
    }))
    .then(Commands.literal('freebase').then(Commands.argument('id', Arguments.INTEGER.create(event)).executes(ctx => {
      var server = ctx.source.server
      var id = Arguments.INTEGER.getResult(ctx, 'id')
      var list = global.forpostBases ? global.forpostBases(server) : []
      var b = list.find(x => x.id === id)
      if (!b || !b.owner) { out(ctx, 'NOBASE'); return 0 }
      var was = b.owner
      b.owner = ''; b.ownerId = ''
      server.persistentData.putString('forpost_bases', JSON.stringify(list))
      if (global.forpostRefreshSigns) { try { global.forpostRefreshSigns(server) } catch (e) {} }
      console.info('[forpost_botapi] база ' + id + ' освобождена (была ' + was + ')')
      out(ctx, 'OK ' + was)
      return 1
    }))))
})

})()
