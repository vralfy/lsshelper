document.lss_helper.vehicleIgnoreDistance = [
  //'31', // RTH
  //'157', // RTH Winde
  //'61', // POL Hubschrauber
  //'156', // POL Hubschrauber Winde
];

document.lss_helper.mult = {
  'heli': 0.00001,
  'bepo': 0.005,
};

document.lss_helper.vehicleMultiplyDistance = {
  '31': document.lss_helper.mult.heli, // RTH
  '157': document.lss_helper.mult.heli, // RTH Winde
  '61': document.lss_helper.mult.heli, // POL Hubschrauber
  '156': document.lss_helper.mult.heli, // POL Hubschrauber Winde
  '35': document.lss_helper.mult.bepo, // BePo leBefKw
  '50': document.lss_helper.mult.bepo, // BePo GruKw
  '51': document.lss_helper.mult.bepo, // BePo FueKw
  '52': document.lss_helper.mult.bepo, // POL GefKw
  '72': document.lss_helper.mult.bepo, // BePo WaWe
  '79': document.lss_helper.mult.bepo, // BePo SEK-ZF
  '80': document.lss_helper.mult.bepo, // BePo SEK-MTF
  '81': document.lss_helper.mult.bepo, // BePo MEK-ZF
  '82': document.lss_helper.mult.bepo, // BePo MEK-MTF
  '165': document.lss_helper.mult.bepo, // BePo LauKw
  "134": document.lss_helper.mult.bepo, // BePo Pferdetransporter klein",
  "135": document.lss_helper.mult.bepo, // BePo Pferdetransporter gross",
  "136": document.lss_helper.mult.bepo, // BePo Anh Pferdetransporter",
  "137": document.lss_helper.mult.bepo, // BePo Pferdetransporter ZF",
};