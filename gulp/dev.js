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
// PUG-препроцессор
const gulpPug = require('gulp-pug');


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


// Task для запуска task clean чтобы удалять папку build
gulp.task('clean:dev', function(done) {
    // Проверка на существование папки build 
    if (fs.existsSync('./build/', {read: false})) {
        return gulp.src('./build/')        
            .pipe(clean({force: true}));
    } else {
        console.log('build not found')
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

gulp.task('pug:dev', function() {
    return gulp.src('./src/pug/**/*.pug')
        .pipe(
            gulpPug({ pretty: true })
        )
        .pipe(gulp.dest('./build/'))
})
 
// Task для обработки HTML
gulp.task('html:dev', function() {
    // Функция должна возвращать поток
    return gulp.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
        // Включаем просмотр для оптимизации без повторного копирования файлов
        .pipe(changed('./build/', { hasChanged: changed.compareContents }))
        .pipe(plumber(plumberNotify('HTML')))
        // Передам значения для создания объекта который будет описывать 
        .pipe(fileInclude(fileIncludeSettings))
        // Путь куда все будет сохраняться
        .pipe(gulp.dest('./build/'))
});

// Task для SASS/SCSS + sourceMaps
gulp.task('sass:dev', function() {
    // Берем все scss файлы в этой директории
    return gulp.src('./src/scss/*.sass')
        // Включаем просмотр для оптимизации без повторного копирования файлов
        .pipe(changed('./build/css'))
        .pipe(plumber(plumberNotify('SASS')))
        // Инициализируем плагин
        .pipe(sourceMaps.init())
        .pipe(sassGlob())
        // Переводим в SASS
        .pipe(sass())
        // Переписываем
        .pipe(sourceMaps.write())
        // Сохраняем
        .pipe(gulp.dest('./build/css'));
});

// Task для копирования изображения P.S. можно копировать и другие файлы
// Ниже примеры копирования шрифтов и файлов
gulp.task('images:dev', function() {
    // **/* - это любая папка и любая вложенность, то есть абсолютно все файлы
    return gulp.src('./src/img/**/*')
        // Включаем просмотр для оптимизации без повторного копирования файлов
        .pipe(changed('./build/img/'))
        // Подключаем image-min с настройками
            // Опция при оптимизации выводит в консоль
        .pipe(imagemin({verbose: true}))
        // Сохраняем в папку в другой директории
        .pipe(gulp.dest('./build/img/'))
});

gulp.task('fonts:dev', function() {
    // **/* - это любая папка и любая вложенность, то есть абсолютно все файлы
    return gulp.src('./src/fonts/**/*')
        // Включаем просмотр для оптимизации без повторного копирования файлов
        .pipe(changed('./build/fonts/'))
        
        // Сохраняем в папку в другой директории
        .pipe(gulp.dest('./build/fonts/'))
});

gulp.task('files:dev', function() {
    // **/* - это любая папка и любая вложенность, то есть абсолютно все файлы
    return gulp.src('./src/files/**/*')
        // Включаем просмотр для оптимизации без повторного копирования файлов
        .pipe(changed('./build/files/'))
        // Сохраняем в папку в другой директории
        .pipe(gulp.dest('./build/files/'))
});
// Task для подключения javascript с помощью Webpack
gulp.task('js:dev', function() {
    return gulp.src('./src/js/*.js')
        // Включаем просмотр для оптимизации без повторного копирования файлов
        .pipe(changed('./build/js'))
        .pipe(plumber(plumberNotify('JS')))
        // Подключаем babel
        .pipe(babel())
        // Сюда передаем Webpack config
        .pipe(webpack(require('./../webpack.config.js')))
        .pipe(gulp.dest('./build/js'))
})

// Task для запуска LiveServer
        // для того чтобы остановить процесс - в консоли CTRL + C
gulp.task('server:dev', function() {
    return gulp.src('./build/').pipe(server(startServerSettings));
});

// Task для наблюдения за html, css и картинками
gulp.task('watch:dev', function() {
    gulp.watch('./src/scss/**/*.sass',gulp.parallel('sass:dev'));
    gulp.watch('./src/**/*.html', gulp.parallel('html:dev'));
    gulp.watch('./src/**/*.pug', gulp.parallel('pug:dev'));
    gulp.watch('./src/img/**/*', gulp.parallel('images:dev'));
    gulp.watch('./src/fonts/**/*', gulp.parallel('fonts:dev'));
    gulp.watch('./src/files/**/*', gulp.parallel('files:dev'));
    gulp.watch('./src/js/**/*', gulp.parallel('js:dev'));
});