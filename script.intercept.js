document.lss_helper.functions = document.lss_helper.functions || {
  original: {},
  addition: {},
  replacement: {},
  create: (f) => {
    document.lss_helper.log('intersecting', f);
    document.lss_helper.functions.original[f] = eval(f);
    document.lss_helper.functions.addition[f] = document.lss_helper.functions.addition[f] || function (...args) {
      document.lss_helper.error(f, 'called with', ...args);
    };
    document.lss_helper.functions.replacement[f] = (...args) => {
      document.lss_helper.functions.original[f](...args);
      document.lss_helper.functions.addition[f](...args);
    };
    eval(f + '=document.lss_helper.functions.replacement.' + f + ';');
  },
};

[
  'buildingMarkerAddSingle',
  'vehicleMarkerAdd',
  'missionMarkerAddSingle',
  // 'missionMarkerBulkAdd',
  // 'patientMarkerAdd',
  // 'prisonerMarkerAdd',
  // 'radioMessage',
  // 'vehicleDrive',
]
  .filter(f => !document.lss_helper.functions.original[f])
  .forEach((f) => {
    document.lss_helper.functions.create(f);
  });

document.lss_helper.marker = document.lss_helper.marker || {
  buildings: {},
  vehicles: {},
  missions: {},
};

document.lss_helper.functions.addition.buildingMarkerAddSingle = (a1) => {
  document.lss_helper.marker.buildings[a1.id] = a1;
};
document.lss_helper.functions.addition.vehicleMarkerAdd = (a1) => {
  document.lss_helper.marker.vehicles[a1.id] = a1;
};
document.lss_helper.functions.addition.missionMarkerAddSingle = (a1) => {
  document.lss_helper.marker.missions[a1.id] = a1;
};