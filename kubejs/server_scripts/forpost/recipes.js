// Форпост / T4L0S — рецепты
ServerEvents.recipes(event => {
  // Бинт: 3 бумаги + 1 шерсть (дизайн-документ, «Система жизней»)
  event.shapeless('kubejs:bandage', [
    'minecraft:paper', 'minecraft:paper', 'minecraft:paper', '#minecraft:wool'
  ]).id('kubejs:forpost/bandage')

  // Weather Deflector — в эндгейм: компоненты Mekanism и AE2 (раздел «Погода»)
  event.remove({ id: 'weather2:weather_deflector' })
  event.shaped('weather2:weather_deflector', [
    'UEU',
    'SIS',
    'UEU'
  ], {
    U: 'mekanism:ultimate_control_circuit',
    E: 'ae2:engineering_processor',
    S: 'mekanism:steel_casing',
    I: 'weather2:weather_item'
  }).id('kubejs:forpost/weather_deflector')
})
