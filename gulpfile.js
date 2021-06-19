const gulp = require('gulp');
const uglyjs = require('gulp-uglify');
const clean = require('gulp-clean');
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

gulp.task('clean', () => {
  const { src } = gulp;
  return src('dist').pipe(clean());
})

gulp.task('build:ts', async () => {
  const { dest } = gulp;
  await tsProject.src()
    .pipe(tsProject())
    .js.pipe(uglyjs())
    .pipe(dest("dist"));
});

gulp.task('build:config', () => {
  const { src, dest } = gulp;
  return src('package.json').pipe(dest('dist'));
});

gulp.task('dev:build', async () => {
  const { dest } = gulp;
  await tsProject.src()
    .pipe(tsProject())
    .pipe(dest("dist"));
});

gulp.task('dev', gulp.series('dev:build'));

gulp.task('default', gulp.series('clean', 'build:ts', 'build:config'));
