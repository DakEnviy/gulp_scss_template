var browserSync = require("browser-sync").create();
var gulp = require("gulp"),
		sass = require("gulp-sass"),
		prefixer = require("gulp-autoprefixer"),
		clean = require("gulp-clean-css"),
		rename = require("gulp-rename"),
		concat = require("gulp-concat"),
		uglify = require("gulp-uglify")
		sprite = require("gulp.spritesmith");
var through2 = require("through2").obj,
		File = require("vinyl");

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

gulp.task("fonts", function() {
	var fonts = {};
	return gulp.src("app/fonts/**/*.*")
		.pipe(through2(function(file, enc, callback) {
			var path = file.relative.split("/");
			var name = path[0],
					style = path[1],
					ext = file.relative.split(".")[1];
			if (!fonts.hasOwnProperty(name)) fonts[name] = {};
			if (!fonts[name].hasOwnProperty(style)) fonts[name][style] = [];
			fonts[name][style].push(ext);
			callback();
		}, function(callback) {
			var fontsContents = "\
// =============================================================================\n\
// String Replace\n\
// =============================================================================\n\
@function str-replace($string, $search, $replace: \"\") {\
	$index: str-index($string, $search);\
\n\
	@if $index {\n\
		@return str-slice($string, 1, $index - 1) + $replace + str-replace(str-slice($string, $index + str-length($search)), $search, $replace);\n\
	}\n\
\n\
	@return $string;\n\
}\n\
\n\
// =============================================================================\n\
// Font Face\n\
// =============================================================================\n\
@mixin font-face($name, $path, $weight: null, $style: null, $exts: eot woff2 woff ttf svg) {\n\
	$src: null;\n\
\n\
	$extmods: (\n\
		eot: \"?\",\n\
		svg: \"#\" + str-replace($name, \" \", \"_\")\n\
	);\n\
\n\
	$formats: (\n\
		otf: \"opentype\",\n\
		ttf: \"truetype\"\n\
	);\n\
\n\
	@each $ext in $exts {\n\
		$extmod: if(map-has-key($extmods, $ext), $ext + map-get($extmods, $ext), $ext);\n\
		$format: if(map-has-key($formats, $ext), map-get($formats, $ext), $ext);\n\
		$src: append($src, url(quote($path + \".\" + $extmod)) format(quote($format)), comma);\n\
	}\n\
\n\
	@font-face {\n\
		font-family: quote($name);\n\
		font-style: $style;\n\
		font-weight: $weight;\n\
		src: $src;\n\
	}\n\
}\n\n";
			for (var fontName in fonts) {
				for (var font in fonts[fontName]) {
					var weight = "400",
							style = "normal";
					if ((/extralight/i).test(font) || (/ultralight/i).test(font)) weight = "200";
					else if ((/semibold/i).test(font) || (/demibold/i).test(font)) weight = "600";
					else if ((/extrabold/i).test(font) || (/ultrabold/i).test(font)) weight = "800";
					else if ((/thin/i).test(font) || (/hairline/i).test(font)) weight = "100";
					else if ((/light/i).test(font)) weight = "300";
					else if ((/regular/i).test(font) || (/normal/i).test(font)) weight = "400";
					else if ((/medium/i).test(font)) weight = "500";
					else if ((/bold/i).test(font)) weight = "700";
					else if ((/black/i).test(font) || (/heavy/i).test(font)) weight = "900";
					if ((/italic/i).test(font)) style = "italic";
					fontsContents += "@include font-face(\"" + fontName + "\", \"../fonts/" + fontName + "/" + font + "/" + font + "\", " + weight + ", " + style + ", " + fonts[fontName][font].join(" ") + ");\n";
				}
			}
			fontsContents += "\n";
			this.push(new File({
				base: process.cwd(),
				path: process.cwd() + "/_fonts.scss",
				contents: new Buffer(fontsContents)
			}));
			callback();
		}))
		.pipe(gulp.dest("scss/"));
});

gulp.task("default", ["styles", "scripts", "serve"]);
