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

  containerCall.style = document.lss_helper.getSetting('show_vehicle_call') ? '' : 'display:none';
  containerAvailable.style = document.lss_helper.getSetting('show_vehicle_available') ? '' : 'display:none';
  containerUnavailable.style = document.lss_helper.getSetting('show_vehicle_unavailable') ? '' : 'display:none';
  containerSummary.style = document.lss_helper.getSetting('show_vehicle_summary') ? '' : 'display:none';

  containerCall.innerHTML = '';
  containerAvailable.innerHTML = '';
  containerUnavailable.innerHTML = '';
  containerSummary.innerHTML = '';

  const itemsAvailable = {};
  const itemsInMotion = {};
  const itemsUnavailable = {};

  const itemsCall = document.lss_helper.vehicles.filter((v) => v.call);

  document.lss_helper.vehicles
    .filter((v) => v.available)
    .forEach((v) => {
      const idx = v.type;
      itemsAvailable[idx] = itemsAvailable[idx] || [];
      itemsAvailable[idx].push(v);
    });

  document.lss_helper.vehicles
    .filter((v) => !v.available)
    .filter((v) => v.status === '3')
    .forEach((v) => {
      const idx = v.type;
      itemsInMotion[idx] = itemsInMotion[idx] || [];
      itemsInMotion[idx].push(v);
    });

  document.lss_helper.vehicles
    .filter((v) => !v.available)
    .filter((v) => v.status === '4')
    .forEach((v) => {
      const idx = v.type;
      itemsUnavailable[idx] = itemsUnavailable[idx] || [];
      itemsUnavailable[idx].push(v);
    });

  if (document.lss_helper.getSetting('show_vehicle_call')) {
    Object.values(itemsCall).forEach((i) => {
      const li = document.createElement('li');
      li.classList = 'lss_call';
      li.innerHTML = (document.lss_helper.vehicleTypes[i.type] || i.type) + ' - ' + i.name;
      li.append(i.link);
      if (document.lss_helper.getSetting('show_vehicle_summary')) {
        containerSummary.append(li)
      } else if (document.lss_helper.getSetting('show_vehicle_available')) {
        containerAvailable.append(li)
      } else {
        containerCall.append(li);
      }
    });
  }

  Object.values(itemsAvailable)
    .map((i) => {
      const name = (document.lss_helper.vehicleTypes[i[0].type] || (i[0].type + ' - ' + i[0].name));
      return {
        sort: name,
        name: name,
        length: i.length,
      };
    })
    .sort((a, b) => a.sort < b.sort ? -1 : 1)
    .forEach((i) => {
      const li = document.createElement('li');
      li.classList = 'lss_available';
      li.innerHTML = document.lss_helper.helper.formatNumber(i.length) + ' ' + i.name;
      containerAvailable.append(li)
    });

  Object.values(itemsInMotion)
    .map((i) => {
      const name = (document.lss_helper.vehicleTypes[i[0].type] || (i[0].type + ' - ' + i[0].name));
      return {
        sort: name,
        name: name,
        length: i.length,
      };
    })
    .sort((a, b) => a.sort < b.sort ? -1 : 1)
    .forEach((i) => {
      const li = document.createElement('li');
      li.classList = 'lss_in_motion';
      li.innerHTML = document.lss_helper.helper.formatNumber(i.length) + ' ' + i.name;
      containerUnavailable.append(li)
    });

  Object.values(itemsUnavailable)
    .map((i) => {
      const name = (document.lss_helper.vehicleTypes[i[0].type] || (i[0].type + ' - ' + i[0].name));
      return {
        sort: name,
        name: name,
        length: i.length,
      };
    })
    .sort((a, b) => a.sort < b.sort ? -1 : 1)
    .forEach((i) => {
      const li = document.createElement('li');
      li.classList = 'lss_unavailable';
      li.innerHTML = document.lss_helper.helper.formatNumber(i.length) + ' ' + i.name;
      containerUnavailable.append(li)
    });

  Object.keys({ ...itemsAvailable, ...itemsInMotion, ...itemsUnavailable })
    .map((k) => {
      return {
        sort: (document.lss_helper.vehicleTypes[k] || k),
        name: (document.lss_helper.vehicleTypes[k] || k),
        available: itemsAvailable[k] ? itemsAvailable[k].length : 0,
        inMotion: itemsInMotion[k] ? itemsInMotion[k].length : 0,
        unavailable: itemsUnavailable[k] ? itemsUnavailable[k].length : 0,
      };
    })
    .map((i) => {
      return {
        ...i,
        sum: i.available + i.inMotion + i.unavailable,
      };
    })
    .sort((a, b) => a.sort < b.sort ? -1 : 1)
    .forEach((i) => {
      const li = document.createElement('li');
      containerSummary.append(li);

      const sum = document.createElement('b');
      const available = document.createElement('b');
      const unavailable = document.createElement('b');
      const inMotion = document.createElement('b');
      available.classList = 'lss_available';
      unavailable.classList = 'lss_unavailable';
      inMotion.classList = 'lss_in_motion';
      sum.innerHTML = document.lss_helper.helper.formatNumber(i.sum);
      available.innerHTML = document.lss_helper.helper.formatNumber(i.available);
      unavailable.innerHTML = document.lss_helper.helper.formatNumber(i.unavailable);
      inMotion.innerHTML = document.lss_helper.helper.formatNumber(i.inMotion);
      li.append(sum);
      if (i.available) {
        li.innerHTML += '/';
        li.append(available);
      }
      if (i.inMotion) {
        li.innerHTML += '/';
        li.append(inMotion);
      }
      if (i.unavailable) {
        li.innerHTML += '/';
        li.append(unavailable);
      }
      li.innerHTML += i.name;
    });
  };