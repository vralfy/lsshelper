document.lss_helper.autoAccept = (force) => {
    if (!force) {
        setTimeout(() => { document.lss_helper.autoAccept(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
    }
    const missionFrameOpen = Array.from(document.getElementById('lightbox_box').getElementsByTagName('iframe')).length > 0;

    if (!force && missionFrameOpen) {
        return;
    }

    if (document.lss_helper.getSetting('autoResend')) {
        const resends = document.lss_helper.missions.filter((m) => m.resend?.length && m.resendVehicles?.length && m.unattended);
        if (resends.length > 0) {
            const m = resends[0];
            document.lss_helper.debug('AutoResend', m.missionType, m);
            const v = m.resendVehicles.reduce((acc, cur) => [...acc, ...cur], []);
            document.lss_helper.sendVehicles(m.missionId, v);
            document.lss_helper.updateLists(-1);
            return;
        }
    }

    if (force || document.lss_helper.getSetting('autoAccept')) {
        document.lss_helper.debug('auto accept running');
        const missions = document.lss_helper.missions
            .filter((m) => m.unattended && !m.hasAlert)
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
    }
};