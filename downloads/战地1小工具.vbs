Option Explicit
' BF1 Stats Card launcher - opens the app in a chromeless --app window
' Fix: percent-encode non-ASCII (Chinese) path so Edge --app resolves it correctly
Dim sh, fso, base, url, exe, i
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' %USERPROFILE%\BF1战绩卡  (built with ChrW so the script stays pure ASCII)
base = sh.ExpandEnvironmentStrings("%USERPROFILE%") & "\BF1" & ChrW(25112) & ChrW(32489) & ChrW(21345)
If Not fso.FolderExists(base) Then
  base = fso.GetParentFolderName(WScript.ScriptFullName)
End If

' Build a proper file:// URL with UTF-8 percent-encoding
url = "file:///" & Replace(EncodeUtf8(base), "\", "/") & "/public/index.html"

Dim cands(3)
cands(0) = sh.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Microsoft\Edge\Application\msedge.exe"
cands(1) = sh.ExpandEnvironmentStrings("%ProgramFiles%") & "\Microsoft\Edge\Application\msedge.exe"
cands(2) = sh.ExpandEnvironmentStrings("%ProgramFiles%") & "\Google\Chrome\Application\chrome.exe"
cands(3) = sh.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Google\Chrome\Application\chrome.exe"

exe = ""
For i = 0 To 3
  If exe = "" And fso.FileExists(cands(i)) Then exe = cands(i)
Next

If exe = "" Then
  sh.Run url, 1, False
Else
  sh.Run """" & exe & """ --app=""" & url & """ --window-size=1240,800 --window-position=60,30", 1, False
End If

' Encode a string into UTF-8 percent-encoding, keeping printable ASCII as-is
Function EncodeUtf8(s)
  Dim out, i, code
  out = ""
  For i = 1 To Len(s)
    code = AscW(Mid(s, i, 1))
    If code < 0 Then code = code + 65536
    If code < 128 And code >= 32 Then
      out = out & Chr(code)
    ElseIf code < 2048 Then
      out = out & "%" & H2(192 + (code \ 64)) & "%" & H2(128 + (code Mod 64))
    Else
      out = out & "%" & H2(224 + (code \ 4096)) & "%" & H2(128 + ((code \ 64) Mod 64)) & "%" & H2(128 + (code Mod 64))
    End If
  Next
  EncodeUtf8 = out
End Function

Function H2(n)
  H2 = Right("0" & Hex(n), 2)
End Function
