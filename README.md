# Nosso Amor

Pix e cartão usam o [Mercado Pago Checkout Pro](docs/PAYMENTS.md), com liberação após confirmação verificada do provedor. Pedidos Pix manuais existentes mantêm sua conferência pelo admin.

Crie presentes digitais com fotos, vídeos, música, cartas e uma linha do tempo. O destinatário recebe um link e um QR Code para abrir a página no celular ou computador.

O projeto oferece 13 temas: Namoro, Casamento, Amizade, Família, Aniversário, Carta Antiga, Scrapbook, Jardim Secreto, Cinema Clássico, Retrô, Netflix, Spotify e Vinil. O criador tem oito etapas e mostra a prévia do tema escolhido.

A integração [Mercado Pago Checkout Pro](docs/PAYMENTS.md) exige credenciais, webhook e ativação por ambiente. O [Pix com conferência manual](docs/PIX_MANUAL.md) continua disponível como modo alternativo e para pedidos manuais existentes. Sem um método configurado, o pagamento permanece indisponível. A simulação local não cobra cartão nem gera Pix real e continua bloqueada em produção.

## Usar localmente

Consulte [Preparação do ambiente](docs/DEVELOPMENT.md) para instalar PHP, Composer, Node.js, PostgreSQL e FFprobe. Depois de configurar, abra http://localhost:8000 e escolha **Criar meu presente**.

Suas fotos ficam privadas no servidor. Quem possui o link de um presente liberado consegue acessá-lo; compartilhe esse link com cuidado. Na página Minha Conta, é possível exportar os dados ou solicitar a exclusão da conta.

## Documentação

- [Desenvolvimento e testes](docs/DEVELOPMENT.md)
- [Implantação na Vercel](docs/VERCEL.md)
- [Banco e mídias no Supabase](docs/SUPABASE.md)
- [Pagamentos Mercado Pago](docs/PAYMENTS.md)
- [Contrato da API](docs/API.md)
- [Segurança](docs/SECURITY.md)
- [SEO, indexação e noscript](docs/SEO.md)
- [Armazenamento de fotos, vídeos e músicas](docs/MEDIA_STORAGE.md)
- [Migração dos dados antigos](docs/MIGRATION.md)
- [Instruções para agentes](AGENTS.md)

As regras de retenção, armazenamento privado e terceiros estão na página Política de Privacidade do site e em docs/SECURITY.md.
