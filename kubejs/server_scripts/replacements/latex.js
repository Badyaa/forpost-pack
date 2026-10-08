ServerEvents.recipes(event => {
    event.replaceInput(
        { input: Fluid.of('industrialforegoing:latex') },
        Fluid.of('industrialforegoing:latex'),
        Fluid.of('pneumaticcraft:plastic')
    )

    /*event.replaceInput(
        { input: Fluid.of('industrialforegoing:latex') },
        Fluid.of('industrialforegoing:latex'),
        Fluid.of('pneumaticcraft:plastic')
    )*/

    event.forEachRecipe({ type: 'industrialforegoing:dissolution_chamber' }, recipe => {
        const inputFluidString = recipe.json.get('inputFluid').asString;
        if (inputFluidString.includes('industrialforegoing:latex')) {
            recipe.json.remove('inputFluid');
            recipe.json.addProperty('inputFluid', inputFluidString.replace('industrialforegoing:latex', 'pneumaticcraft:plastic'));
        }
    });
});
