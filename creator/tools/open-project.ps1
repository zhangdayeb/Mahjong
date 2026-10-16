param(
    [string]$CreatorExe = 'C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe'
)

$ErrorActionPreference = 'Stop'
$ProjectDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (-not (Test-Path -LiteralPath $CreatorExe -PathType Leaf)) {
    throw "找不到 Cocos Creator 3.8.8，请使用 -CreatorExe 指定编辑器路径。"
}
if (-not (Test-Path -LiteralPath (Join-Path $ProjectDirectory 'package.json') -PathType Leaf)) {
    throw "没有找到 Creator 工程 package.json。"
}

# This helper is explicitly invoked by the user to open the interactive editor.
# Background command-line builds use the separate build-web.mjs helper.
Write-Host "打开联桌麻将 Creator 工程：$ProjectDirectory"
Start-Process -FilePath $CreatorExe -ArgumentList @('--project', ('"' + $ProjectDirectory + '"')) -WorkingDirectory $ProjectDirectory
