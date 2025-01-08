@echo off
echo Installing development tools...

:: Install vsce globally
call npm install -g @vscode/vsce

:: Standard Version Setup
cd lumora-standard
echo Setting up Standard Version...
call npm install
call npm run compile

:: Premium Version Setup
cd ../lumora-premium
echo Setting up Premium Version...
call npm install
call npm run compile

echo Setup complete!
pause
