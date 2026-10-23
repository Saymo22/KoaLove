# Resultado das correções — primeira revisão

Foram implementadas as correções dos 14 achados da primeira revisão. Os testes passaram com dados fictícios e bancos isolados. O usuário informou que não possui backup e aceitou seguir sem as compras anteriores. A base de compras foi iniciada vazia e o bloqueio de recuperação foi retirado; os demais arquivos de dados foram preservados.

## Incidente de dados — encerrado com reinício autorizado

Durante a adaptação do armazenamento, o teste antigo tools/test-theme-persistence.cjs interceptava insert, mas a rota passou a usar transaction. A primeira execução gravou antes de load/initAll e sobrescreveu server/data/purchases.json com um pedido fictício. Não foi possível recuperar o conteúdo anterior no projeto, Git ou em outro servidor em execução.

Foi preservada a cópia resultante em .snapshots/incident-2026-10-22/purchases-after-test.json. Após a consulta sobre backup, o usuário informou que não possui cópia e que não há problema em seguir sem os registros anteriores. Não foram inventadas compras ou reconstruídos valores financeiros por suposição. Os demais arquivos do banco não foram substituídos pelo teste.

Com a aceitação do usuário, purchases.json passou a conter uma lista vazia. O aviso RECOVERY_REQUIRED.txt foi arquivado em .snapshots/incident-2026-10-22/recovery-notice-resolved.txt e retirado da pasta de dados. O servidor pode iniciar normalmente. As compras antigas não foram recuperadas. Não foi executado seed.js e os arquivos de usuários, configurações, suporte, sessões e reembolsos foram preservados. Referências históricas às compras perdidas permanecem sem vínculo; nenhum registro foi fabricado para preenchê-las.

Proteções adicionadas: gravação exige load; leituras retornam cópias; cada gravação preserva .bak; testes HTTP usam NA_DATA_DIR temporário. O mock antigo também foi corrigido para interceptar e restaurar transaction.

## Os 14 pontos

| Nº | Problema | Correção implementada |
|---|---|---|
| 1 | Destinatário precisava fazer login | Link por token aleatório; endpoint público só libera presente pago, completo e ativo. A administração por ID permanece autenticada. |
| 2 | Conteúdo e mídia só no navegador | Conteúdo completo e manifest no JSON; uploads privados no servidor; fotos, vídeos e música carregam em outro navegador. Vídeo/áudio suportam requisições Range. |
| 3 | Editar criava outro pedido | Atualização do rascunho conserva o ID; compras pagas não são editáveis. O link Voltar e editar do checkout também conserva o ID. |
| 4 | Login perdia o formulário | Antes do redirecionamento, guarda rascunho com arquivos, campos e etapa. Login usa retorno local validado; restaura o rascunho. Se o navegador não consegue guardar a cópia, mantém a página e orienta entrar em outra aba. |
| 5 | Falha parcial criava duplicatas | client_request_id por usuário, criação idempotente dentro da transação e retry usando o ID já recebido. Falha de cache após confirmação no servidor não invalida o pedido. |
| 6 | Cache contornava 401/403 | Visualizador consulta o servidor e propaga a indisponibilidade. Não usa status pago do IndexedDB para liberar conteúdo. |
| 7 | Erro travava fila e alterava memória | Transações em cópia, commit em disco antes da memória, fila recuperável, logout e respostas do suporte sem mutações fora da transação. |
| 8 | URL malformada encerrava servidor | Tratamento externo de erros, resposta 400 para URL inválida e rejeição segura de cookies malformados. |
| 9 | Foto escolhida mudava ao reordenar | IDs de mídia estáveis e referências @media:ID; IDs acompanham ordenação e remoção. Migração das referências antigas por índice na edição. |
| 10 | Editar um detalhe congelava os momentos | Coleções vinculadas usam sobreposições por campo. Alterar a imagem não congela título, texto ou data do momento. Arrays históricos são preservados como valores explícitos para não apagar personalizações antigas. |
| 11 | Motivos apagados continuavam no tema | Os cartões nativos também são ocultados quando a lista fica vazia; novos motivos voltam a ser exibidos. |
| 12 | Aniversário sem data exibia idade fictícia | Oculta número e selo de idade e contador dependente da data; recalcula e restaura ao preencher data válida. Gerador dos temas atualizado. |
| 13 | Namoro ignorava introdução/autoplay | Consome as duas preferências. Prévia pula a introdução e não tenta iniciar a música. Navegadores ainda podem exigir toque para áudio. |
| 14 | Excluir só escondia neste navegador | Exclusão autenticada no servidor, revogação do link/mídia e comprovante preservado na lista/histórico. IDs excluídos localmente pela versão anterior são sincronizados na conta correspondente. |

## Verificações realizadas

- node tools/verify-theme.cjs: 13 modelos, ponte de prévia, validação de detalhes, sintaxe JavaScript, 251 referências locais, 59 rotas e bloqueio de 4 caminhos privados. Inclui testes de foto estável, coleções por campo, fluxo de oito etapas, retorno seguro do login e retry com falha de cache.
- node tools/test-first-review.cjs: servidor real e banco temporário, duas contas fictícias; idempotência concorrente, atualização dos 13 temas, persistência após reinício, upload, leitura anônima, permissões 401/403, conteúdo completo, Range, bloqueio após reembolso/exclusão, recibo e logout. Também injeta falha em disco para testar recuperação da fila e memória consistente.
- Navegador: formulário em iframe de 390 × 844; preenchimento, foto e legenda; salvamento sem sessão; retorno do login com etapa 8, campos e arquivo preservados; edição mantém o ID; pagamento simulado; resultado completo; encerramento de sessão e abertura do link público.
- Navegador: Casamento com motivos preenchidos e depois apagados; Aniversário sem data, com data e sem data novamente. Motivos visíveis ficaram em zero e idade foi ocultada/restaurada corretamente.
- Servidores temporários encerrados e arquivos públicos de teste removidos.

A validação em 390 pixels usa o navegador do ambiente. Não equivale a teste físico em Android ou iPhone, nem substitui a segunda revisão de responsividade.

## Documentação e limites

README.md e server/docs/PURCHASES.md descrevem as rotas e o armazenamento atuais. Fotos até 15 MB, vídeos até 100 MB e música até 25 MB; máximo de 300 MB por presente. Suporte aos formatos declarados não garante compatibilidade de todo codec em todos os celulares. Checkout permanece simulado.

Os achados adicionais da segunda revisão continuam para a próxima etapa. Ao tocar os cards da conta para ajustar compartilhamento/exclusão, seus textos de título e destinatário também passaram a ser escapados na renderização HTML.

Alterações anteriores do usuário em login, formulário, estilos e temas foram mantidas. Não foi criado commit nem feita publicação.

Atualização posterior: os dez achados adicionais da segunda revisão foram tratados. Consulte REVISAO-2-RESULTADO.md para os resultados e limites da validação.
