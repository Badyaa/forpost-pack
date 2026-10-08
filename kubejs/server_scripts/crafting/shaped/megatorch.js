ServerEvents.recipes(event => {
    event.shaped('torchmaster:megatorch', [
        "ETC",
        "TLT",
        "TLT"
    ], {
        T: "torchmaster:feral_flare_lantern",
        L: "#minecraft:logs",
        C: Item.of('minecraft:potion', '{Potion:"minecraft:regeneration"}').strongNBT(),
        E: Item.of('minecraft:potion', '{Potion:"minecraft:healing"}').strongNBT()
    })
});