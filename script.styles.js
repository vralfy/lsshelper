document.lss_helper.updateStyle = () => {
  let style = document.getElementById('lss_helper_style');
  if (!style) {
      style = document.createElement('link');
      style.id = 'lss_helper_style';
      style.rel = 'stylesheet';
      style.type = 'text/css';
      document.getElementsByTagName('head')[0].appendChild(style);
  }

  let style_inline = document.getElementById('lss_helper_style_inline');
  if (style_inline) {
      style_inline.remove();
  }

  const repo = document.lss_helper.getSetting('repository', '"https://raw.githubusercontent.com/vralfy/lsshelper"');
  const channel = document.lss_helper.getSetting('channel', '"master"');
  style.href = repo + '/' + channel + '/lsshelper.css';

  fetch(style.href)
    .then((response) => response.text())
    .then((response) => {
      $('head').append('<style id="lss_helper_style_inline">' + response + '</style>');
      return response;
    })
    .catch((err) => {
        document.lss_helper.error(err);
    });
};
document.lss_helper.updateStyle();