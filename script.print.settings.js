document.lss_helper.printSettingsDivider = (caption, cls, container) => {
  caption = caption || '';
  cls = cls || 'col-sm-12';
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

  let divider = document.getElementById('lss_helper_settings_divider_' + caption);
  if (!divider) {
    divider = document.createElement("div");
    divider.id = 'lss_helper_settings_divider_' + caption;
    settingsContainer.appendChild(divider);
  }
  divider.classList = cls;
  divider.innerHTML = '<div class="separator">' + document.lss_helper.translate(caption) + '</div>';
  return divider;
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
    btn.onclick = () => {
      document.lss_helper.setSetting(setting, document.lss_helper.getSetting(setting) ? 'false' : 'true');
      document.lss_helper.renderHash = null;
    };
    settingsContainer.appendChild(btn);
  }
  btn.classList = cls + ' btn btn-xs ' + (document.lss_helper.getSetting(setting) ? 'btn-success' : 'btn-danger');
  btn.innerHTML = document.lss_helper.translate(caption);
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
    container.innerHTML = document.lss_helper.translate(caption) + ': ';
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
    container.innerHTML = document.lss_helper.translate(caption) + ': ';
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

  document.lss_helper.printSettingsDivider('Vehicles');
  document.lss_helper.printSettingsButton('show_vehicle_available');
  document.lss_helper.printSettingsButton('show_vehicle_unavailable');
  document.lss_helper.printSettingsButton('show_vehicle_call');
  document.lss_helper.printSettingsButton('show_vehicle_summary');
  document.lss_helper.printSettingsButton('show_vehicle_missing');

  document.lss_helper.printSettingsDivider('Missions');
  document.lss_helper.printSettingsButton('show_missions');
  ['unattended', 'attended', 'finishing'].forEach((state) => {
    document.lss_helper.printSettingsButton('show_mission_' + state);
    document.lss_helper.printSettingsButton('show_mission_' + state + '_alert');
  });
  document.lss_helper.printSettingsButton('show_mission_age');
  document.lss_helper.printSettingsButton('show_mission_credits');
  document.lss_helper.printSettingsButton('show_mission_credits_rate');
  document.lss_helper.printSettingsButton('show_mission_max_distance');
  document.lss_helper.printSettingsButton('show_mission_type');
  Object.keys(document.lss_helper.scenesDefault || {}).forEach((sceneKey) => {
    document.lss_helper.printSettingsButton('show_mission_' + sceneKey, 'Szene ' + document.lss_helper.scenesDefault[sceneKey]);
  });
  document.lss_helper.printSettingsButton('mission_verband');
  document.lss_helper.printSettingsButton('mission_stuck');
  document.lss_helper.printSettingsSelect('mission_sort', 'Sortierung', null, [
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

  document.lss_helper.printSettingsDivider('AutoAccept');
  document.lss_helper.printSettingsButton('autoResendAll', null, 'col-sm-6');
  document.lss_helper.printSettingsButton('optimize_scene', null, 'col-sm-6');

  document.lss_helper.printSettingsButton('autoAccept', null, 'col-sm-3 col-md-3');
  document.lss_helper.printSettingsButton('autoResend', null, 'col-sm-3 col-md-3');
  document.lss_helper.printSettingsButton('autoPatient', null, 'col-sm-3 col-md-3');
  document.lss_helper.printSettingsButton('autoPrisoner', null, 'col-sm-3 col-md-3');

  document.lss_helper.printSettingsNumberInput('autoAcceptInterval');
  document.lss_helper.printSettingsNumberInput('autoAcceptMaxAttended');
  document.lss_helper.printSettingsNumberInput('autoAcceptMaxDistance');
  document.lss_helper.printSettingsNumberInput('autoAcceptMaxUnits');
  document.lss_helper.printSettingsNumberInput('maxRTW');

  document.lss_helper.printSettingsDivider('General');
  document.lss_helper.printSettingsNumberInput('loglevel');
  document.lss_helper.printSettingsNumberInput('updateInterval');
  document.lss_helper.printSettingsNumberInput('update_scenes');

  document.lss_helper.printSettingsSelect('channel', 'Version', null, [
    { value: 'master', label: 'Stabil' },
    { value: 'dev', label: 'Instabil' },
  ]);

  document.lss_helper.printSettingsDivider('UI Elements');
  document.lss_helper.printSettingsButton('ui_map');
  document.lss_helper.printSettingsButton('ui_missions');
  document.lss_helper.printSettingsButton('ui_buildings');
  document.lss_helper.printSettingsButton('ui_chat');
  document.lss_helper.printSettingsButton('ui_radio');

  document.lss_helper.printSettingsDivider('Other');
  document.lss_helper.printSettingsButton('scrollVehicles');

  let hash = document.getElementById('lss_helper_settings_hash');
  if (!hash) {
    hash = document.createElement("div");
    hash.id = 'lss_helper_settings_hash';
    hash.classList = 'col-sm-2';
    settingsContainer.appendChild(hash);
  }
  hash.innerHTML = document.lss_helper.helper.hash();
};
