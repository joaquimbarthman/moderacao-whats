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

// Variáveis de ambiente têm prioridade, facilitando o deploy sem expor dados no Git.
if (process.env.GRUPO_PRINCIPAL) module.exports.grupoPrincipal = process.env.GRUPO_PRINCIPAL;
if (process.env.GRUPO_ADM) module.exports.grupoAdm = process.env.GRUPO_ADM;
if (process.env.GRUPO_PRINCIPAL_ID) module.exports.grupoPrincipalId = process.env.GRUPO_PRINCIPAL_ID;
if (process.env.GRUPO_ADM_ID) module.exports.grupoAdmId = process.env.GRUPO_ADM_ID;
if (process.env.NUMEROS_AUTORIZADOS) {
  module.exports.numerosAutorizados = process.env.NUMEROS_AUTORIZADOS.split(',').map((value) => value.trim()).filter(Boolean);
}
