document.lss_helper.functions = {
  original: {},
  addition: {},
  replacement: {},
};

[
  'missionMarkerAddSingle',
  'missionMarkerBulkAdd',
  'patientMarkerAdd',
  'prisonerMarkerAdd',
  //'radioMessage',
  //'vehicleDrive',
  //'vehicleMarkerAdd'
].forEach((f) => {
  document.lss_helper.functions.original[f] = eval(f);
  document.lss_helper.functions.addition[f] = (a1, a2, a3) => {
    console.error(f, a1, a2, a3);
  };
  document.lss_helper.functions.replacement[f] = (a1, a2, a3) => {
    document.lss_helper.functions.original[f](a1, a2, a3);
    document.lss_helper.functions.addition[f](a1, a2, a3);
  };
  eval(f + '=document.lss_helper.functions.replacement.' + f + ';');
});

document.lss_helper.functions.addition.missionMarkerAddSingle = (a1) => {
  const mission = (document.lss_helper.missions ?? []).filter((f) => f.data.id === a1.id).pop();
  if (a1.missing_text && mission?.unattended) {
    console.warn('missionMarkerAddSingle', a1, mission);
  } else {
    console.log('missionMarkerAddSingle', a1, mission);
  }
};
document.lss_helper.functions.addition.patientMarkerAdd = (a1) => {
  const mission = (document.lss_helper.missions ?? []).filter((f) => f.data.id === a1.mission_id).pop();
  if (a1.missing_text && mission?.unattended) {
    console.warn('patientMarkerAdd', a1, mission);
  } else {
    console.log('patientMarkerAdd', a1, mission);
  }
};