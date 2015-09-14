@echo off
echo [INFO] unzip the zip package, and then minify the css, js, html.
pause

cd %~dp0
cd ..
call grunt build
echo [INFO] now, begin to zip code, you can see it in download dir.

call grunt release
pause