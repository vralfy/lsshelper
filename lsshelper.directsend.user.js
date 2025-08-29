// ==UserScript==
// @name         Leistellenspiel - Send Direct Fix
// @namespace    http://tampermonkey.net/
// @version      202508-29-01
// @description  Sometime incidents get stuck when vehicles are send twice. This fix resends all vehicles directly to the incident
// @author       You
// @match        https://www.leitstellenspiel.de/missions/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leitstellenspiel.de
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    document.lss_helper = document.lss_helper || {};

    document.lss_helper.getLinks = () => {
        return Array.from(document.getElementsByClassName('btn-xs')).filter((btn) => btn.href && btn.href.indexOf('vehicles') > 0 && btn.href.indexOf('next_mission=1&return=mission_new&sd=a&sk=cr') > 0);
    };

    document.lss_helper.directSend = () => {
        const btns = document.lss_helper.getLinks();
        btns.forEach((btn, idx) => setTimeout(() => {
            console.log(idx, btn);
            const header = { method: 'GET', cache: "no-cache" };
            return fetch(btn.href, header)
                .then((response) => response.text())
                .catch((err) => {
                    document.lss_helper.error(err);
                });
        }, idx*200));
    }

    document.lss_helper.createContainer = () => {
      var container = document.getElementById('lss_helper_direct_send');
        if (!container) {
            container = document.createElement("div");
            container.id = 'lss_helper_direct_send';
            container.classList = 'col-sm-8 overview_outer bigMapWindow';
            const buildings = document.getElementById('mission_progress_info');
            buildings.insertAdjacentElement('afterend', container);
        }

        var btn = document.getElementById('lss_helper_direct_send_btn');
        if (!btn && document.lss_helper.getLinks().length) {
            btn = document.createElement("button");
            btn.id = 'lss_helper_direct_send_btn';
            btn.innerText = 'Send Direct';
            btn.classList = 'btn btn-primary';
            btn.addEventListener('click', document.lss_helper.directSend);
            container.appendChild(btn);
        }
    };

    document.lss_helper.createContainer();
})();