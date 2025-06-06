document.lss_helper.autoAccept = (force) => {
  if (!force) {
      setTimeout(() => { document.lss_helper.autoAccept(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
  }
  const missionFrameOpen = Array.from(document.getElementById('lightbox_box').getElementsByTagName('iframe')).length > 0;

  if (!force && (!document.lss_helper.getSetting('autoAccept') || missionFrameOpen)) {
      return;
  }

  document.lss_helper.debug('auto accept running');
  const missions = document.lss_helper.missions
      .filter((m) => m.unattended && !m.hasAlerts)
      .filter((m) => document.lss_helper.scenes[m.missionType] && document.lss_helper.getVehiclesByMission(m, m.missionType))
      .filter((m) => document.lss_helper.getSetting('autoAcceptMaxDistance', '9999') >= m.maxDistance);
  if (missions.length < 1) {
      return;
  }
  const inProgress = document.lss_helper.missions.filter((m) => m.hasAlert || m.attended).length;
  const maxInProgress = document.lss_helper.getSetting('autoAcceptMaxAttended', '5');
  if (!force && maxInProgress > 0 && maxInProgress <= inProgress) {
      return;
  }
  const m = missions[0];
  document.lss_helper.debug('AutoAccept', inProgress, '/', maxInProgress, m.missionType, m, 'from', missions);
  document.lss_helper.sendByScene(m, m.missionType);
  document.lss_helper.updateLists(-1);
};