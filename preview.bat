@echo off
rem Local preview: rebuild the file:// bundle, start a server, open the browser.
cd /d "%~dp0"
where python >nul 2>nul && (set PY=python) || (set PY=py)
%PY% tools\build_content.py || goto :err
start "" http://localhost:8000/
echo Serving on http://localhost:8000  (press Ctrl+C to stop)
%PY% -m http.server 8000
goto :eof
:err
echo Build failed - check the JSON error above.
pause
