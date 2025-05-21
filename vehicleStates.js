document.lss_helper.vehicleStatesAvailable = {
  "default": ["1", "2"],
  "call": ["5"],
  "transit": ["7"],
  "41": ["2"], // THW MzGW (FGr N)
  "42": ["2"], // THW LKW K 9
  "45": ["2"], // THW MLW 5
  "64": ["2"], // GW-Wasserrettung
};

document.lss_helper.statesAvailable = document.lss_helper.vehicleStatesAvailable.default ?? ['1', '2'];
document.lss_helper.statesCall = document.lss_helper.vehicleStatesAvailable.call ?? ['5'];
document.lss_helper.statesTransit = document.lss_helper.vehicleStatesAvailable.transit ?? ['7'];