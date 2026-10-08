ItemEvents.modification(event => {
  event.modify(Item.of('minecraft:potion', '{Potion:"minecraft:water"}'), item => {
    craftingRemainder: 'minecraft:glass_bottle'
  })
})