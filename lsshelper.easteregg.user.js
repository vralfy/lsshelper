// ==UserScript==
// @name         Leitstellenspiel - EasterEgg
// @namespace    http://tampermonkey.net/
// @version      2025-08-25
// @description  This script tries to find easter eggs and collect them
// @author       You
// @match        https://www.leitstellenspiel.de/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leitstellenspiel.de
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  document.lss_helper_easteregg = {};

  document.lss_helper_easteregg.init = () => {
    let settingsContainer = document.getElementById('lss_helper_settings');
    if (!document.lss_helper || !settingsContainer) {
      console.warn('Leistellenspiel Helper not found');
      setTimeout(() => document.lss_helper_distribution.init(), 1000);
      return;
    }

    let btn = document.createElement("div");
    btn.id = "lss_helper_easteregg_btn";
    btn.classList = "col-sm-12 btn btn-xs btn-default";
    btn.innerHTML = "EasterEgg";
    settingsContainer.appendChild(btn);
    btn.onclick = () => {
      document.lss_helper_easteregg.search();
    };
  };

  document.lss_helper_easteregg.claim = (mission, html) => {
    if (html.indexOf('id="easter-egg-link"') > 0) {
      const header = { method: 'GET', cache: "no-cache" };
      const url = 'https://www.leitstellenspiel.de/missions/' + mission.data.id + '/claim_found_object_sync';
      fetch(url, header)
        .then((r) => r.text())
        .then((r) => {
          document.lss_helper.log('EasterEgg claimed', mission);
          document.lss_helper.info('EasterEgg claimed', mission.data.id, mission.data.caption);
        })
        .catch((err) => {
          document.lss_helper.error('unable to claim EasterEgg', mission, err);
        });
    }
  };

  document.lss_helper_easteregg.search = () => {
    document.lss_helper.info('Looking for EasterEggs');
    document.lss_helper.missions.forEach((m, idx) => {
      setTimeout(() => {
        document.lss_helper.log(idx, 'EasterEgg search for', m);
        const header = { method: 'GET', cache: "no-cache" };
        const url = 'https://www.leitstellenspiel.de/missions/' + m.data.id + '?ifs=at_fi&sd=a&sk=cr';
        fetch(url, header)
          .then((r) => r.text())
          .then((r) => {
            document.lss_helper_easteregg.claim(m, r);
          })
          .catch((err) => {
            document.lss_helper.error(err);
          });
      }, idx * 500);
    });
  };

    setTimeout(() => {
        document.lss_helper_easteregg.init();
    }, 2000);
    setInterval(() => {document.lss_helper_easteregg.search()}, 60000);
})();