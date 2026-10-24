<?php

return [
    'indexing_enabled' => env('SEO_INDEXING_ENABLED', env('APP_ENV') === 'production') && env('VERCEL_ENV') !== 'preview',
    'allow_gptbot_training' => env('SEO_ALLOW_GPTBOT_TRAINING', false),
    'site_name' => 'Nosso Amor',
    'pages' => [
        '/home.html' => ['title' => 'Nosso Amor — Presentes digitais personalizados', 'description' => 'Crie um presente digital com fotos, vídeos, música e mensagens. Escolha entre 13 temas e compartilhe sua história por link ou QR Code.'],
        '/criar.html' => ['title' => 'Criar presente digital — Nosso Amor', 'description' => 'Personalize seu presente digital: escolha um tema, adicione fotos, vídeos, música e mensagens e confira a prévia antes de compartilhar.'],
        '/termos.html' => ['title' => 'Termos de Uso — Nosso Amor', 'description' => 'Conheça as condições de uso do Nosso Amor, as responsabilidades da conta e as regras dos presentes digitais.'],
        '/privacidade.html' => ['title' => 'Política de Privacidade — Nosso Amor', 'description' => 'Saiba como o Nosso Amor trata dados pessoais, armazena mídias e permite exportar dados ou solicitar a exclusão da conta.'],
        '/reembolso.html' => ['title' => 'Política de Reembolso — Nosso Amor', 'description' => 'Consulte a política de reembolso do Nosso Amor e as orientações para solicitar atendimento sobre seu presente digital.'],
    ],
    'utility_pages' => [
        '/index.html' => ['title' => 'Nosso Amor — Presentes digitais', 'description' => 'Acesse a página inicial do Nosso Amor e conheça os temas de presentes digitais.'],
        '/login.html' => ['title' => 'Entrar ou criar conta — Nosso Amor', 'description' => 'Entre na sua conta Nosso Amor para salvar e gerenciar seus presentes digitais ou crie uma conta com seu e-mail.'],
        '/recuperar-senha.html' => ['title' => 'Recuperar senha — Nosso Amor', 'description' => 'Solicite a recuperação de acesso à sua conta Nosso Amor usando o e-mail cadastrado.'],
    ],
    'restricted_paths' => ['/admin/', '/api/', '/minha-conta.html', '/pagamento.html', '/resultado.html', '/ver.html', '/reset-password/'],
    'restricted_pages' => [
        '/minha-conta.html' => ['title' => 'Minha conta — Nosso Amor', 'description' => 'Gerencie seus presentes, dados e preferências na área reservada da sua conta Nosso Amor.'],
        '/pagamento.html' => ['title' => 'Pagamento do presente — Nosso Amor', 'description' => 'Confira os dados do seu pedido na área reservada de pagamento do Nosso Amor.'],
        '/resultado.html' => ['title' => 'Seu presente digital — Nosso Amor', 'description' => 'Acesse o resultado do seu presente e as opções de compartilhamento da sua conta Nosso Amor.'],
        '/ver.html' => ['title' => 'Um presente especial — Nosso Amor', 'description' => 'Abra o presente digital que foi compartilhado com você pelo Nosso Amor.'],
        '/admin/login.html' => ['title' => 'Acesso administrativo — Nosso Amor', 'description' => 'Acesso restrito à administração do Nosso Amor.'],
        '/admin/dashboard.html' => ['title' => 'Painel administrativo — Nosso Amor', 'description' => 'Painel de administração do Nosso Amor. Acesso restrito a administradores.'],
        '/admin/clientes.html' => ['title' => 'Clientes — Administração Nosso Amor', 'description' => 'Área administrativa restrita para atendimento de clientes do Nosso Amor.'],
        '/admin/reembolsos.html' => ['title' => 'Reembolsos — Administração Nosso Amor', 'description' => 'Área administrativa restrita de solicitações de reembolso do Nosso Amor.'],
        '/admin/suporte.html' => ['title' => 'Suporte — Administração Nosso Amor', 'description' => 'Área administrativa restrita para suporte do Nosso Amor.'],
    ],
];
