@echo off
title VendorFlow Portal - Local Dist Server
echo ============================================================
echo   Starting VendorFlow Portal Dist Build on Local Server
echo ============================================================
echo.
echo Opening browser at: http://localhost:8080 ...
start http://localhost:8080
echo Serving dist/vendor-portal-angular/browser on port 8080...
echo (Press Ctrl + C in this window to stop the server)
echo.
npx serve -s dist/vendor-portal-angular/browser -p 8080
pause
