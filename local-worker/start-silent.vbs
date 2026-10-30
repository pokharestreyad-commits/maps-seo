Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\maps seo"
WshShell.Run "node ""D:\maps seo\local-worker\localEngine.js""", 0, False
