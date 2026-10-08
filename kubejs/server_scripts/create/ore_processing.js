ServerEvents.recipes(event => {
	const ore_processing = function (ore, crushed_raw_ore, dust, ingot, duration, out_1_mill_amount, out_2_mill_chance, out_1_crush_amount, out_2_crush_chance) {

		if (ore && crushed_raw_ore) {
			event.remove({ type: 'create:crushing', input: ore });

			event.custom({
				"type": "create:milling",
				"ingredients": [ore],
				"processingTime": duration,
				"results": [
					{ "count": out_1_mill_amount, "item": crushed_raw_ore },
					{ "chance": out_2_mill_chance, "item": crushed_raw_ore }
				]
			});

			event.custom({
				"type": "create:crushing",
				"ingredients": [ore],
				"processingTime": duration,
				"results": [
					{ "count": out_1_crush_amount, "item": crushed_raw_ore },
					{ "chance": out_2_crush_chance, "item": crushed_raw_ore },
					{ "chance": 0.75, "item": "create:experience_nugget" }
				]
			});
		}

		if (dust) {
			if (crushed_raw_ore) {
				event.custom({
					"type": "create:milling",
					"ingredients": [crushed_raw_ore],
					"processingTime": duration,
					"results": [
						dust
					]
				});

				/*event.custom({
					"type": "create:crushing",
					"ingredients": [ crushed_raw_ore ],
					"processingTime": duration,
					"results": [
						dust
					]
				});*/
			}

			if (ingot) {
				event.custom({
					"type": "create:milling",
					"ingredients": [ingot],
					"processingTime": duration,
					"results": [
						dust
					]
				});

				/*event.custom({
					"type": "create:crushing",
					"ingredients": [ ingot ],
					"processingTime": duration,
					"results": [
						dust
					]
				});*/
			}
		}
	};

	ore_processing('#forge:ores/iron', 'create:crushed_raw_iron', 'thermal:iron_dust', '#forge:ingots/iron', 250, 1, 0.25, 1, 0.75);
	ore_processing('#forge:ores/copper', 'create:crushed_raw_copper', 'thermal:copper_dust', '#forge:ingots/copper', 250, 3, 0.75, 5, 0.25);
	ore_processing('#forge:ores/gold', 'create:crushed_raw_gold', 'thermal:gold_dust', '#forge:ingots/gold', 250, 1, 0.25, 1, 0.75);
	ore_processing('#forge:ores/zinc', 'create:crushed_raw_zinc', '', '#forge:ingots/zinc', 250, 1, 0.25, 1, 0.75);
	ore_processing('#forge:ores/osmium', 'create:crushed_raw_osmium', 'mekanism:dust_osmium', '#forge:ingots/osmium', 250, 1, 0.25, 1, 0.75);
	ore_processing('#forge:ores/silver', 'create:crushed_raw_silver', 'thermal:silver_dust', '#forge:ingots/silver', 250, 1, 0.25, 1, 0.75);
	ore_processing('#forge:ores/tin', 'create:crushed_raw_tin', 'thermal:tin_dust', '#forge:ingots/tin', 250, 1, 0.25, 1, 0.75);
	ore_processing('#forge:ores/lead', 'create:crushed_raw_lead', 'thermal:lead_dust', '#forge:ingots/lead', 250, 1, 0.25, 1, 0.75);
	ore_processing('#forge:ores/uranium', 'create:crushed_raw_uranium', 'mekanism:dust_uranium', '#forge:ingots/uranium', 250, 1, 0.25, 1, 0.75);
	ore_processing('#forge:ores/nickel', 'create:crushed_raw_nickel', 'thermal:nickel_dust', '#forge:ingots/nickel', 250, 1, 0.25, 1, 0.75);

	ore_processing('', '', 'mekanism:dust_refined_obsidian', '#forge:ingots/refined_obsidian', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:netherite_dust', '#forge:ingots/netherite', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:steel_dust', '#forge:ingots/steel', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:rose_gold_dust', '#forge:ingots/rose_gold', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:bronze_dust', '#forge:ingots/bronze', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:electrum_dust', '#forge:ingots/electrum', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:invar_dust', '#forge:ingots/invar', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:constantan_dust', '#forge:ingots/constantan', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:signalum_dust', '#forge:ingots/signalum', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:lumium_dust', '#forge:ingots/lumium', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:enderium_dust', '#forge:ingots/enderium', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:lapis_dust', '#forge:gems/lapis', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:emerald_dust', '#forge:gems/emerald', 250, 1, 0.25, 1, 0.75);
	ore_processing('', '', 'thermal:quartz_dust', '#forge:gems/quartz', 250, 1, 0.25, 1, 0.75);
});
