@echo off
title Smart AI Email Assistant - Starter
echo ========================================================
echo        Smart AI Email Assistant - Quick Start
echo ========================================================
echo.

echo [1/3] Checking Ollama status...
powershell -Command "try { (Invoke-WebRequest -Uri 'http://localhost:11434/api/tags' -UseBasicParsing -TimeoutSec 3).StatusCode } catch { Write-Host 'Ollama not detected! Please ensure Ollama is running.' }"

echo.
echo [2/3] Starting Spring Boot Backend (Port 8080)...
start "Smart Email Assistant - Backend (Port 8080)" cmd /k "cd /d %~dp0backend && mvnw.cmd spring-boot:run"

echo.
echo [3/3] Starting React Vite Frontend (Port 5173)...
start "Smart Email Assistant - Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo ========================================================
echo  All services are launching!
echo  Frontend UI:  http://localhost:5173
echo  Backend API:  http://localhost:8080
echo  H2 Console:   http://localhost:8080/h2-console
echo ========================================================
pause
