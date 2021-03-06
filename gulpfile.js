var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var paths = {
    pages: ['src/static/*.html', 'src/static/*.css']
};


// gulp.task('default', gulp.series('del', function() { 
//     // default task code here
// }));

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task("default", gulp.series('copy-html', function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/script.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("dist"));
}));
