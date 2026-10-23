# Terceira revisão — correções entregues

Data: 23/10/2026.

## Os oito pontos

1. **Login no celular:** removido o bloqueio de rolagem. O formulário aparece antes do bloco editorial em telas menores, inputs usam tamanho adequado ao celular e as animações respeitam movimento reduzido. O campo de nome oculto não recebe foco no modo entrar.
2. **Proteção das tentativas de acesso:** o limite e os logs usam o IP da conexão. `X-Forwarded-For` só é aceito de proxies com IP explicitamente configurado em `TRUSTED_PROXIES`, percorrendo a cadeia a partir do proxy mais próximo.
3. **Reembolsos consistentes:** a verificação de pendência e a alteração de compra/reembolso acontecem na mesma operação serializada, com journal para concluir a gravação após falha/reinício. Repetir a mesma decisão é idempotente; uma decisão contrária à já processada recebe 409. A aprovação exige uma compra em estado compatível.
4. **QR Code privado:** biblioteca incluída em `public/js/vendor/`, geração em canvas local e remoção do serviço externo de contingência. Se a geração falhar, a tela orienta copiar o link e mantém o download desabilitado.
5. **Retomada de rascunhos:** o criador encontra a cópia interrompida ao reabrir, inclusive pela identificação do pedido no servidor. Oferece retomar ou descartar a cópia local; mantém texto, tema, arquivos, referências de mídia e etapa. A cópia local interrompida tem precedência sobre o conteúdo mais antigo do servidor. A confirmação de envio continua limpando a cópia pendente.
6. **Sinopse Netflix:** formulário e servidor aceitam 600 caracteres. Os outros temas mantêm o limite de 90. Excesso retorna erro explícito em vez de cortar o texto silenciosamente.
7. **Uploads válidos:** o servidor detecta o tipo pelos bytes, compara com o declarado e decodifica imagens com limite de 40 megapixels. Áudio e vídeo passam por inspeção local com FFprobe para verificar a existência de faixas compatíveis. Arquivos inválidos são rejeitados e removidos do armazenamento temporário do upload. Isso não garante a reprodução de todo codec em todo aparelho; a compatibilidade do navegador continua aplicável.
8. **Ações do login:** links reais para Termos e Privacidade; Google/Apple desabilitados com explicação visível; nova página de recuperação de senha e endpoints de solicitação/redefinição. Tokens de uso único expiram em 30 minutos, são armazenados como hash e a redefinição encerra as sessões existentes. O token vai no fragmento do link e é retirado do endereço ao abrir a página.

## Configuração restante, conforme combinado

O usuário informou que ainda não possui SMTP e pediu a integração pronta para configurar. O fluxo e o envio com Nodemailer estão implementados; **o envio de e-mail real permanece dependente da configuração do provedor**. Sem configuração, a interface informa indisponibilidade, sem fingir que enviou um e-mail.

Configure as variáveis descritas em [server/.env.example](server/.env.example) e no [README](README.md): `PUBLIC_ORIGIN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM`. O processo lê o ambiente; `.env` não é carregado automaticamente. Não coloque credenciais no código.

O servidor agora requer **Node.js 22+**. Em outro computador, execute `npm ci` em `server/` antes de iniciar. O QR já está empacotado; `npm run build:qr` permite reconstruí-lo após atualização da biblioteca.

## Verificação

Passaram:

- `node tools/verify-theme.cjs`: 13 temas, prévia, detalhes, sintaxe, 266 referências locais, 59 rotas e quatro caminhos privados.
- `node tools/test-first-review.cjs`: persistência, falha de gravação, criação concorrente, mídia, Range, permissões, compartilhamento e demais cenários existentes. A imagem de teste antiga estava corrompida; foi substituída por PNG válido gerado localmente.
- `node tools/test-second-review.cjs`: limites, histórico e preservação do banco real durante a execução.
- `node tools/test-third-review.cjs`: cabeçalho de IP falsificado, proxies confiáveis, decisões concorrentes de reembolso, aplicação do journal após falha/reinício, sinopse de 600 caracteres, rejeição de arquivo inválido/tipo incorreto/imagem truncada, PNG/WAV válidos, recuperação com token expirado/reutilizado e invalidação de sessões, montagem SMTP sem envio real, procura de rascunho e contingência local do QR.

Conferência no navegador:

- Login em viewport 360 × 740: botão entrar termina em aproximadamente 609 px; cadastro termina em aproximadamente 683 px. Rolagem vertical disponível.
- Orientação horizontal 844 × 390: rolagem disponível, sem transbordamento horizontal do documento.
- Recuperação de rascunho real no IndexedDB: tema Netflix, destinatário, título, sinopse, foto e etapa 3 restaurados.
- Resultado em viewport 390 × 844: QR em canvas de 160 × 160, script servido pelo próprio site e nenhuma imagem de QR externa.

Não houve teste em aparelho Android/iPhone físico nem envio a um provedor SMTP real.

## Preservação do trabalho existente

Os testes que gravam dados utilizaram bancos temporários. Esta entrega não executou seed, limpeza ou migração do banco principal. Alterações em `minha-conta.html`, seu CSS e registros de compras/sessões foram detectadas na comparação durante a execução, fora das edições desta entrega, e não foram revertidas. A integração do projeto continua usando o pagamento simulado existente.
