document.lss_helper.autoPatient = (force) => {
    if (!force) {
        setTimeout(() => { document.lss_helper.autoPatient(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
    }
    if (!force && !document.lss_helper.getSetting('autoPatient')) {
        return;
    }
    document.lss_helper.debug('auto patient running');

    document.lss_helper.autoPatientHospital();
    document.lss_helper.autoPatientIntermediate();
};

document.lss_helper.autoPatientHospital = (_types) => {
    const alltypes = ["28", "38", "73", "74", "97"];
    ['31', '157'].forEach(t => alltypes.push(t)); // Helikopter
    ['150', '151', '152', '154', '155'].forEach(t => alltypes.push(t)); // Bergwacht
    const types = _types ?? alltypes;

    const call = document.lss_helper.vehicles.filter((v) => types.indexOf(v.type) >= 0).filter((v) => v.call).shuffle().pop();
    if (!call) {
        return;
    }
    const header = { method: 'GET', cache: "no-cache" };
    return fetch((document.lss_helper.url ?? 'https://www.leitstellenspiel.de') + '/vehicles/' + call.id, header)
        .then((response) => response.text())
        .then((html) => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const table = doc.querySelector('table#own-hospitals');
            if (!table) {
                return;
            }
            const button = Array.from(table.querySelectorAll('a.btn:not(.btn-danger):not(.btn-default):not(.btn-xs)')).shift();
            if (button) {
                document.lss_helper.info('sending to hospital', call.name);
                fetch(button.href, header)
                    .then((response) => response.text())
                    .then((json) => document.lss_helper.debug(json));
                return;
            }

            const table2 = doc.querySelector('table#alliance-hospitals');
            if (!table2) {
                return;
            }
            const button2 = Array.from(table2.querySelectorAll('a.btn:not(.btn-danger):not(.btn-default):not(.btn-xs)')).shift();
            if (button2) {
                document.lss_helper.info('sending to alliance hospital', call.name);
                fetch(button2.href, header)
                    .then((response) => response.text())
                    .then((json) => {
                        document.lss_helper.debug(json);
                        document.lss_helper.updateLists(-1);
                    });
                return;
            }
        });
}

document.lss_helper.autoPatientIntermediate = (_types) => {
    const alltypes = ['150', '151', '152', '154', '155']; // Bergwacht
    ['31', '157'].forEach(t => alltypes.push(t)); // Rettungs Helikopter
    ['61', '156'].forEach(t => alltypes.push(t)); // Polizei Helikopter

    const types = _types ?? alltypes;

    const call = document.lss_helper.vehicles.filter((v) => types.indexOf(v.type) >= 0).filter((v) => v.call).shuffle().pop();
    if (!call) {
        return;
    }

    const header = { method: 'GET', cache: "no-cache" };
    return fetch((document.lss_helper.url ?? 'https://www.leitstellenspiel.de') + '/vehicles/' + call.id, header)
        .then((response) => response.text())
        .then((html) => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const table = doc.querySelector('table#own-intermediate-stations');
            if (!table) {
                return;
            }
            const button = Array.from(table.querySelectorAll('a.btn:not(.btn-danger):not(.btn-default):not(.btn-xs)')).shift();
            if (button) {
                document.lss_helper.info('sending to intermediate station', call.name);
                fetch(button.href, header)
                    .then((response) => response.text())
                    .then((json) => document.lss_helper.debug(json));
                return;
            }

            const table2 = doc.querySelector('table#alliance-intermediate-stations');
            if (!table2) {
                return;
            }
            const button2 = Array.from(table2.querySelectorAll('a.btn:not(.btn-danger):not(.btn-default):not(.btn-xs)')).shift();
            if (button2) {
                document.lss_helper.info('sending to allianceintermediate station', call.name);
                fetch(button2.href, header)
                    .then((response) => response.text())
                    .then((json) => {
                        document.lss_helper.debug(json);
                        document.lss_helper.updateLists(-1);
                    });
                return;
            }
        });
};