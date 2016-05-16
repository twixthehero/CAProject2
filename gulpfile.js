var gulp = require("gulp")
var uglify = require("gulp-uglify")
var rename = require("gulp-rename")
var babel = require("gulp-babel")
var notify = require("gulp-notify")

gulp.task("default", ["js"])

gulp.task("js", function()
{
    gulp.src("./js/**.js")
        .pipe(babel(
        {
            presets: ["es2015"]
        }))
        .pipe(uglify())
        .pipe(rename(function(path)
        {
            path.basename += ".min"
        }))
        .pipe(gulp.dest("./dist"))
        .pipe(notify(
        {
            message: "Completed platter build",
            onLast: true
        }))
})

gulp.task("watch", function()
{
    gulp.watch("./js/**.js", ["js"])
})
