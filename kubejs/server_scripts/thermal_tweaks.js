;(function(){ // 09.10: файл обёрнут в IIFE (правило Rhino)
ServerEvents.recipes(event => {
  event.replaceInput(
    { id: 'thermal:machine_crucible' },
    '#forge:glass',
    '#thermal:glass/hardened'
  )

  event.replaceInput(
    { id: 'thermal:machine_insolator' },
    '#forge:glass',
    '#thermal:glass/hardened'
  )
  // 09.10: замена lumium_gear -> simplyjetpacks:unit_glowstone отключена. Все рецепты Simply Jetpacks удалены
  // (removed_recipes.js: remove({mod:'simplyjetpacks'}) — в т.ч. unit_glowstone_empty и бутылирование unit_glowstone),
  // лут-таблиц у мода нет, в скриптах/квестах/датапаках предмета нет -> инсолятор был некрафтабелен.
  // Возвращён штатный ингредиент Thermal: #forge:gears/lumium (люмиевая шестерня — пресс Thermal из
  // люмиевого слитка; слиток — смешивание Create: олово+серебро+светопыль, create/thermal_mixing_compat.js).
  // event.replaceInput(
  //   { id: 'thermal:machine_insolator' },
  //   'thermal:lumium_gear',
  //   'simplyjetpacks:unit_glowstone'
  // )
});
})()
