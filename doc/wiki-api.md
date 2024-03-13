# Semantic Media Wiki API examples

* Im Fokus sind hier Zeit und Ortsangaben.
* Orte haben auch GeoCoords (wo bekannt; z.B. bei seinem Geburtsort wissen weder ich noch OpenStreetMap wo das ist)
* Zeitangaben können (oft) unpräzise sein: zB "1/1961" steht für irgendwann im Jahr 1961; "1/1930/5/15" für den 15. Mai 1930 (das „1/“ am Anfang ist vmtl. unwichtig evt. Anno Domini)
* In den JSON Files stehen die Daten erst erst im zweite Block namens „results“
* Ich schau mir die JSON Dateien im Firefox an

Webansicht für Menschen
https://regiobiograph.media.fhstp.ac.at/wiki/Auerbach_Emil_(Samuel)

Person Stammdaten
https://regiobiograph.media.fhstp.ac.at/api.php?action=ask&query=%5B%5BAuerbach%20Emil%20%28Samuel%29%5D%5D%20%7C%3FBirthDate%7C%3FBirthPlace%7C%3FBirthPlace.GeoCoords%7C%3FDeathDate%7C%3FDeathPlace%7C%3FDeathPlace.GeoCoords&format=json

Pers. Ereignisse
https://regiobiograph.media.fhstp.ac.at/api.php?action=ask&query=%5B%5B-Has%20subobject%3A%3AAuerbach%20Emil%20%28Samuel%29%5D%5D%5B%5BKategorie%3ALifeEvent%5D%5D%7Cmainlabel%3D-%7C%3FLifeEventType%7C%3FDescription%7C%3FDate%7C%3FEndDate%7C%3FLocation%7C%3FLocation.GeoCoords%7C%3FReference%7C%3FMediaUrl&format=json

Wohnsitze
https://regiobiograph.media.fhstp.ac.at/api.php?action=ask&query=%5B%5B-Has%20subobject%3A%3AAuerbach%20Emil%20%28Samuel%29%5D%5D%5B%5BKategorie%3AResidence%5D%5D%0A%7Cmainlabel%3D-%0A%7C%3FhomeLocation%0A%7C%3FhomeLocation.GeoCoords%0A%7C%3FDescription%0A%7C%3FStartDate%0A%7C%3FEndDate%0A%7C%3FReference&format=json

Berufe
https://regiobiograph.media.fhstp.ac.at/api.php?action=ask&query=%5B%5B-Has%20subobject%3A%3AAuerbach%20Emil%20%28Samuel%29%5D%5D%5B%5BKategorie%3AOccupationalRole%5D%5D%20%7Cmainlabel%3D-%20%7C%3FhasOccupation%20%7C%3FDescription%20%7C%3FStartDate%20%7C%3FEndDate%20%7C%3FReference&format=json
