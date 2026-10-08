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
  event.replaceInput(
    { id: 'thermal:machine_insolator' },
    'thermal:lumium_gear',
    'simplyjetpacks:unit_glowstone'
  )
});