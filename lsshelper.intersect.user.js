// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2025-06-11
// @description  try to take over the world!
// @author       You
// @match        https://www.leitstellenspiel.de/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leitstellenspiel.de
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    document.lss_helper = document.lss_helper || {};
    document.lss_helper.functions = {
        original: {},
        addition: {},
        replacement: {},
        create: (f) => {
            console.log('intersecting', f);
            document.lss_helper.functions.original[f] = eval(f);
            document.lss_helper.functions.addition[f] = (...args) => {
                console.error(f, ...args);
            };
            document.lss_helper.functions.replacement[f] = (...args) => {
                document.lss_helper.functions.original[f](...args);
                document.lss_helper.functions.addition[f](...args);
            };
            eval(f + '=document.lss_helper.functions.replacement.' + f + ';');
        },
    };

    [
        //'missionMarkerAddSingle',
        //'missionMarkerBulkAdd',
        //'patientMarkerAdd',
        //'prisonerMarkerAdd',
        //'radioMessage',
        //'vehicleDrive',
        //'vehicleMarkerAdd',
        //'vehicleDistanceDirectTimeToObject',
    ].forEach((f) => {
        document.lss_helper.functions.create(f);
    });

    document.lss_helper.functions.addition.missionMarkerAddSingle = (a1) => {
        const mission = (document.lss_helper.missions ?? []).filter((f) => f.data.id === a1.id).pop();
        if (a1.missing_text && mission?.unattended) {
            console.warn('missionMarkerAddSingle', a1, mission);
        } else {
            console.log('missionMarkerAddSingle', a1, mission);
        }
    };
    document.lss_helper.functions.addition.patientMarkerAdd = (a1) => {
        const mission = (document.lss_helper.missions ?? []).filter((f) => f.data.id === a1.mission_id).pop();
        if (a1.missing_text && mission?.unattended) {
            console.warn('patientMarkerAdd', a1, mission);
        } else {
            console.log('patientMarkerAdd', a1, mission);
        }
    };
})();
