var gulp = require("gulp")
var uglify = require("gulp-uglify")
var rename = require("gulp-rename")

gulp.task("default", function() {
    gulp.src("./js/**.js")
        .pipe(gulp.dest("./dist"))
})
