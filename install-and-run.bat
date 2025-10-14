@echo off
echo 正在安装依赖并启动抖音自动点赞脚本...
echo.

REM 检查是否已安装Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误：未检测到Node.js，请先安装Node.js！
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

REM 显示Node.js版本
echo Node.js版本：
node --version
echo.

REM 安装依赖
echo 正在安装依赖...
call npm install

if %errorlevel% neq 0 (
    echo 依赖安装失败，尝试使用cnpm...
    call npm install -g cnpm
    call cnpm install
)

echo.
echo 安装完成，正在启动脚本...
echo.

REM 运行主脚本
node index.js

echo.
echo 脚本执行完成，按任意键退出...
pause