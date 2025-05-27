---
mode: 'edit'
description: 'Adds a new scene description to scenes.json'
---

The goal is to add a new scene description to scenes.json.

* do not modify any files
* Ask for mission id if not provided
* there is an mcp tool available to get the mission data. Use it!
* make always use of mcp services if possible
* explain the user which vehicle types are used in the mission
* an entry should look like this:
* do not translate mission title
```json
 "{missionId}" : ["type1": 3, "type2": 6], // {mission title}
 ```
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
* keep order of all entries sorted by mission id