var browserSync = require("browser-sync").create();
var gulp = require("gulp"),
		sass = require("gulp-sass"),
		prefixer = require("gulp-autoprefixer"),
		clean = require("gulp-clean-css"),
		rename = require("gulp-rename"),
		concat = require("gulp-concat"),
		uglify = require("gulp-uglify")
		sprite = require("gulp.spritesmith");

gulp.task("serve", ["styles", "scripts"], function() {
	browserSync.init({
		server: "./app",
		notify: false
	});
	gulp.watch("scss/**/*.scss", ["styles"]);
	gulp.watch("libs/**/*.js", ["scripts"]);
	gulp.watch("app/js/*.js").on("change", browserSync.reload);
	gulp.watch("app/*.html").on("change", browserSync.reload);
});

gulp.task("styles", function() {
	return gulp.src("scss/*.scss")
		.pipe(sass())
		.pipe(rename({suffix: ".min"}))
		.pipe(prefixer({browsers: ["last 15 versions"], cascade: false}))
		.pipe(clean())
		.pipe(gulp.dest("app/css/"))
		.pipe(browserSync.stream());
});

gulp.task("scripts", function() {
	return gulp.src([ // Add libs
			"",
		])
		.pipe(concat("libs.js"))
		// .pipe(uglify()) //Minify libs.js
		.pipe(gulp.dest("app/js/"));
});

gulp.task("sprite", function() {
	var spriteData = gulp.src("scss/sprites/*.png").pipe(sprite({
		imgName: "sprite.png",
		imgPath: "../img/sprite.png",
		cssName: "_sprite.scss"
	}));
	spriteData.img.pipe(gulp.dest("app/img/"));
	spriteData.css.pipe(gulp.dest("scss/"));
});

gulp.task("default", ["styles", "scripts", "serve"]);
