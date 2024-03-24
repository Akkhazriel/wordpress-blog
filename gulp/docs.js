// Необходимо подключить галп
const gulp = require('gulp');
// Подключение HTML-файлов в один c помощью плагина
const fileInclude = require('gulp-file-include');
// Компиляция SCSS-файлов с помощью плагина
const sass = require('gulp-sass')(require('sass'));
// Подключение LiveServer с помощью плагина
const server = require('gulp-server-livereload');
// Подключение Gulp Clean с помощью плагина
const clean = require('gulp-clean');
// Подключение файловой системы для корректной работы плагинов
const fs = require('fs');
// Подключение исходных карт с помощью плагина
const sourceMaps = require('gulp-sourcemaps');
// Группировка медиа-запросов, убираем дублирование с помощью плагина
// При подключении этого плагина ломаются исходные карты CSS
const groupMedia = require('gulp-group-css-media-queries');
// Подключение плагинов для предовтращение зависаний во время сбоев, а так же уведомлений
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
// Подключение Webpack -> Собирает js файлы
const webpack = require('webpack-stream');
// Подключение Babel -> форматирует код для каждой версии
const babel = require('gulp-babel');
// Подключение Image-min с помощью плагина
const imagemin = require('gulp-imagemin');
// Подключение gulp-changed, для предовтращение повторений попыток оптимизации уже существующих в директории файлов
const changed = require('gulp-changed');
// Подключение gulp-sass-glob для удобной установки scss
const sassGlob = require('gulp-sass-glob');
// Подключение auto-prefixer для установки префиксов -web-kit и т.д. для старых браузеров
const autoprefixer = require('gulp-autoprefixer');
// Подключение gulp-csso для минимизации CSS кода
const csso = require('gulp-csso');
// Подключение gulp-htmlclean для минимизации HTML кода
const htmlclean = require('gulp-htmlclean');
// Подключение WebP для работы с изображениями и поиска их альтернативы для webp
const webp = require('gulp-webp');
// Подключение WebP для HTML для автоматического указания тегов picture и source
const webphtml = require('gulp-webp-html');
// Подключение WbP для CSS для автоматической поддержки и webp картинок
const webpcss = require('gulp-webp-css');
 


// Функция, которая создает уведомление и меняет ему название чтобы не писать один объект несколько раз
const plumberNotify = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error <%= error.message %>',
            sound: false
        }),
    };
}


// Task для запуска task clean чтобы удалять папку docs
gulp.task('clean:docs', function(done) {
    // Проверка на существование папки docs 
    if (fs.existsSync('./docs/', {read: false})) {
        return gulp.src('./docs/')        
            .pipe(clean({force: true}));
    } else {
        console.log('docs not found')
    }
    done();
})



// Переменная с описанием объекта для html
const fileIncludeSettings = {
    prefix: '@@',
    basepath: '@file'
}
// Переменная с описанием объекта для LiveReload
const startServerSettings = {
    // Автообновление
    livereload: true,
    // Открытие при запуске
    open: true,
}



// Task для обработки HTML
gulp.task('html:docs', function() {
    // Функция должна возвращать поток
    return gulp.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
        // Включаем просмотр для оптимизации без повторного копирования файлов
        // change -> чтобы обновлялись страницы вне индекса html
        .pipe(changed('./docs/', { hasChanged: changed.compareContents }))
        .pipe(plumber(plumberNotify('HTML')))
        // Передам значения для создания объекта который будет описывать 
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(webphtml())
        .pipe(htmlclean())
        // Путь куда все будет сохраняться
        .pipe(gulp.dest('./docs/'))
});

// Task для SASS/SCSS + sourceMaps
gulp.task('sass:docs', function() {
    // Берем все scss файлы в этой директории
    return gulp.src('./src/scss/*.sass')
        // Включаем просмотр для оптимизации без повторного копирования файлов
        .pipe(changed('./docs/css'))
        .pipe(plumber(plumberNotify('SASS')))
        // Инициализируем плагин
        .pipe(sourceMaps.init())
        .pipe(autoprefixer())
        .pipe(sassGlob())
        .pipe(webpcss())
        .pipe(groupMedia())
        // Переводим в SASS
        .pipe(sass())
        .pipe(csso())
        // Переписываем
        .pipe(sourceMaps.write())
        // Сохраняем
        .pipe(gulp.dest('./docs/css'));
});

// Task для копирования изображения P.S. можно копировать и другие файлы
// Ниже примеры копирования шрифтов и файлов
gulp.task('images:docs', function() {
    // **/* - это любая папка и любая вложенность, то есть абсолютно все файлы
    return gulp.src('./src/img/**/*')
        // Включаем просмотр для оптимизации без повторного копирования файлов
        .pipe(changed('./docs/img/'))
        .pipe(webp())
        .pipe(gulp.dest('./docs/img/'))


        .pipe(gulp.src('./src/img/**/*'))
        .pipe(changed('./docs/img/'))
        // Подключаем image-min с настройками
            // Опция при оптимизации выводит в консоль
        .pipe(imagemin({verbose: true}))
        // Сохраняем в папку в другой директории
        .pipe(gulp.dest('./docs/img/'))
});

gulp.task('fonts:docs', function() {
    // **/* - это любая папка и любая вложенность, то есть абсолютно все файлы
    return gulp.src('./src/fonts/**/*')
        // Включаем просмотр для оптимизации без повторного копирования файлов
        .pipe(changed('./docs/fonts/'))
        
        // Сохраняем в папку в другой директории
        .pipe(gulp.dest('./docs/fonts/'))
});

gulp.task('files:docs', function() {
    // **/* - это любая папка и любая вложенность, то есть абсолютно все файлы
    return gulp.src('./src/files/**/*')
        // Включаем просмотр для оптимизации без повторного копирования файлов
        .pipe(changed('./docs/files/'))
        // Сохраняем в папку в другой директории
        .pipe(gulp.dest('./docs/files/'))
});
// Task для подключения javascript с помощью Webpack
gulp.task('js:docs', function() {
    return gulp.src('./src/js/*.js')
        // Включаем просмотр для оптимизации без повторного копирования файлов
        .pipe(changed('./docs/js'))
        .pipe(plumber(plumberNotify('JS')))
        // Подключаем babel
        .pipe(babel())
        // Сюда передаем Webpack config
        .pipe(webpack(require('../webpack.config.js')))
        .pipe(gulp.dest('./docs/js'))
})

// Task для запуска LiveServer
        // для того чтобы остановить процесс - в консоли CTRL + C
gulp.task('server:docs', function() {
    return gulp.src('./docs/').pipe(server(startServerSettings));
});