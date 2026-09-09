document.lss_helper.vehicleAAO = {
  "AAODEBUG": { 101: 1, 102: 2, 103: 3, 104: 4, 105: 5, 106: 6, 107: 7, 108: 8, 109: 9, 110: 10 },
  "AAOTHWDLE": { 44: 1, 45: 1 },
  "AAOTHWDOG": { 92: 1, 93: 1 },
  "AAOTHWFUE": { 144: 1, 145: 1, 146: 1, 147: 1, 148: 1 },
  "AAOFFNEA": { "NEA50": 1 },
  "AAOTHWNEA50": { "THWGWN": 1, "NEA50": 1 },
  "AAOTHWNEA200": { 122: 1, "NEA200": 1 },
  "AAOTHWR": { 43: 1 }, //, 42: 1 },
  "AAOTHWWP": { 100: 1, 101: 1, 102: 1, 123: 1 },
  "AAOTHWBRB": { 181: 1, 182: 1, 183: 1 },
  "AAOSEGBT": { 130: 1, 132: 1, 133: 1 },
  "AAOTESI": { 173: 1, 174: 1 },
};

// These are reduced entries for the AAO, which are used to determine which vehicles can be sent to an incident.
// The full list of vehicles and their corresponding types is defined in vehicleResend.js and vehiclesTypes.js.
// The AAO entries here are used to group certain vehicle types together for specific incident types.
// For example, "AAOTHWFUE" includes all the THW vehicles that are classified as "FüKW", "FüKomKW", "Anh FüLa", "FmKW", and "MTW-FGr K".
// This allows the game to know that any of these vehicles can be sent to an incident that requires a "FüKW".
document.lss_helper.vehicleAAO = {
  ...document.lss_helper.vehicleAAO,
  "AAOTHWDLE": { 44: 1 },
  "AAOTHWDOG": { 92: 1 },
  "AAOTHWFUE": { 144: 1, 146: 1, 147: 1, 148: 1 },
  "AAOTHWNEA50": { "NEA50": 1 },
  "AAOTHWNEA200": { "NEA200": 1 },
  "AAOTHWWP": { 101: 1, 102: 1 },
  "AAOTHWBRB": { 182: 1, 183: 1 },
  "AAOSEGBT": { 130: 1, 132: 1 },
};