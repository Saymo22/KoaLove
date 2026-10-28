<?php

return [
    'indexing_enabled' => env('SEO_INDEXING_ENABLED', env('APP_ENV') === 'production') && env('VERCEL_ENV') !== 'preview',
    'allow_gptbot_training' => env('SEO_ALLOW_GPTBOT_TRAINING', false),
    'site_name' => 'KoaLove',
    'pages' => [
        '/' => ['title' => 'KoaLove — Presentes digitais personalizados', 'description' => 'Crie um presente digital com fotos, vídeos, música e mensagens. Escolha entre 13 temas e compartilhe sua história por link ou QR Code.'],
        '/criar-presente' => ['title' => 'Criar presente digital — KoaLove', 'description' => 'Personalize seu presente digital: escolha um tema, adicione fotos, vídeos, música e mensagens e confira a prévia antes de compartilhar.'],
        '/termos-de-uso' => ['title' => 'Termos de Uso — KoaLove', 'description' => 'Conheça as condições de uso do KoaLove, as responsabilidades da conta e as regras dos presentes digitais.'],
        '/politica-de-privacidade' => ['title' => 'Política de Privacidade — KoaLove', 'description' => 'Saiba como o KoaLove trata dados pessoais, armazena mídias e permite exportar dados ou solicitar a exclusão da conta.'],
        '/politica-de-reembolso' => ['title' => 'Política de Reembolso — KoaLove', 'description' => 'Consulte a política de reembolso do KoaLove e as orientações para solicitar atendimento sobre seu presente digital.'],
    ],
    'utility_pages' => [
        '/entrar' => ['title' => 'Entrar ou criar conta — KoaLove', 'description' => 'Entre na sua conta KoaLove para salvar e gerenciar seus presentes digitais ou crie uma conta com seu e-mail.'],
        '/recuperar-senha' => ['title' => 'Recuperar senha — KoaLove', 'description' => 'Solicite a recuperação de acesso à sua conta KoaLove usando o e-mail cadastrado.'],
    ],
    'restricted_paths' => ['/admin/', '/api/', '/minha-conta', '/pagamento', '/resultado', '/presente', '/reset-password/'],
    'restricted_pages' => [
        '/admin/planos' => ['title' => 'Planos e descontos — Administração KoaLove', 'description' => 'Área administrativa restrita para gerenciar planos, promoções e cupons.'],
        '/minha-conta' => ['title' => 'Minha conta — KoaLove', 'description' => 'Gerencie seus presentes, dados e preferências na área reservada da sua conta KoaLove.'],
        '/pagamento' => ['title' => 'Pagamento do presente — KoaLove', 'description' => 'Confira os dados do seu pedido na área reservada de pagamento do KoaLove.'],
        '/resultado' => ['title' => 'Seu presente digital — KoaLove', 'description' => 'Acesse o resultado do seu presente e as opções de compartilhamento da sua conta KoaLove.'],
        '/presente' => ['title' => 'Um presente especial — KoaLove', 'description' => 'Abra o presente digital que foi compartilhado com você pelo KoaLove.'],
        '/admin/entrar' => ['title' => 'Acesso administrativo — KoaLove', 'description' => 'Acesso restrito à administração do KoaLove.'],
        '/admin/painel' => ['title' => 'Painel administrativo — KoaLove', 'description' => 'Painel de administração do KoaLove. Acesso restrito a administradores.'],
        '/admin/clientes' => ['title' => 'Clientes — Administração KoaLove', 'description' => 'Área administrativa restrita para atendimento de clientes do KoaLove.'],
        '/admin/reembolsos' => ['title' => 'Reembolsos — Administração KoaLove', 'description' => 'Área administrativa restrita de solicitações de reembolso do KoaLove.'],
        '/admin/suporte' => ['title' => 'Suporte — Administração KoaLove', 'description' => 'Área administrativa restrita para suporte do KoaLove.'],
    ],
];
