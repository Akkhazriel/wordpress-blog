const config = {
    // Режим работы Webpack
    mode: 'production',
    // Точки входа, какие файлы будет собирать
    entry: {
        index: './src/js/index.js'
        // Another files
    },
    // Точки выхода. В этот плейсхолдер будет попадать имя файла из точки входа
    output: {
        filename: '[name].bundle.js',
    },
    // Здесь подключаются модули
    module: {
        rules: [
            {
                // В данных модулях мы прописываем правила для css файлов,
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};

module.exports = config;