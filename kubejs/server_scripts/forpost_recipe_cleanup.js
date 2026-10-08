// Форпост: убираем рецепты, которые при каждом старте падают с ошибкой в логе KubeJS.
// Все три — чужие баги, игрокам эти рецепты не нужны.
ServerEvents.recipes(event => {
  // Tinkers' Delight требует предмет из мода tinkers_thinking, которого в сборке нет
  event.remove({ id: 'tinkers_delight:vegetarian_tossed_noodles' })
  // Thermal считает свой же compat-рецепт с Tinkers невалидным (лавовое дерево делается в литейной)
  event.remove({ id: 'thermal:compat/tconstruct/bottler_tconstruct_lavawood' })
  // Sophisticated Storage: конверсия из сундуков Quark, а сундуки Quark в сборке выключены
  event.remove({ id: /^sophisticatedstorage:.*_from_quark_.*/ })
})
