document.lss_helper.vehicleStatesAvailable = {
  "default": ["1", "2"],
  "call": ["5"],
  "transit": ["7"],
  "39": ["2"], // THW GKW
  "41": ["2"], // THW MzGW (FGr N)
  "42": ["2"], // THW LKW K 9
  "45": ["2"], // THW MLW 5
  "64": ["2"], // GW-Wasserrettung
  "65": ["2"], // THW LKW K 7 Lkr
  "93": ["2"], // THW MTW-O
  "100": ["2"], // THW MLW 4
  "122": ["2"], // THW LKW 7 Lbw E
  "123": ["2"], // THW LKW 7 Lbw WP
  "145": ["2"], // THW FüKomKW
};

document.lss_helper.statesAvailable = document.lss_helper.vehicleStatesAvailable.default ?? ['1', '2'];
document.lss_helper.statesCall = document.lss_helper.vehicleStatesAvailable.call ?? ['5'];
document.lss_helper.statesTransit = document.lss_helper.vehicleStatesAvailable.transit ?? ['7'];