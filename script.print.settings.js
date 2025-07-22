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

        const available = document.lss_helper.printSettingsButton('show_vehicle_available');
        const unavailable = document.lss_helper.printSettingsButton('show_vehicle_unavailable');
        const call = document.lss_helper.printSettingsButton('show_vehicle_call');
        const summary = document.lss_helper.printSettingsButton('show_vehicle_summary');
        const missions = document.lss_helper.printSettingsButton('show_missions');
        const age = document.lss_helper.printSettingsButton('show_mission_age');
        const credits = document.lss_helper.printSettingsButton('show_mission_credits');
        const creditsrate = document.lss_helper.printSettingsButton('show_mission_credits_rate');
        const maxDistance = document.lss_helper.printSettingsButton('show_mission_max_distance');
        const type = document.lss_helper.printSettingsButton('show_mission_type');
        const lf1 = document.lss_helper.printSettingsButton('show_mission_lf1');
        const lf2 = document.lss_helper.printSettingsButton('show_mission_lf2');
        const missing = document.lss_helper.printSettingsButton('show_vehicle_missing');
        const verband = document.lss_helper.printSettingsButton('mission_verband');
        const autoResendAll = document.lss_helper.printSettingsButton('autoResendAll');
        const optimize = document.lss_helper.printSettingsButton('optimize_scene', null, 'col-sm-12');

        const autoAccept = document.lss_helper.printSettingsButton('autoAccept', null, 'col-sm-3 col-md-3');
        const autoResend = document.lss_helper.printSettingsButton('autoResend', null, 'col-sm-3 col-md-3');
        const autoPatient = document.lss_helper.printSettingsButton('autoPatient', null, 'col-sm-3 col-md-3');
        const autoPrisoner = document.lss_helper.printSettingsButton('autoPrisoner', null, 'col-sm-3 col-md-3');

        const autoAccepInterval = document.lss_helper.printSettingsNumberInput('autoAcceptInterval');
        const autoAccepMaxAttend = document.lss_helper.printSettingsNumberInput('autoAcceptMaxAttended');
        const autoAccepMaxDistance = document.lss_helper.printSettingsNumberInput('autoAcceptMaxDistance');
        const loglevel = document.lss_helper.printSettingsNumberInput('loglevel');
        const updateInterval = document.lss_helper.printSettingsNumberInput('updateInterval');
        const updateScenes = document.lss_helper.printSettingsNumberInput('update_scenes');
        const maxRTW = document.lss_helper.printSettingsNumberInput('maxRTW');
        const sceneSort = document.lss_helper.printSettingsSelect('mission_sort', 'Sortierung', null, [
            { value: 'none', label: 'Standard' },
            { value: 'age', label: 'Alter' },
            { value: 'creditRate', label: 'Credits/Fahrzeug' },
            { value: 'credits', label: 'Credits' },
            { value: 'maxDistance', label: 'Entfernung' },
            { value: 'maxTime', label: 'Zeit' },
            { value: 'patients', label: 'Patienten' },
            { value: 'prisoners', label: 'Gefangene' },
            { value: 'vehicles', label: 'Fahrzeuge' },
            { value: 'missionId', label: 'Missions ID' },
            { value: 'missionType', label: 'Missions Typ' },
            { value: 'missionTitle', label: 'Missions Titel' },
        ]);
        const channel = document.lss_helper.printSettingsSelect('channel', 'Version', null, [
            { value: 'master', label: 'Stabil' },
            { value: 'dev', label: 'Instabil' },
        ]);

        document.lss_helper.printSettingsButton('ui_map');
        document.lss_helper.printSettingsButton('ui_missions');
        document.lss_helper.printSettingsButton('ui_buildings');
        document.lss_helper.printSettingsButton('ui_chat');
        document.lss_helper.printSettingsButton('ui_radio');

        let hash = document.getElementById('lss_helper_settings_hash');
        if (!hash) {
            hash = document.createElement("div");
            hash.id = 'lss_helper_settings_hash';
            hash.classList = 'col-sm-2';
            settingsContainer.appendChild(hash);
        }
        hash.innerHTML = document.lss_helper.helper.hash();
    };