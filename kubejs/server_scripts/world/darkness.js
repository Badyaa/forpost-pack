// Armazena o último bioma conhecido do jogador
let lastBiome = {};

// Evento que é chamado a cada tick para cada jogador
PlayerEvents.tick(event => {
    let player = event.player;
    let playerId = player.id;

    // Verifica o bioma atual do jogador
    let biome = player.level.getBiome(player.blockPos).id;

    // Se o bioma atual for diferente do último bioma conhecido
    if (biome !== lastBiome[playerId]) {
        if (biome === 'minecraft:deep_dark') {
            player.tell('Você entrou no bioma deep dark.');
            console.log(`Jogador ${player.name.string} entrou no bioma deep dark.`);

            // Adiciona o efeito de darkness ao jogador
            player.addEffect('minecraft:darkness', 200, 0, false, false);
            console.log(`Efeito de darkness adicionado ao jogador ${player.name.string}.`);
        } else if (lastBiome[playerId] === 'minecraft:deep_dark') {
            player.tell('Você saiu do bioma deep dark.');
            console.log(`Jogador ${player.name.string} saiu do bioma deep dark.`);

            // Remove o efeito de darkness do jogador
            player.removeEffect('minecraft:darkness');
            console.log(`Efeito de darkness removido do jogador ${player.name.string}.`);
        }
        // Atualiza o último bioma conhecido
        lastBiome[playerId] = biome;
    }
});
