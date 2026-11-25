param([switch]$SelfTest)

# 一键显示所有被「文件夹保险箱」隐藏的文件夹
# 原理：读 vault.config 里的 Folders 列表，逐个清掉 Hidden(2) + System(4) 属性。
# 不需要密码——文件本身没有加密，只是被系统属性藏起来了。

$ErrorActionPreference = 'Stop'

function Find-Config {
    # 1) 优先脚本同目录（把本启动器和 vault.config 放一起时用）
    $local = Join-Path $PSScriptRoot 'vault.config'
    if (Test-Path -LiteralPath $local) { return $local }

    # 2) 其次桌面上的「文件夹保险箱-完整包」目录（原工具包位置）
    $desktop = [Environment]::GetFolderPath('Desktop')
    if ($desktop) {
        $pack = Join-Path $desktop '文件夹保险箱-完整包\vault.config'
        if (Test-Path -LiteralPath $pack) { return $pack }
    }

    return $null
}

function Show-Result {
    param([string]$Message, [string]$Caption)
    if ($SelfTest) {
        Write-Output $Message
        return
    }
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show($Message, $Caption,
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Information) | Out-Null
}

$cfg = Find-Config
if (-not $cfg) {
    Show-Result '找不到 vault.config。请把本启动器放到「文件夹保险箱-完整包」目录里，或确保桌面上的工具包还在。' '一键显示文件夹'
    if ($SelfTest) { exit 1 }
    exit 1
}

try {
    $json = Get-Content -LiteralPath $cfg -Raw -Encoding UTF8 | ConvertFrom-Json
} catch {
    Show-Result "读取 vault.config 失败：$($_.Exception.Message)" '一键显示文件夹'
    exit 1
}

$folders = @()
if ($null -ne $json.Folders) { $folders = @($json.Folders) }

if ($folders.Count -eq 0) {
    Show-Result 'vault.config 里没有受保护的文件夹，无需操作。' '一键显示文件夹'
    exit 0
}

$shown = @()
$missing = @()
foreach ($p in $folders) {
    if (Test-Path -LiteralPath $p) {
        $item = Get-Item -LiteralPath $p -Force
        # 只清 Hidden(2) 和 System(4)，保留其它属性
        $item.Attributes = [IO.FileAttributes](([int]$item.Attributes) -band (-bnot 2) -band (-bnot 4))
        $shown += $p
    } else {
        $missing += $p
    }
}

$msg = "完成：已显示 $($shown.Count) 个文件夹。"
if ($missing.Count -gt 0) {
    $msg += "`n`n$($missing.Count) 个路径不存在（可能已移动或删除）：`n" + ($missing -join "`n")
}
if ($shown.Count -gt 0) {
    $msg += "`n`n已显示：`n" + ($shown -join "`n")
}
Show-Result $msg '一键显示文件夹'
