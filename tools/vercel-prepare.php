<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Filesystem\Filesystem;

// O builder comunitário ignora requisitos Composer; esta verificação os restabelece.
if (PHP_VERSION_ID < 80512 || PHP_VERSION_ID >= 80600) {
    throw new RuntimeException('A implantação exige PHP >=8.5.12 e <8.6.');
}
foreach (['gd', 'mbstring', 'fileinfo', 'pdo_pgsql', 'openssl'] as $extension) {
    if (! extension_loaded($extension)) {
        throw new RuntimeException('Extensão PHP necessária: '.$extension);
    }
}
require __DIR__.'/../vendor/autoload.php';
// Metadados AWS de serviços não usados ocupam dezenas de MB. S3/STS são os únicos adapters utilizados.
$dataRoot = realpath(__DIR__.'/../vendor/aws/aws-sdk-php/src/data');
if ($dataRoot) {
    $filesystem = new Filesystem;
    foreach (new DirectoryIterator($dataRoot) as $entry) {
        if ($entry->isDot() || ! $entry->isDir() || in_array($entry->getFilename(), ['s3', 'sts'], true)) {
            continue;
        }
        $target = $entry->getRealPath();
        if ($target && str_starts_with($target, $dataRoot.DIRECTORY_SEPARATOR)) {
            $filesystem->remove($target);
        }
    }
}
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (Artisan::call('package:discover') !== 0) {
    throw new RuntimeException('Falha ao preparar os pacotes Laravel.');
}
