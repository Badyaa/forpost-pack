// Форпост / T4L0S — бинт для Revive Me!
// Дизайн-документ, «Система жизней», ступень 1: предмет лечения ускоряет подъём до 2 секунд.
StartupEvents.registry('item', event => {
  event.create('kubejs:bandage')
    .displayName('Бинт')
    .maxStackSize(16)
    .texture('kubejs:item/bandage')
    .tooltip('Поднимает упавшего товарища за 2 секунды')
})
