'use strict';

module.exports = {
  grupoPrincipal: 'Boys em Ação',
  grupoAdm: 'Adms do gp',
  // Opcionais: IDs terminados em @g.us. Se preenchidos, evitam client.getChats().
  grupoPrincipalId: '120363411564503083@g.us',
  grupoAdmId: '120363427348260089@g.us',
  // Somente estes números podem executar comandos administrativos.
  // Use código do país + DDD + número, apenas dígitos. Ex.: '5518999999999'.
  numerosAutorizados: ['+55 21 96827-0456', '+55 34 8441-9656', '+55 55 9211-8220', '+55 11 93930-8944', '+55 18 99668-6250'],
  prefixo: '!',
  antiLink: true,
  antiSpam: true,
  maxWarnings: 3,
  dryRun: false,
  timezone: 'America/Sao_Paulo',
  spam: {
    maxMensagens: 6,
    intervalo: 5000,
    cooldown: 10000,
    limpezaIntervalo: 60000
  }
};
