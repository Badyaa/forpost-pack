JEIEvents.hideItems(event => {
    [
        'ad_astra:coal_generator',
        'ad_astra:compressor',
        'ad_astra:etrionic_blast_furnace',
        // 'ad_astra:fuel_refinery',
        'ad_astra:solar_panel',
        'ad_astra:water_pump', // provides infinite water, very important to remove
    ].forEach(itemId => {
        event.hide(itemId);
    });
});