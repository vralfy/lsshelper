document.lss_helper.getResendMissions = () => {
    return document.lss_helper.missions
        .filter((m) => m.unattended && m.hasAlert)
        .filter((m) => m.type !== 'sicherheitswache')
        .map((m) => {
            const resendGroups = {};
            const resendGroupsScene = {};
            ['LNA', 'OrgL'].forEach((vt) => {
                const vtk = vt.toUpperCase();
                const rsg = 'rescue2';
                if (m.info?.patients?.innerText.indexOf(' ' + vt) >= 0) {
                    resendGroups[rsg] = (resendGroups[rsg] || []);
                    resendGroups[rsg].push({ scene: vtk, count: 1 });
                    delete m.resendScene[vtk];
                }
            });

            resendGroupsScene['rescue'] = m.info?.patients?.innerText
                .split("\n")
                .filter(t => t.indexOf('Wir benötigen') >= 0)
                .map(t => t.replaceAll(/Wir benötigen:\s+/g, ''))
                .map(t => t.match(/([0-9]+)x (.*)/))
                .filter(t => !!t)
                .map(mg => ({ count: parseInt(mg[1]), vehicles: mg[2].split(',').map(v => v.trim()) }))
                .map(mg => ({ ...mg, vehicles: mg.vehicles.filter(v => ['NEF', 'RTW', 'RTH'].indexOf(v) >= 0) }))
                .filter(mg => mg.vehicles.length > 0)
                .reduce((acc, cur) => { cur.vehicles.forEach(v => acc[v] = (acc[v] ?? 0) + cur.count); return acc; }, {});
            // ['NEF', 'RTW', 'RTH'].forEach((vt) => {
            // const vtk = vt.toUpperCase();
            // const rsg = 'rescue';
            // if (m.info?.patients?.innerText.indexOf(' ' + vt) >= 0) {
            //     resendGroups[rsg] = (resendGroups[rsg] || []);
            //     resendGroups[rsg].push({ scene: vtk, count: 1 });
            //     delete m.resendScene[vtk];
            // }
            // });

            const missing = m.info.missing.innerText.replaceAll(/\s+/g, ' ').trim();
            if (missing.indexOf('l. Wasser') > 0) {
                resendGroups['water'] = [{ scene: 'RESENDWATER', count: 1 }];
            } else if (missing.indexOf('Feuerwehrleute') > 0) {
                resendGroups['firefighter'] = [{ scene: 'RESENDFIREFIGHTER', count: 1 }];
            } else if (missing.indexOf('Sonderlöschmittel') > 0) {
                resendGroups['slf'] = [{ scene: 'SLF', count: 1 }];
            }

            Object.keys(resendGroups).forEach((rgk) => {
                m.resend = m.resend.filter((r) => r.scene.toUpperCase() !== rgk.toUpperCase());
                resendGroupsScene[rgk] = resendGroupsScene[rgk] || {};
                resendGroups[rgk].forEach((o) => {
                    resendGroupsScene[rgk][o.scene] = o.count;
                });
            });

            const resendGroupsVehicles = [
                ...Object.keys(resendGroupsScene).filter((k) => ['slf'].indexOf(k) < 0).map((k) => ({ key: k, fok: true })),
                { key: 'slf', fok: false },
            ].map((i) => {
                if (!resendGroupsScene[i.key]) {
                    return null;
                }
                return {
                    key: i.key,
                    vehicles: document.lss_helper.getVehiclesByScene(JSON.parse(JSON.stringify(m)), JSON.parse(JSON.stringify(document.lss_helper.addAAOtoScene(resendGroupsScene[i.key]))), i.fok),
                }
            }).filter((i) => !!i && i.vehicles?.length);

            return {
                ...m,
                resendGroups,
                resendGroupsScene,
                resendGroupsVehicles,
                resendVehicles: document.lss_helper.getVehiclesByScene(JSON.parse(JSON.stringify(m)), JSON.parse(JSON.stringify(document.lss_helper.addAAOtoScene(m.resendScene))), !document.lss_helper.getSetting('autoResendAll')),
            };
        });
};

document.lss_helper.autoAccept = (force) => {
    if (!force) {
        setTimeout(() => { document.lss_helper.autoAccept(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
    }
    const missionFrameOpen = Array.from(document.getElementById('lightbox_box').getElementsByTagName('iframe')).length > 0;

    if (!force && missionFrameOpen) {
        return;
    }

    if (document.lss_helper.getSetting('autoResend') && document.lss_helper.autoResend(force)) {
        return;
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
        document.lss_helper.info('sending vehicles to', m.data.caption);
        document.lss_helper.sendByScene(m, m.missionType);
        document.lss_helper.updateLists(-1);
    }
};

document.lss_helper.autoResend = (force) => {
    const missions = document.lss_helper
        .getResendMissions()
        .filter((m) => (m.resendGroupsVehicles ?? []).length || (m.resendVehicles ?? []).length);

    if (missions.length < 1) {
        return false;
    }
    const m = missions[Math.floor(Math.random() * missions.length)];
    document.lss_helper.debug('AutoResend', m.missionType, m);

    (m.resendGroupsVehicles ?? []).forEach((vehicles) => {
        if ((vehicles.vehicles ?? []).length < 1) {
            return;
        }

        const vehiclesReduced = (vehicles.vehicles ?? []).reduce((acc, cur) => [...acc, ...cur], []);
        document.lss_helper.info('resending', vehiclesReduced.length, 'vehicles to', m.data.caption, vehicles.key);
        document.lss_helper.sendVehicles(m.missionId, vehiclesReduced);
    });

    if ((m.resendVehicles ?? []).length) {
        const vehiclesReduced = (m.resendVehicles ?? []).reduce((acc, cur) => [...acc, ...cur], []);
        document.lss_helper.info('resending', vehiclesReduced.length, 'vehicles to', m.data.caption);
        document.lss_helper.sendVehicles(m.missionId, vehiclesReduced);
    }

    document.lss_helper.updateLists(-1);
    return true;
};

