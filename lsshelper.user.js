// ==UserScript==
// @name         Leistellenspiel Helper
// @namespace    http://tampermonkey.net/
// @version      202601-11-01
// @description  try to take over the world!
// @author       You
// @match        https://www.leitstellenspiel.de/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leitstellenspiel.de
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    document.lss_helper = {
        version: '202601-11-01',
        storage: localStorage,
        vehicleTypes: {
            "0": "🚒 LF20"
        },
        vehicles: [],
        vehicleGroups: {
            'TEST': [1, 2],
        },
        vehicleAAO: { "AAODEBUG": { "107": 2, "108": 3 } },
        vehicleResend: {},
        vehicleResendMissing: [],
        stateOrder: ['2', '1', '7', '3', '4', '5', '8', '9', '6'],
        statesAvailable: ['1', '2'],
        statesCall: ['5'],
        statesTransit: ['7'],
        vehicleStatesAvailable: {},
        vehicleSpeed: [
            { t: 49, s: 0.64 },
            { t: 636, s: 14.42 },
            { t: 370, s: 5.15 }
        ].map((o) => o.s / o.t).reduce((acc, cur) => acc + cur, 0) / 3,
        scenes: {
            "X": { "LF": 2 },
            "lf1": { "LF": 1 },
            "lf2": { "LF": 2 },
        },
        buildings: [],
        missions: [],
        helper: {
            formatNumber: (arg) => { return arg; },
            hash: () => { return '' + Math.floor(Math.random() * 1000000); },
            getDistance: (obj1, obj2) => 0,
        }
    };

    document.lss_helper.debug = console.debug;
    document.lss_helper.log = console.log;
    document.lss_helper.warn = console.warn;
    document.lss_helper.error = console.error;
    document.lss_helper.info = console.info;

    document.lss_helper.getSetting = (key, def) => {
        if (!localStorage.getItem('lss_helper_' + key)) {
            localStorage.setItem('lss_helper_' + key, def ?? 'false');
        }
        return JSON.parse(localStorage.getItem('lss_helper_' + key) ?? (def ?? 'false'));
    };

    document.lss_helper.setSetting = (key, def) => {
        localStorage.setItem('lss_helper_' + key, def ?? 'false');
    };

    document.lss_helper.setDefaultSetting = (key, def) => {
        const v = document.lss_helper.getSetting(key, def);
        document.lss_helper.setSetting(key, v ? v : def);
    };

    document.lss_helper.translate = (key, lang) => {
        return key;
    };

    document.lss_helper.init = () => {
        document.lss_helper.log('initiating');

        document.lss_helper.getSetting('ui_map', 'true');
        document.lss_helper.getSetting('ui_missions', 'true');
        document.lss_helper.getSetting('ui_buildings', 'true');
        document.lss_helper.getSetting('ui_chat', 'true');
        document.lss_helper.getSetting('ui_radio', 'true');

        document.lss_helper.getSetting('channel', '"master"');

        document.lss_helper.setSetting('autoAccept', 'false');
        document.lss_helper.setSetting('autoResend', 'false');
        document.lss_helper.getSetting('autoResendAll', 'true');
        document.lss_helper.setSetting('autoPatient', 'false');
        document.lss_helper.setSetting('autoPrisoner', 'false');

        document.lss_helper.setDefaultSetting('loglevel', '550');
        document.lss_helper.setDefaultSetting('updateInterval', '1000');
        document.lss_helper.setDefaultSetting('autoAcceptInterval', '5000');
        document.lss_helper.setDefaultSetting('autoAcceptMaxAttended', '5');
        document.lss_helper.setDefaultSetting('autoAcceptMaxDistance', '9999');
        document.lss_helper.setDefaultSetting('autoAcceptMaxUnits', '9999');
        document.lss_helper.setDefaultSetting('maxRTW', '99');
        document.lss_helper.setDefaultSetting('update_scenes', '100000');

        document.lss_helper.getSetting('mission_sort', '"none"');
        document.lss_helper.getSetting('show_vehicle_available', 'true');
        document.lss_helper.getSetting('show_vehicle_call', 'true');
        document.lss_helper.getSetting('show_vehicle_unavailable', 'true');
        document.lss_helper.getSetting('show_vehicle_summary', 'false');
        document.lss_helper.getSetting('show_vehicle_missing', 'false');
        document.lss_helper.getSetting('show_missions', 'true');

        document.lss_helper.getSetting('show_mission_age', 'true');
        document.lss_helper.getSetting('show_mission_credits', 'true');
        document.lss_helper.getSetting('show_mission_credits_rate', 'false');
        document.lss_helper.getSetting('show_mission_max_distance', 'false');
        document.lss_helper.getSetting('show_mission_lf1', 'true');
        document.lss_helper.getSetting('show_mission_lf2', 'true');
        document.lss_helper.getSetting('show_mission_type', 'true');
        document.lss_helper.getSetting('show_mission_unattended', 'true');
        document.lss_helper.getSetting('show_mission_attended', 'false');
        document.lss_helper.getSetting('show_mission_finishing', 'false');

        document.lss_helper.getSetting('mission_verband', 'false');
        document.lss_helper.getSetting('optimize_scene', 'false');
    };

    document.lss_helper.update = (timeout) => {
        if (timeout && timeout > 0) {
            document.lss_helper.debug('LSS Helper Update sheduled in', timeout, 'ms');
            setTimeout(() => { document.lss_helper.update(-1); }, timeout);
            return;
        }
        document.lss_helper.debug('LSS Helper Update', timeout);
        document.lss_helper.updateLists(-1);
        if (document.lss_helper.helper.hash() !== document.lss_helper.renderHash) {
            document.lss_helper.printVehicleList();
            document.lss_helper.printMissions();
            document.lss_helper.printMissingVehicles();
            document.lss_helper.printScene();
            document.lss_helper.renderHash = document.lss_helper.helper.hash();
        }

        ['map', 'missions', 'buildings', 'chat', 'radio']
            .forEach((s) => {
                const display = document.lss_helper.getSetting('ui_' + s, 'true') ? 'block' : 'none';
                if (document.getElementById(s + '_outer')?.style) {
                    document.getElementById(s + '_outer').style.display = display;
                }
            });

        ['unattended', 'attended', 'finishing']
            .forEach((s) => {
                const btn = document.getElementById('mission_select_' + s);
                if (!btn) {
                    return;
                }
                if (Array.from(btn.classList).indexOf('btn-success') < 0) {
                    btn.click();
                }
            });

        document.lss_helper.printSettings();
        if (!timeout && document.lss_helper.getSetting('updateInterval', '1000') > 0) {
            setTimeout(() => { document.lss_helper.update(); }, document.lss_helper.getSetting('updateInterval', '1000'));
        }
    };

    document.lss_helper.loadVehiclesMap = () => {
        if (document.lss_helper.vehiclesFetched) {
            return;
        }

        if (document.lss_helper.getSetting('scrollVehicles', 'true')) {
            const vehicleListElement = document.getElementById('building_panel_body');
            vehicleListElement.scrollTo(0, 0);

            const scrollInterval = setInterval(() => {
                if (vehicleListElement) {
                    document.lss_helper.log('Try to scroll down vehicle list');
                    const scroll = 400;
                    vehicleListElement.scrollTo(0, vehicleListElement.scrollTop + scroll);
                    if (vehicleListElement.scrollHeight < (vehicleListElement.scrollTop + 2 * scroll)) {
                        clearInterval(scrollInterval);
                        document.lss_helper.vehiclesFetched = true;
                    }
                }
            }, 500);
        } else {
            document.lss_helper.info('Update buildings');
            const buildings = document.lss_helper.buildings.map(b => 'building_ids[]=' + b.id).join('&');
            const params = {
                method: 'POST',
                body: new URLSearchParams(buildings),
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Csrf-token": document.lss_helper.authToken
                }
            };
            fetch('/buildings/vehiclesMap', params)
                .then((response) => response.text())
                .then((json) => {
                    eval(json);
                });
        }
        document.lss_helper.vehiclesFetched = true;
    };

    document.lss_helper.getBuildingsList = () => {
        return [];
    }

    document.lss_helper.getVehiclesList = () => {
        return [];
    }

    document.lss_helper.getMissionsList = () => {
        return [];
    }

    document.lss_helper.updateLists = (timeout) => {
        if (timeout && timeout > 0) {
            document.lss_helper.debug('LSS List Update sheduled in', timeout, 'ms');
            setTimeout(() => { document.lss_helper.updateLists(-1); }, timeout);
            return;
        }

        document.lss_helper.authToken = Array.from(document.getElementsByName('csrf-token'))[0].content;

        document.lss_helper.buildings = document.lss_helper.getBuildingsList();

        document.lss_helper.loadVehiclesMap();
        document.lss_helper.vehicles = document.lss_helper.getVehiclesList();

        document.lss_helper.missions = document.lss_helper.getMissionsList();
    };

    document.lss_helper.getHelperContainer = () => {
        var container = document.getElementById('lss_helper');
        if (!container) {
            container = document.createElement("div");
            container.id = 'lss_helper';
            container.classList = 'col-sm-8 overview_outer bigMapWindow';
            const buildings = document.getElementById('buildings_outer');
            buildings.insertAdjacentElement('afterend', container);
        }
        var innerContainer = document.getElementById('lss_helper_container');
        if (!innerContainer) {
            const panel = document.createElement('div');
            panel.classList = 'panel panel-default';
            container.append(panel);

            const panelHeader = document.createElement('div');
            panelHeader.classList = 'panel-heading big_map_window_head';
            panelHeader.innerHTML = 'Leitstellenspiel Helper';
            panelHeader.onclick = () => {
                document.lss_helper.updateLists(-1);
            };
            panel.append(panelHeader);

            const body = document.createElement('div');
            body.classList = 'panel-body';
            panel.append(body);

            const bsContainer = document.createElement('div');
            bsContainer.classList = "container-fluid";
            body.append(bsContainer);

            innerContainer = document.createElement('div');
            innerContainer.classList = 'row';
            innerContainer.id = 'lss_helper_container';
            bsContainer.append(innerContainer);
        }
        return innerContainer;
    };

    document.lss_helper.printSettingsButton = (setting, caption, cls, container) => {
        caption = caption || setting;
        cls = cls || 'col-sm-2';
        container = container || 'lss_helper_settings'
        let settingsContainer = document.getElementById(container);
        if (!settingsContainer) {
            const container = document.createElement('div');
            container.classList = 'col-sm-12 container-fluid';
            const main = document.lss_helper.getHelperContainer();
            main.appendChild(container);

            settingsContainer = document.createElement("div");
            settingsContainer.id = 'lss_helper_settings';
            settingsContainer.classList = 'row';
            container.appendChild(settingsContainer);
        }

        let btn = document.getElementById('lss_helper_settings_' + setting);
        if (!btn) {
            btn = document.createElement("div");
            btn.id = 'lss_helper_settings_' + setting;
            btn.innerHTML = caption;
            btn.onclick = () => {
                document.lss_helper.setSetting(setting, document.lss_helper.getSetting(setting) ? 'false' : 'true');
                document.lss_helper.renderHash = null;
            };
            settingsContainer.appendChild(btn);
        }
        btn.classList = cls + ' btn btn-xs ' + (document.lss_helper.getSetting(setting) ? 'btn-success' : 'btn-danger');
        return btn;
    };

    document.lss_helper.printSettingsNumberInput = (setting, caption, cls, container) => {
        caption = caption || setting;
        cls = cls || 'col-sm-3';
        container = container || 'lss_helper_settings'
        let settingsContainer = document.getElementById(container);
        if (!settingsContainer) {
            const container = document.createElement('div');
            container.classList = 'col-sm-12 container-fluid';
            const main = document.lss_helper.getHelperContainer();
            main.appendChild(container);

            settingsContainer = document.createElement("div");
            settingsContainer.id = 'lss_helper_settings';
            settingsContainer.classList = 'row';
            container.appendChild(settingsContainer);
        }

        let input = document.getElementById('lss_helper_settings_' + setting);
        if (!input) {
            const container = document.createElement('div');
            container.classList = cls;
            container.style = 'display: flex; flex-direction:column';
            container.innerHTML = caption + ': ';
            settingsContainer.appendChild(container);

            input = document.createElement("input");
            input.id = 'lss_helper_settings_' + setting;
            input.onblur = () => {
                document.lss_helper.setSetting(setting, input.value);
                document.lss_helper.renderHash = null;
            };
            container.appendChild(input);
        }

        const v = document.lss_helper.getSetting(setting, '0');
        if (input.value != v && input !== document.activeElement) {
            input.value = v;
        }

        return input;
    };

    document.lss_helper.printSettingsSelect = (setting, caption, cls, options, container) => {
        caption = caption || setting;
        cls = cls || 'col-sm-3';
        container = container || 'lss_helper_settings'
        let settingsContainer = document.getElementById(container);
        if (!settingsContainer) {
            const container = document.createElement('div');
            container.classList = 'col-sm-12 container-fluid';
            const main = document.lss_helper.getHelperContainer();
            main.appendChild(container);

            settingsContainer = document.createElement("div");
            settingsContainer.id = 'lss_helper_settings';
            settingsContainer.classList = 'row';
            container.appendChild(settingsContainer);
        }

        let input = document.getElementById('lss_helper_settings_' + setting);
        if (!input) {
            const container = document.createElement('div');
            container.classList = cls;
            container.style = 'display: flex; flex-direction:column';
            container.innerHTML = caption + ': ';
            settingsContainer.appendChild(container);

            input = document.createElement("select");
            input.id = 'lss_helper_settings_' + setting;
            input.onblur = () => {
                document.lss_helper.setSetting(setting, JSON.stringify(input.value));
                document.lss_helper.renderHash = null;
            };
            container.appendChild(input);

            options.forEach(option => {
                const opt = document.createElement("option");
                opt.value = option.value;
                opt.innerHTML = option.label ?? option.value;
                input.appendChild(opt);
            });
        }

        const v = document.lss_helper.getSetting(setting, '0');
        if (input.value != v && input !== document.activeElement) {
            input.value = v;
        }

        return input;
    };

    document.lss_helper.printSettings = () => {
        let settingsContainer = document.getElementById('lss_helper_settings');
        if (!settingsContainer) {
            const container = document.createElement('div');
            container.classList = 'col-sm-12 container-fluid';
            const main = document.lss_helper.getHelperContainer();
            main.appendChild(container);

            settingsContainer = document.createElement("div");
            settingsContainer.id = 'lss_helper_settings';
            settingsContainer.classList = 'row';
            container.appendChild(settingsContainer);
        }
    };

    document.lss_helper.printVehicleList = () => {
        const main = document.lss_helper.getHelperContainer();
        let containerCall = document.getElementById('lss_helper_vehicle_call');
        let containerAvailable = document.getElementById('lss_helper_vehicle_available');
        let containerUnavailable = document.getElementById('lss_helper_vehicle_unavailable');
        let containerSummary = document.getElementById('lss_helper_vehicle_summary');

        if (!containerCall) {
            containerCall = document.createElement("ul");
            containerCall.id = 'lss_helper_vehicle_call';
            containerCall.classList = 'col-sm-12';
            main.appendChild(containerCall);
        }
        if (!containerAvailable) {
            containerAvailable = document.createElement("ul");
            containerAvailable.id = 'lss_helper_vehicle_available';
            containerAvailable.classList = 'col-sm-6 col-md-3';
            main.appendChild(containerAvailable);
        }

        if (!containerUnavailable) {
            containerUnavailable = document.createElement("ul");
            containerUnavailable.id = 'lss_helper_vehicle_unavailable';
            containerUnavailable.classList = 'col-sm-6 col-md-3';
            main.appendChild(containerUnavailable);
        }

        if (!containerSummary) {
            containerSummary = document.createElement("ul");
            containerSummary.id = 'lss_helper_vehicle_summary';
            containerSummary.classList = 'col-sm-6 col-md-4';
            main.appendChild(containerSummary);
        }
    };

    document.lss_helper.printMissingVehicles = () => {
        const main = document.lss_helper.getHelperContainer();
        let container = document.getElementById('lss_helper_vehicle_missing');

        if (!container) {
            container = document.createElement("ul");
            container.id = 'lss_helper_vehicle_missing';
            container.classList = 'col-sm-12 col-md-3';
            main.appendChild(container);
        }
    };

    document.lss_helper.printMissions = () => {
        let missionsContainer = document.getElementById('lss_helper_missions');
        if (!missionsContainer) {
            missionsContainer = document.createElement("ul");
            missionsContainer.id = 'lss_helper_missions';
            missionsContainer.classList = 'col-sm-12 col-md-6';

            const main = document.lss_helper.getHelperContainer();
            main.appendChild(missionsContainer);
        }
    };

    document.lss_helper.printScene = (missionId) => {
        let sceneContainer = document.getElementById('lss_helper_scene');
        if (!sceneContainer) {
            sceneContainer = document.createElement("div");
            sceneContainer.id = 'lss_helper_scene';
            sceneContainer.classList = 'col-sm-12 container-fluid';

            const main = document.lss_helper.getHelperContainer();
            main.appendChild(sceneContainer);
        }
    };

    document.lss_helper.getScene = (scene, debug) => {
        if (!document.lss_helper.scenes[scene]) {
            return null;
        }
        scene = JSON.parse(JSON.stringify(document.lss_helper.scenes[scene]));

        return document.lss_helper.addAAOtoScene(scene, debug);
    };

    document.lss_helper.addAAOtoScene = (scene, debug) => {
        if (debug) {
            scene = { ...scene, "AAODEBUG": 2 };
        }
        const aao = Object.keys(scene)
            .filter(k => document.lss_helper.vehicleAAO[k])
            .map(k => ({ amount: scene[k], aao: document.lss_helper.vehicleAAO[k] }));
        aao.forEach(aao => {
            Object.keys(aao.aao).forEach((v) => { scene[v] = (scene[v] || 0) + aao.amount * aao.aao[v]; });
        });
        Object.keys(scene)
            .filter(k => document.lss_helper.vehicleAAO[k])
            .forEach(k => delete scene[k]);

        if (debug) {
            document.lss_helper.debug(scene, aao);
        }

        return scene;
    };

    document.lss_helper.getVehiclesByScene = (mission, scene, noFillOrKill, debug) => {
        mission = mission || {};
        mission.missing = {};
        let nonReplaceable = [];
        const vehicleCounts = {};
        const sortKey = 'time';

        if (document.lss_helper.getSetting('optimize_scene')) {
            let available = document.lss_helper.vehicles
                .filter((v) => v.available)
                .map((v) => {
                    return {
                        distance: document.lss_helper.helper.getDistance(mission, v),
                        time: vehicleDistanceDirectTimeToObject(20, mission.lat, mission.lng, v.lat, v.lng, true),
                        ...v,
                    };
                })
                .sort((v1, v2) => {
                    return v1[sortKey] - v2[sortKey];
                });
            const preVehicles = Object.keys(scene).map((vt) => {
                const groups = (document.lss_helper.vehicleGroups[vt] ?? [vt]).map((v) => '' + v);
                const r = available.filter((v) => groups.indexOf(v.type) >= 0).slice(0, scene[vt]);
                const ids = r.map(v => v.id);
                available = available.filter((v) => ids.indexOf(v.id) < 0);
                if (r.length < scene[vt]) {
                    mission.missing[vt] = scene[vt];
                }
                return r.length === scene[vt] ? r : null;
            }).filter((v) => v !== null).reduce((acc, cur) => [...acc, ...cur], []);

            preVehicles.forEach((v) => vehicleCounts[v.type] = (vehicleCounts[v.type] ?? 0) + 1);
            Object.keys(document.lss_helper.vehicleReplacements ?? {}).forEach((type) => {
                const vehicles = preVehicles.filter((v) => v.type === type);
                let max = 0;
                document.lss_helper.vehicleReplacements[type].forEach((r) => {
                    max = Math.max(max, scene[r] ?? 0);
                    scene[r] = (scene[r] ?? 0) - vehicles.length;
                });
                nonReplaceable = [...nonReplaceable, ...vehicles.slice(0, max)];
            });
        }

        const nonReplaceableIds = nonReplaceable.map((v) => v.id);
        let available = document.lss_helper.vehicles
            .filter((v) => nonReplaceableIds.indexOf(v.id) < 0)
            .filter((v) => v.available)
            .map((v) => {
                return {
                    distance: document.lss_helper.helper.getDistance(mission, v),
                    time: vehicleDistanceDirectTimeToObject(20, mission.lat, mission.lng, v.lat, v.lng, true),
                    ...v,
                };
            })
            .sort((v1, v2) => {
                return v1[sortKey] - v2[sortKey];
            });
        let vehicles = Object.keys(scene).filter((vt) => scene[vt] > 0).map((vt) => {
            const groups = (document.lss_helper.vehicleGroups[vt] ?? [vt]).map((v) => '' + v);
            const r = available.filter((v) => groups.indexOf(v.type) >= 0).slice(0, scene[vt]);
            const ids = r.map(v => v.id);
            available = available.filter((v) => ids.indexOf(v.id) < 0);
            if (r.length < scene[vt]) {
                mission.missing[vt] = scene[vt];
            }
            return r.length === scene[vt] ? r : null;
        });

        if (document.lss_helper.getSetting('optimize_scene') && nonReplaceable.length) {
            vehicles = [...vehicles, ...[nonReplaceable]];
        }

        //if (nonReplaceable.length) {
        //document.lss_helper.warn('counts', vehicleCounts, 'replacements', nonReplaceable, 'ids', nonReplaceableIds, 'scene', scene, 'send', vehicles);
        //}
        return JSON.parse(JSON.stringify((vehicles.filter((v) => v === null).length && !noFillOrKill) ? null : vehicles.filter((v) => v !== null)));
    };

    document.lss_helper.getVehiclesByMission = (mission, scene, noFillOrKill) => {
        scene = document.lss_helper.getScene(scene || (mission.missionType || 'X'));
        if (!scene) {
            return null;
        }

        const countLNA = document.lss_helper.vehicles.filter(v => v.type === '55').filter(v => v.available).length;
        const countORGL = document.lss_helper.vehicles.filter(v => v.type === '56').filter(v => v.available).length;
        const countELW = document.lss_helper.vehicles.filter(v => v.type === '59').filter(v => v.available).length;

        if (scene['RTW'] && mission.patients) {
            if (mission.patients > document.lss_helper.getSetting('maxRTW', 10) && countELW) {
                scene['SEGELW'] = 1;
            }
            scene['RTW'] = Math.min(mission.patients, document.lss_helper.getSetting('maxRTW', 10));
        } else if (scene['KTW'] && mission.patients) {
            scene['KTW'] = mission.patients;
        }

        if (countLNA && mission.patients >= 5) {
            scene['LNA'] = 1;
        }
        if (countORGL && mission.patients >= 10) {
            scene['ORGL'] = 1;
        }

        if (mission.prisoners) {
            scene['POL'] = mission.prisoners;
        }

        return document.lss_helper.getVehiclesByScene(mission, scene, noFillOrKill);
    };

    document.lss_helper.sendByScene = (mission, scene, noFillOrKill) => {
        const vehicles = document.lss_helper.getVehiclesByMission(mission, scene, noFillOrKill);
        if (vehicles) {
            document.lss_helper.warn('Sending:', mission.missionType, vehicles, mission);
            const v = vehicles.reduce((acc, cur) => [...acc, ...cur], []);
            document.lss_helper.sendVehicles(mission.missionId, v);
            document.lss_helper.updateLists(-1);
        } else {
            document.lss_helper.warn('Not enough vehicles');
        }
    };

    document.lss_helper.sendVehicles = (missionid, vehicles) => {
        const main = document.lss_helper.getHelperContainer();
        main.classList = [...Array.from(main.classList), 'sendVehicles'].join(' ');

        const url = "/missions/" + missionid + "/alarm";
        const body = {
            //utf8: "",
            authenticity_token: document.lss_helper.authToken,
            commit: "Alarmieren",
            next_mission: 0,
            next_mission_id: 0,
            alliance_mission_publish: 0,
            sk: "ac",
            sd: "d",
            ifs: "fi",
        };

        const vehicleids = vehicles.map((v) => new URLSearchParams('vehicle_ids[]') + v.id).join('&');
        fetch(url, { method: 'POST', body: new URLSearchParams(body) + '&' + vehicleids, headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" } })
            .then((response) => response.text())
            .then((json) => {
                document.lss_helper.debug(json);
                main.classList = Array.from(main.classList).filter((c) => c !== 'sendVehicles').join(' ');
                document.lss_helper.update(-1);
            })
    };

    document.lss_helper.fetchRemoteFile = (filename) => {
        document.lss_helper.debug('LSS Helper fetch', filename, 'from github');
        const header = { method: 'GET', cache: "no-cache" };
        // https://raw.githubusercontent.com/vralfy/lsshelper/refs/heads/master/lsshelper.user.js
        // https://github.com/vralfy/lsshelper/raw/master/lsshelper.user.js
        // https://raw.githubusercontent.com/vralfy/lsshelper/dev/lsshelper.user.js
        const repo = document.lss_helper.getSetting('repository', '"https://raw.githubusercontent.com/vralfy/lsshelper"');
        const channel = document.lss_helper.getSetting('channel', '"master"');
        return fetch(repo + '/' + channel + '/' + filename, header)
            .then((response) => response.text())
            .then((response) => { eval(response); return response; })
            .catch((err) => {
                document.lss_helper.error(err);
            });
    };

    document.lss_helper.fetchRemotes = () => {
        document.lss_helper.debug('LSS Helper fetch settings from github');
        setTimeout(() => { document.lss_helper.fetchRemotes(); }, Math.max(1000, document.lss_helper.getSetting('update_scenes', '100000')));
        if (document.lss_helper.getSetting('update_scenes', '100000') < 1) {
            return;
        }
        document.lss_helper.fetchRemoteFile('lsshelper.update.js');
    };

    document.lss_helper.autoAccept = (force) => {
        if (!force) {
            setTimeout(() => { document.lss_helper.autoAccept(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
        }
    };

    document.lss_helper.autoPatient = (force) => {
        if (!force) {
            setTimeout(() => { document.lss_helper.autoPatient(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
        }
    };

    document.lss_helper.autoPrisoner = (force) => {
        if (!force) {
            setTimeout(() => { document.lss_helper.autoPrisoner(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
        }
    };

    document.lss_helper.init();
    document.lss_helper.update();
    document.lss_helper.autoAccept();
    document.lss_helper.autoPatient();
    document.lss_helper.autoPrisoner();

    document.lss_helper.fetchRemotes();
})();
