document.lss_helper.getHelperContainer = () => {
  var container = document.getElementById('lss_helper');
  if (!container) {
      container = document.createElement("div");
      const buildings = document.getElementById('buildings_outer');
      buildings.insertAdjacentElement('afterend', container);
  }
  container.id = 'lss_helper';
  container.classList = 'col-sm-8 overview_outer bigMapWindow';
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