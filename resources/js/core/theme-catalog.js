// Modelos completos recebidos. Cada um mantém seu HTML, CSS e JS.
window.NA_THEME_FILES = Object.freeze(Object.fromEntries(
  ['namoro', 'casamento', 'amizade', 'familia', 'aniversario', 'carta-antiga', 'jardim', 'scrapbook', 'netflix', 'vinil', 'cinema', 'spotify', 'retro']
    .map(key => [key, 'teste/' + key + '.html'])
));
