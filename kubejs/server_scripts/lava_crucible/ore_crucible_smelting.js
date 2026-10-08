ServerEvents.recipes(event => {

    function ore_smelting(input, output, output_amount) {
        event.custom({
            type: 'exdeorum:lava_crucible',
            fluid: {
                amount: output_amount,
                fluid: output
            },
            ingredient: Ingredient.of(input).toJson()
        })
    }

    ore_smelting('#forge:ores/iron', 'tconstruct:molten_iron', 120)
    ore_smelting('#forge:ores/copper', 'tconstruct:molten_copper', 360)
    ore_smelting('#forge:ores/gold', 'tconstruct:molten_gold', 120)
    ore_smelting('#forge:ores/zinc', 'tconstruct:molten_zinc', 120)
    ore_smelting('#forge:ores/osmium', 'tconstruct:molten_osmium', 120)
    ore_smelting('#forge:ores/silver', 'tconstruct:molten_silver', 120)
    ore_smelting('#forge:ores/tin', 'tconstruct:molten_tin', 120)
    ore_smelting('#forge:ores/lead', 'tconstruct:molten_lead', 120)
    ore_smelting('#forge:ores/nickel', 'tconstruct:molten_nickel', 120)

    ore_smelting('#forge:raw_materials/iron', 'tconstruct:molten_iron', 90)
    ore_smelting('#forge:raw_materials/copper', 'tconstruct:molten_copper', 90)
    ore_smelting('#forge:raw_materials/gold', 'tconstruct:molten_gold', 90)
    ore_smelting('#forge:raw_materials/zinc', 'tconstruct:molten_zinc', 90)
    ore_smelting('#forge:raw_materials/osmium', 'tconstruct:molten_osmium', 90)
    ore_smelting('#forge:raw_materials/silver', 'tconstruct:molten_silver', 90)
    ore_smelting('#forge:raw_materials/tin', 'tconstruct:molten_tin', 90)
    ore_smelting('#forge:raw_materials/lead', 'tconstruct:molten_lead', 90)
    ore_smelting('#forge:raw_materials/nickel', 'tconstruct:molten_nickel', 90)

    ore_smelting('#forge:dusts/iron', 'tconstruct:molten_iron', 90)
    ore_smelting('#forge:dusts/copper', 'tconstruct:molten_copper', 90)
    ore_smelting('#forge:dusts/gold', 'tconstruct:molten_gold', 90)
    ore_smelting('#forge:dusts/zinc', 'tconstruct:molten_zinc', 90)
    ore_smelting('#forge:dusts/osmium', 'tconstruct:molten_osmium', 90)
    ore_smelting('#forge:dusts/silver', 'tconstruct:molten_silver', 90)
    ore_smelting('#forge:dusts/tin', 'tconstruct:molten_tin', 90)
    ore_smelting('#forge:dusts/lead', 'tconstruct:molten_lead', 90)
    ore_smelting('#forge:dusts/nickel', 'tconstruct:molten_nickel', 90)

    ore_smelting('exdeorum:iron_ore_chunk', 'tconstruct:molten_iron', 30)
    ore_smelting('exdeorum:copper_ore_chunk', 'tconstruct:molten_copper', 90)
    ore_smelting('exdeorum:gold_ore_chunk', 'tconstruct:molten_gold', 30)
    ore_smelting('exdeorum:zinc_ore_chunk', 'tconstruct:molten_zinc', 30)
    ore_smelting('exdeorum:osmium_ore_chunk', 'tconstruct:molten_osmium', 30)
    ore_smelting('exdeorum:silver_ore_chunk', 'tconstruct:molten_silver', 30)
    ore_smelting('exdeorum:tin_ore_chunk', 'tconstruct:molten_tin', 30)
    ore_smelting('exdeorum:lead_ore_chunk', 'tconstruct:molten_lead', 30)
    ore_smelting('exdeorum:nickel_ore_chunk', 'tconstruct:molten_nickel', 30)
})