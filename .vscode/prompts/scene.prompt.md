---
mode: 'edit'
description: 'Adds a new scene description to scenes.json'
---

Create a scene entry from scene description. The scene format is as follows:
```json
 "{missionId}" : ["type1": 3, "type2": 6], // {mission title}
 ```

* do not modify any files
* Ask for mission id if not provided
* there is an mcp tool available to get the mission data. Use it!
* explain the user which vehicle types are used in the mission
* do not translate mission title
* vehicle types need to be replaced with the following:
  * Loeschfahrzeug = LF
  * Ruestwagen = RW
  * Drehleiter = DLK
  * Feuerwehrkran = FKW
  * GW-A = GWA
  * GW-Atemschutz = GWA
  * GW-Gefahrgut = GWG
  * GW-L2-Wasser = SW
  * GW-Messtechnik = GWM
  * GW-Öl = GWO
  * Funkstreifenwagen = POL
  * Zivilstreifenwagen = ZIV
* if not mapped, provide the full name as key
* if there is a probability of less than 50 for a vehicle, do not add it
* add a RTW for each expected patient, use minimal amount if given
* add one NEF if probability is given and at least 50