;(function(){ // 09.10: файл обёрнут в IIFE (правило Rhino)
ServerEvents.tags('item', event => {
    event.add('minecraft:bookshelf_books', 'ae2:guide')
    // 09.10: CookingForBlockheads и RFTools в сборке нет — добавляем их книги только если мод установлен
    if (Platform.isLoaded('cookingforblockheads')) {
    event.add('minecraft:bookshelf_books', 'cookingforblockheads:recipe_book')
    event.add('minecraft:bookshelf_books', 'cookingforblockheads:crafting_book')
    }
    event.add('minecraft:bookshelf_books', 'hardcorequesting:quest_book')
    event.add('minecraft:bookshelf_books', 'hardcorequesting:enabled_quest_book')
    if (Platform.isLoaded('rftools')) event.add('minecraft:bookshelf_books', 'rftools:manual') // 09.10: см. выше
})
})()
