document.lss_helper.functions = document.lss_helper.functions || {
  original: {},
  addition: {},
  replacement: {},
  create: (f) => {
    console.log('intersecting', f);
    document.lss_helper.functions.original[f] = eval(f);
    document.lss_helper.functions.addition[f] = document.lss_helper.functions.addition[f] || function (...args) {
      console.error(f, ...args);
    };
    document.lss_helper.functions.replacement[f] = (...args) => {
      document.lss_helper.functions.original[f](...args);
      document.lss_helper.functions.addition[f](...args);
    };
    eval(f + '=document.lss_helper.functions.replacement.' + f + ';');
  },
};

[
  'missionMarkerAddSingle',
  // 'missionMarkerBulkAdd',
  // 'patientMarkerAdd',
  // 'prisonerMarkerAdd',
  // 'radioMessage',
  // 'vehicleDrive',
  // 'vehicleMarkerAdd'
]
.filter(f => !document.lss_helper.functions.original[f])
.forEach((f) => {
  document.lss_helper.functions.create(f);
});

document.lss_helper.functions.addition.missionMarkerAddSingle = (a1) => {
  console.log('missionMarkerAddSingle called with', a1);
  // const mission = (document.lss_helper.missions ?? []).filter((f) => f.data.id === a1.id).pop();
  // if (a1.missing_text && mission?.unattended) {
  //   console.warn('missionMarkerAddSingle', a1, mission);
  // } else {
  //   console.log('missionMarkerAddSingle', a1, mission);
  // }
};