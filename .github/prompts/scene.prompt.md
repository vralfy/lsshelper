---
mode: 'edit'
description: 'Adds a new scene description to scenes.json'
---

The goal is to add a new scene description to scenes.json.

* Ask for mission id if not provided
* run getMission.sh {missionId} to download the mission description
* informations are stored in a file called [](./missions/{missionId}.html)
* if the file does not exist, inform the user and exit
* parse the file to find the mission title and needed vehicle types
* explain the user which vehicle types are used in the mission
* add a new entry to [](./scenes.json) but keep the existing entries
* an entry should look like this:
```json
 "{missionId}" : ["type1": 3, "type2": 6], // {mission title}
 ```
* vehicle types need to be replaced with the following:
  * Loeschfahrzeug = LF
  * Ruestwagen = RW
  * GW-A = GWA
  * GW-Atemschutz = GWA
  * GW-Gefahrgut = GWG
  * GW-L2-Wasser = SW
  * GW-Messtechnik = GWM
  * GW-Öl = GWO
  * Funkstreifenwagen = POL
* if there is a probability of less than 50 for a vehicle, do not add it
* add a RTW for each expected patient, use minimal amount if given
* add one NEF if probability is given and at least 50
* keep order of all entries sorted by mission id