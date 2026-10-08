ServerEvents.recipes(event => {
    // specific item replacements (alloy ingot/nugget/block replacements are handled in config/almostunified/unify.json)
    event.replaceInput({ input: 'enderio:z_logic_controller' }, 'enderio:z_logic_controller', 'pneumaticcraft:printed_circuit_board');

    event.replaceInput({ input: 'enderio:withering_powder' }, 'enderio:withering_powder', '#forge:wither_bones');

    event.replaceInput({ input: '#enderio:clear_glass' }, '#enderio:clear_glass', '#forge:glass');
    event.replaceInput({ input: '#enderio:fused_quartz' }, '#enderio:fused_quartz', '#thermal:glass/hardened');

    event.replaceInput({ input: 'enderio:stone_gear' }, 'enderio:stone_gear', '#forge:gears/iron');
    event.replaceInput({ input: '#forge:gears/energized' }, '#forge:gears/energized', '#forge:gears/lumium');
    event.replaceInput({ input: '#forge:gears/vibrant' }, '#forge:gears/vibrant', '#forge:gears/enderium');
    event.replaceInput({ input: '#forge:gears/dark_steel' }, '#forge:gears/dark_steel', '#forge:gears/steel');

    // removes all recipes of the following types
    [
        'enderio:alloy_smelting',
        'enderio:sag_milling',
        'enderio:slicing',
        'enderio:soul_binding'
    ].forEach(type => {
        event.remove({ type: type });
    });

    // remove all recipes with the following items in the input or output
    [
        'enderio:infinity_rod',
        'enderio:zombie_electrode',
        'enderio:frank_n_zombie',
        'enderio:ender_resonator',
        'enderio:sentient_ender',
        'enderio:skeletal_contractor',
        'enderio:guardian_diode',
        'enderio:enticing_crystal',
        'enderio:weather_crystal',
        'enderio:prescient_crystal',
        'enderio:prescient_powder',
        'enderio:vibrant_powder',
        'enderio:pulsating_powder',
        'enderio:ender_crystal_powder',
        'enderio:photovoltaic_composite',
        'enderio:soul_powder',
        'enderio:confusing_powder',
        'enderio:withering_powder',
        'enderio:photovoltaic_plate',
        'enderio:nutritious_stick',
        'enderio:plant_matter_green',
        'enderio:plant_matter_brown',
        'enderio:glider_wing',
        'enderio:animal_token',
        'enderio:monster_token',
        'enderio:player_token',
        'enderio:cake_base',
        'enderio:clayed_glowstone',
        'enderio:nethercotta',
        'enderio:soul_chain',
        'enderio:soularium_grinding_ball',
        'enderio:conductive_alloy_grinding_ball',
        'enderio:pulsating_alloy_grinding_ball',
        'enderio:redstone_alloy_grinding_ball',
        'enderio:energetic_alloy_grinding_ball',
        'enderio:vibrant_alloy_grinding_ball',
        'enderio:copper_alloy_grinding_ball',
        'enderio:dark_steel_grinding_ball',
        'enderio:end_steel_grinding_ball',
        'enderio:nutrient_distillation_bucket',
        'enderio:dew_of_the_void_bucket',
        'enderio:vapor_of_levity_bucket',
        'enderio:hootch_bucket',
        'enderio:rocket_fuel_bucket',
        'enderio:fire_water_bucket',
        'enderio:liquid_sunshine_bucket',
        'enderio:cloud_seed_bucket',
        'enderio:cloud_seed_concentrated_bucket',
        'enderio:staff_of_levity',
        'enderio:cold_fire_igniter',
        'enderio:dark_steel_sword',
        'enderio:end_steel_bars',
        'enderio:soularium_pressure_plate',
        'enderio:silent_soularium_pressure_plate',
        'enderio:light',
        'enderio:light_inverted',
        'enderio:powered_light',
        'enderio:powered_light_inverted',
        'enderio:powered_light_wireless',
        'enderio:powered_light_inverted_wireless',
        'enderio:industrial_insulation_block',
        'enderio:fluid_tank',
        'enderio:pressurized_fluid_tank',
        'enderio:primitive_alloy_smelter',
        'enderio:alloy_smelter',
        'enderio:stirling_generator',
        'enderio:sag_mill',
        'enderio:slice_and_splice',
        'enderio:soul_binder',
        'enderio:powered_spawner',
        'enderio:energetic_photovoltaic_module',
        'enderio:pulsating_photovoltaic_module',
        'enderio:vibrant_photovoltaic_module',
        'enderio:basic_capacitor_bank',
        'enderio:advanced_capacitor_bank',
        'enderio:vibrant_capacitor_bank',
        'enderio:soul_engine',
        'enderio:aversion_obelisk',
        'enderio:broken_spawner'
    ].forEach(itemId => {
        event.remove({ input: itemId });
        event.remove({ output: itemId });
    });

    // remove all recipes with the following items in the output only
    [
        'enderio:enderios',
        
        'enderio:grains_of_infinity',
        'enderio:z_logic_controller',
        'enderio:wood_gear',
        'enderio:stone_gear',
        'enderio:iron_gear',
        'enderio:energized_gear',
        'enderio:vibrant_gear',
        'enderio:dark_bimetal_gear',
        'enderio:void_chassis',
        'enderio:ensouled_chassis',
        'enderio:organic_green_dye',
        'enderio:organic_brown_dye',
        'enderio:organic_black_dye',

        '#enderio:clear_glass',
        '#enderio:clear_glass_p',
        '#enderio:clear_glass_np',
        '#enderio:clear_glass_m',
        '#enderio:clear_glass_nm',
        '#enderio:clear_glass_a',
        '#enderio:clear_glass_na',
        '#enderio:clear_glass_d',
        '#enderio:clear_glass_dp',
        '#enderio:clear_glass_dnp',
        '#enderio:clear_glass_dm',
        '#enderio:clear_glass_dnm',
        '#enderio:clear_glass_da',
        '#enderio:clear_glass_dna',
        '#enderio:clear_glass_e',
        '#enderio:clear_glass_ep',
        '#enderio:clear_glass_enp',
        '#enderio:clear_glass_em',
        '#enderio:clear_glass_enm',
        '#enderio:clear_glass_ea',
        '#enderio:clear_glass_ena',

        '#enderio:fused_quartz',
        '#enderio:fused_quartz_p',
        '#enderio:fused_quartz_np',
        '#enderio:fused_quartz_m',
        '#enderio:fused_quartz_nm',
        '#enderio:fused_quartz_a',
        '#enderio:fused_quartz_na',
        '#enderio:fused_quartz_d',
        '#enderio:fused_quartz_dp',
        '#enderio:fused_quartz_dnp',
        '#enderio:fused_quartz_dm',
        '#enderio:fused_quartz_dnm',
        '#enderio:fused_quartz_da',
        '#enderio:fused_quartz_dna',
        '#enderio:fused_quartz_e',
        '#enderio:fused_quartz_ep',
        '#enderio:fused_quartz_enp',
        '#enderio:fused_quartz_em',
        '#enderio:fused_quartz_enm',
        '#enderio:fused_quartz_ea',
        '#enderio:fused_quartz_ena'
    ].forEach(itemId => {
        event.remove({ output: itemId });
    });



    // Individual recipe overrides

    event.remove({ output: 'enderio:ender_crystal' });
    event.shaped(
        Item.of('enderio:ender_crystal', 1),
        [
            ' A ',
            'BCB',
            ' A '
        ],
        {
            A: 'enderio:pulsating_crystal',
            B: 'enderio:vibrant_crystal',
            C: 'tconstruct:ender_slime_crystal'
        }
    )

    event.remove({ output: 'enderio:basic_capacitor' });
    event.shaped(
        Item.of('enderio:basic_capacitor', 1),
        [
            ' GR',
            'GCG',
            'RG '
        ],
        {
            C: 'minecraft:copper_ingot',
            G: 'minecraft:gold_nugget',
            R: 'minecraft:redstone'
        }
    )

    event.remove({ output: 'enderio:xp_obelisk' });
    event.shaped(
        Item.of('enderio:xp_obelisk', 1),
        [
            ' E ',
            ' I ',
            'IMI'
        ],
        {
            E: 'enderio:experience_rod',
            I: '#forge:ingots/invar',
            M: 'thermal:machine_frame'
        }
    )

    event.remove({ output: 'enderio:empty_soul_vial' });
    event.shaped(
        Item.of('enderio:empty_soul_vial', 1),
        [
            ' E ',
            'G G',
            ' G '
        ],
        {
            E: '#forge:ingots/enderium',
            G: 'tconstruct:soul_glass'
        }
    )

    event.remove({ output: 'enderio:reinforced_obsidian_block' });
    event.shaped(
        Item.of('enderio:reinforced_obsidian_block', 1),
        [
            'BBB',
            'BOB',
            'BBB'
        ],
        {
            B: 'enderio:dark_steel_bars',
            O: '#forge:obsidian'
        }
    )

    // Conduit recipe overrides

    event.remove({ output: 'enderio:item_conduit' });
    event.shaped(
        Item.of('enderio:item_conduit', 8),
        [
            'BBB',
            'IEI',
            'BBB'
        ],
        {
            B: 'enderio:conduit_binder',
            E: '#forge:ender_pearls',
            I: '#forge:nuggets/iron'
        }
    )
    event.shaped(
        Item.of('enderio:item_conduit', 8),
        [
            'BBB',
            'ICI',
            'BBB'
        ],
        {
            B: 'enderio:conduit_binder',
            C: 'enderio:item_conduit',
            I: '#forge:nuggets/iron'
        }
    )

    event.remove({ output: 'enderio:energy_conduit' });
    event.shaped(
        Item.of('enderio:energy_conduit', 8),
        [
            'BBB',
            'RGR',
            'BBB'
        ],
        {
            B: 'enderio:conduit_binder',
            G: '#forge:ingots/conductive',
            R: '#forge:dusts/redstone'
        }
    )

    event.remove({ output: 'enderio:redstone_conduit' });
    event.shaped(
        Item.of('enderio:redstone_conduit', 8),
        [
            'BBB',
            'rRr',
            'BBB'
        ],
        {
            B: 'enderio:conduit_binder',
            r: '#forge:dusts/redstone',
            R: '#forge:storage_blocks/redstone'
        }
    )

    event.shaped(
        Item.of('enderio:ender_fluid_conduit', 8),
        [
            'BBB',
            'GGG',
            'BBB'
        ],
        {
            B: 'enderio:conduit_binder',
            G: 'thermal:enderium_glass'
        }
    )
});