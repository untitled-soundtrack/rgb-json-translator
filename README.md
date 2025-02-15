# RBG Json Translator 

A node.js CLI that exports biographical data from MediaWiki as simple JSON files for RegioBioGraph

## Author
- [Alexander Rind](https://github.com/alex-rind)
- Florian Bauer (**Adaptation of the source code and export as a `.pkg`, making the script an executable file.**)

## Guide

1. Install dependencies `npm i`
2. Export all persons and narrative `node .`
3. Export a selected one `node . -u https://regiobiograph.media.fhstp.ac.at/wiki/Moskowitz_Else`
4. The path for the export is `\output5\`

# Guide für die pkg (Windows/macOS)

Öffne `rbg-json-translator_multiplatform.zip` und entpacke den jeweiligen Ordner, abhängig vom verwendeten Betriebssystem:

```txt
📂 macos-x64: Das Export-Tool für macOS
📂 win-x64: Das Export-Tool für Windows 
```

Starte das Skript, indem du die im jeweiligen Ordner enthaltene ausführbare Datei `rbg-json-translator` (unter Windows `.exe`) ausführst. Daraufhin öffnet sich ein Terminal, und der automatisierte Export der Daten beginnt. Sobald der Export abgeschlossen ist, schließt sich das Fenster automatisch.

## Ordnerstruktur des Exports

Je nach Betriebssystem wird der Ordner `output5` entweder direkt im Verzeichnis der ausführbaren Datei oder im entsprechenden Benutzer:innenverzeichnis erstellt.

### macOS
> Der Export-Ordner `output5` wird im Benutzer:innenverzeichnis angelegt.

### Windows
> Der Export-Ordner `output5` wird im Verzeichnis angelegt, in dem sich die ausführbare Datei `rbg-json-translator.exe` befindet.

### Inhalt des Ordners `output5`
```txt
.
📂 output5
    📂 gross-enzersdorf.topothek.at: Multimediadaten der Topothek
    📂 Narrativ
        📂 Narrativ_##:
            📄 Narrativ_##.json: Narrative im JSON-Format
    📂 Person
        📂 Person_##:
            📄 Person_##.json: Personenbiografie im JSON-Format  
```

## Konfiguration

Damit der Unity-Prototyp die exportierten Daten verwendet, müssen folgende Schritte durchgeführt werden:

- Der Unity-Prototyp sollte lokal in einem separaten Ordner `RegioExe` gespeichert sein.
- Auf der **gleichen Ordner-Ebene** sollte ein Ordner `RegioJson` existieren, in den der **Inhalt** von `output5` kopiert wird 
(ohne den Ordner `output5` selbst).
- Zusätzlich benötigt der Unity-Prototyp eine Konfigurationsdatei `config.txt`, die verschiedene Einstellungen enthält 
beispielsweise, welche Namen in der Übersicht hervorgehoben werden oder wie die Abspielgeschwindigkeit angepasst werden kann. 
Diese Datei muss im Ordner `RegioJson` abgelegt werden.

Die Ordnerstruktur sollte folgendermaßen aussehen:

```txt
📂 Lokale Festplatte (Win/macOS)
    📂 RegioExe: Unity-Prototyp
    📂 RegioJson: Exportierte Daten
            📂 gross-enzersdorf.topothek.at
            📂 Narrativ
            📂 Person        
            📄 config.txt
```

Nun kann der Unity-Prototyp gestartet werden, indem die ausführbare Datei `RegioBiograph` (unter Windows `.exe`) im Ordner `RegioExe` ausgeführt wird.

