document.lss_helper.updateStyle = (repoUrl) => {
  let style = document.getElementById('lss_helper_style');
  if (!style) {
    style = document.createElement('link');
    style.id = 'lss_helper_style';
    style.rel = 'stylesheet';
    style.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(style);
  }

  const settingsRepo = document.lss_helper.getSetting('repository_url');
  const repo = settingsRepo ? settingsRepo : (repoUrl ?? "https://raw.githubusercontent.com/vralfy/lsshelper/refs/heads");
  const channel = document.lss_helper.getSetting('channel', '"master"');
  style.href = repo + '/' + channel + '/lsshelper.css';

  fetch(style.href)
    .then((response) => response.text())
    .then((response) => {
      let style_inline = document.getElementById('lss_helper_style_inline');
      if (!style_inline) {
        $('head').append('<style id="lss_helper_style_inline">' + response + '</style>');
      } else {
        style_inline.innerHTML = response;
      }

      return response;
    })
    .catch((err) => {
      document.lss_helper.error(err);
      if (!repoUrl) {
        setTimeout(() => { document.lss_helper.updateStyle('https://raw.githubusercontent.com/vralfy/lsshelper'); }, 10000);
      }
    });
};

document.lss_helper.updateStyle();