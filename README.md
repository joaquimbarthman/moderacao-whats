# Moderador para grupos do WhatsApp

Bot de moderação em Node.js com `whatsapp-web.js`, autenticação local por QR Code, anti-link, anti-spam, advertências persistentes, comandos administrativos e logs em um grupo separado.

> **Atenção:** `whatsapp-web.js` é uma solução não oficial. Automações podem violar regras do WhatsApp e trazer riscos à conta. Use uma conta adequada, teste com cuidado e mantenha `dryRun: true` até validar tudo.

## Requisitos

- Node.js 20 ou mais recente
- A conta conectada deve participar dos dois grupos
- Para apagar mensagens e remover membros, a conta conectada precisa ser administradora do grupo principal

## Instalação

```bash
npm install
```

## Configuração

Edite `config.js` e troque obrigatoriamente:

```js
grupoPrincipal: 'NOME EXATO DO GRUPO PRINCIPAL',
grupoAdm: 'NOME EXATO DO GRUPO DE ADM',
```

Os nomes diferenciam maiúsculas, espaços e acentos. Na inicialização, o bot localiza os grupos e guarda seus IDs. Se algum não existir, a moderação permanece desativada.

O projeto começa com `dryRun: true`: mensagens não são apagadas e participantes não são removidos. Somente depois de validar o funcionamento altere manualmente para `false`. Anti-Link, Anti-Spam, limite, intervalo, cooldown, prefixo e fuso horário também ficam em `config.js`. Alterações feitas pelos comandos `!antilink` e `!antispam` são persistidas em `data/settings.json`.

## Inicialização e QR Code

```bash
npm start
```

No celular, acesse **WhatsApp → Aparelhos conectados → Conectar aparelho** e escaneie o QR Code exibido. A sessão fica em `.wwebjs_auth/`, que está ignorada pelo Git. Nunca compartilhe essa pasta.

## Comandos

Comuns: `!ping`, `!status`, `!warnings @usuário`, `!help`.

Somente administradores: `!warn @usuário motivo`, `!unwarn @usuário`, `!kick @usuário motivo`, `!antilink on|off`, `!antispam on|off`, `!testelog`.

Os comandos administrativos são validados pelos IDs e atributos de participante do WhatsApp, não pelo nome exibido. Como a própria conta é o cliente, comandos enviados por ela são processados via `message_create`; mensagens duplicadas são descartadas.

## Dados, testes e segurança

- Advertências: `data/warnings.json`
- Configuração dinâmica: `data/settings.json`
- Testes: `npm test`
- Checagem de sintaxe: `npm run check`

Os arquivos JSON usam escrita temporária seguida de renomeação. O anti-spam mantém apenas estado temporário em memória e faz limpeza periódica. Testes automatizados nunca conectam ao WhatsApp nem removem pessoas.
