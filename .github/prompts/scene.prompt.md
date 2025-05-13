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
* explain the user that the mission title will be used as a comment in the json file
* explain the user which vehicle types are used in the mission
* ignore syntax errors regarding comments in json files
* add a new entry to [](./scenes.json) but keep the existing entries
* an entry should look like this:
```json
 "{missionId}" : ["type1": 3, "type2": 6], // {mission title}
 ```
* keep order of all entries sorted by mission id