document.lss_helper.printMissingVehicles = () => {
  const main = document.lss_helper.getHelperContainer();
  let container = document.getElementById('lss_helper_vehicle_missing');

  if (!container) {
    container = document.createElement("ul");
    container.id = 'lss_helper_vehicle_missing';
    container.classList = 'col-sm-12 col-md-3';
    main.appendChild(container);
  }

  container.style = document.lss_helper.getSetting('show_vehicle_missing') ? '' : 'display:none';
  container.innerHTML = '';

  const missing = {};
  document.lss_helper.missions
    .filter((m) => m.unattended)
    .filter((m) => !m.hasAlert)
    .filter((m) => Object.values(m.missing ?? {}).length)
    .forEach((m) => {
      Object.keys(m.missing).forEach((vt) => {
        missing[vt] = missing[vt] || 0;
        missing[vt] += m.missing[vt];
      });
    });

  Object.keys(missing).forEach((vt) => {
    const li = document.createElement('li');
    li.classList = 'lss_unavailable';
    container.appendChild(li);
    let name = vt;
    name = (document.lss_helper.vehicleGroups[name] ?? [name])[0] ?? name;
    name = document.lss_helper.vehicleTypes[name] ?? name;
    li.innerHTML =
      document.lss_helper.helper.formatNumber(missing[vt])
      + ' x '
      + name;
  });
};