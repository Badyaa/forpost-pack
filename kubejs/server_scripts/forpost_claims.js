// Форпост: защита баз через Open Parties and Claims (OPAC).
// «ОДИН»    → у владельца создаётся группа (party) и приватятся чанки вокруг базы: чужие ходят и смотрят,
//             но не ломают, не ставят и не открывают.
// «К другу» → игрока добавляют в группу владельца базы — у группы общий доступ ко всему.
// Вызывается из forpost_bases.js после посадки: global.forpostProtect(server, player, base).
// Если мода OPAC нет — просто пишет предупреждение в лог и ничего не делает.
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

var TALOS = 'minecraft:overworld'
var CLAIM_RADIUS = 3 // чанков от центра базы: 7×7 = 49 чанков
var MAT = '§8[MAT]§r '

var $API = null, $Rank = null
function api(server) {
  if ($API === null) {
    try {
      $API = Java.loadClass('xaero.pac.common.server.api.OpenPACServerAPI')
      $Rank = Java.loadClass('xaero.pac.common.parties.party.member.PartyMemberRank')
    } catch (e) {
      $API = false
      console.warn('[forpost_claims] Open Parties and Claims не найден — защита баз отключена (' + e + ')')
    }
  }
  return $API ? $API.get(server) : null
}

function uuidOf(player) { return player.uuid }

function claimAround(server, ownerUuid, base) {
  var cm = api(server).getServerClaimsManager()
  var dim = Utils.id(TALOS)
  var ccx = base.x >> 4, ccz = base.z >> 4
  var n = 0
  for (var dx = -CLAIM_RADIUS; dx <= CLAIM_RADIUS; dx++) for (var dz = -CLAIM_RADIUS; dz <= CLAIM_RADIUS; dz++) {
    var cx = ccx + dx, cz = ccz + dz
    var cur = cm.get(dim, cx, cz)
    if (cur && String(cur.getPlayerId()) !== String(ownerUuid)) continue // чужой чанк не трогаем
    cm.claim(dim, ownerUuid, 0, cx, cz, false)
    n++
  }
  return n
}

function ownerParty(server, player) {
  var pm = api(server).getPartyManager()
  var uuid = uuidOf(player)
  // уже состоит в чужой группе (был «к другу») — выходим из неё
  var other = pm.getPartyByMember(uuid)
  if (other && String(other.getOwner().getUUID()) !== String(uuid)) other.removeMember(uuid)
  var party = pm.getPartyByOwner(uuid)
  if (!party) party = pm.createPartyForOwner(player)
  return party
}

function protectOwn(server, player, base) {
  var A = api(server); if (!A) return
  try {
    if (!base.ownerId) base.ownerId = String(uuidOf(player))
    ownerParty(server, player)
    var n = claimAround(server, uuidOf(player), base)
    server.scheduleInTicks(320, () => {
      var p = server.getPlayerList().getPlayerByName(player.username)
      if (p) p.tell(MAT + '§7Территория базы под защитой (' + n + ' чанков): чужие видят, но не ломают, не ставят и не открывают. Друг, который прилетит к тебе, попадёт в твою группу и сможет всё. Группа: §f/openpac-parties§7, приват: §f/openpac-claims§7.')
    })
  } catch (e) { console.error('[forpost_claims] protectOwn: ' + e) }
}

function joinOwnerParty(server, player, base) {
  var A = api(server); if (!A) return
  try {
    var pm = A.getPartyManager()
    var uuid = uuidOf(player)
    var ownerUuid = base.ownerId ? Java.loadClass('java.util.UUID').fromString(base.ownerId) : null
    if (!ownerUuid) { console.warn('[forpost_claims] у базы ' + base.id + ' нет ownerId — группа не назначена'); return }
    var party = pm.getPartyByOwner(ownerUuid)
    if (!party) {
      var owner = server.getPlayerList().getPlayer(ownerUuid)
      if (!owner) { console.warn('[forpost_claims] владелец базы ' + base.id + ' офлайн и без группы — попробуем позже'); return }
      party = pm.createPartyForOwner(owner)
      claimAround(server, ownerUuid, base)
    }
    var cur = pm.getPartyByMember(uuid)
    if (cur && String(cur.getId()) === String(party.getId())) return
    if (cur) {
      if (String(cur.getOwner().getUUID()) === String(uuid)) pm.removePartyByOwner(uuid) // своя старая группа — распускаем
      else cur.removeMember(uuid)
    }
    party.addMember(uuid, $Rank.MEMBER, player.username)
    server.scheduleInTicks(320, () => {
      var p = server.getPlayerList().getPlayerByName(player.username)
      if (p) p.tell(MAT + '§7Ты в группе игрока ' + base.owner + ': на его базе можно строить и открывать всё. Чужие базы под защитой — там только смотреть.')
    })
  } catch (e) { console.error('[forpost_claims] joinOwnerParty: ' + e) }
}

global.forpostProtect = function (server, player, base) {
  if (base.owner === player.username) protectOwn(server, player, base)
  else joinOwnerParty(server, player, base)
}

})()
