// Форпост: починка сломанных таблиц лута (только сервер, клиентам не нужен).
// highPriorityData перекрывает любые датапаки, включая Open Loader.

ServerEvents.highPriorityData(event => {
  // 1) Сундуки лаборатории MER из Crash Landing ссылались на "MER_lab" заглавными —
  //    Minecraft такие пути не принимает, сундуки были пустыми.
  ;['common', 'rare', 'press'].forEach(kind => {
    event.addJson(`crash_landing:loot_tables/chests/mer_${kind}`, {
      type: 'minecraft:chest',
      pools: [{
        rolls: 1,
        entries: [{ type: 'minecraft:loot_table', name: `desolate_planet:chests/mer_lab/${kind}` }]
      }]
    })
  })

  // 2) Турбина АЭС: предмета kubejs:crashed_turbine_frame не существует,
  //    заменён на kubejs:crashed_turbine_wall (стенка разбитой турбины из этой же сборки).
  const count = (min, max) => [{ function: 'minecraft:set_count', count: { min: min, max: max } }]
  event.addJson('desolate_planet:loot_tables/chests/nuclear_plant/parts/turbine', {
    pools: [{
      rolls: 1,
      entries: [
        { type: 'minecraft:item', name: 'biggerreactors:turbine_rotor_blade', functions: count(2, 3), weight: 2 },
        { type: 'minecraft:item', name: 'biggerreactors:turbine_rotor_shaft', functions: count(1, 2), weight: 1 },
        { type: 'minecraft:item', name: 'biggerreactors:turbine_glass', functions: count(2, 3), weight: 3 },
        { type: 'minecraft:item', name: 'kubejs:crashed_turbine_wall', functions: count(2, 3), weight: 3 }
      ]
    }]
  })

  // 3) Сама таблица desolate_planet mer_lab/press ссылалась на "MER_lab/rare" заглавными и не загружалась
  //    (сундук пустой). Временно: редкий лут лаборатории + обычный. Точный состав вернём, когда прочитаем оригинал.
  event.addJson('desolate_planet:loot_tables/chests/mer_lab/press', {
    type: 'minecraft:chest',
    pools: [
      { rolls: 1, entries: [{ type: 'minecraft:loot_table', name: 'desolate_planet:chests/mer_lab/rare' }] },
      { rolls: 1, entries: [{ type: 'minecraft:loot_table', name: 'desolate_planet:chests/mer_lab/common' }] }
    ]
  })
})
