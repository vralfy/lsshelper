// https://www.leitstellenspiel.de/buildings/{{schoolId}}
// https://www.leitstellenspiel.de/buildings/{{schoolId}}/schoolingEducationCheck?education={{educationId}}&only_building_id={{buildingId}}
document.lss_helper.educations = {
  '1': { // Feuerwehr
    '0': { // Feuerwehrwache
      '0': { name: 'GW-Messtechnik Lehrgang', required: 2 },
      '1': { name: 'GW-Gefahrgut Lehrgang', required: 2 },
      '2': { name: 'Höhenrettung Lehrgang' },
      '3': { name: 'ELW 2 Lehrgang', required: 3 },
      '4': { name: 'Wechsellader Lehrgang' },
      '5': { name: 'Dekon-P Lehrgang', required: 6 },
      '6': { name: 'Feuerwehrkran Lehrgang', required: 2 },
      '7': { name: 'GW-Wasserrettung Lehrgang' },
      '8': { name: 'GW-Taucher Lehrgang' },
      '9': { name: 'Notarzt-Ausbildung' },
      '10': { name: 'Flugfeldlöschfahrzeug-Ausbildung' },
      '11': { name: 'Rettungstreppen-Ausbildung' },
      '12': { name: 'Werkfeuerwehr-Ausbildung' },
      '13': { name: 'Intensivpflege' },
      '14': { name: 'NEA200 Fortbildung', required: 10 },
      '15': { name: 'Drohnen-Schulung' },
      '16': { name: 'Feuerwehr-Verpflegungseinheit' },
      '17': { name: 'Verpflegungshelfer' },
      '18': { name: 'Bahnrettung' },
    },
  },
  '3': { // Rettungsdienst
    '2': { // Rettungswache
      '0': { name: 'Notarzt', required: 5 },
      '1': { name: 'LNA', required: 1 },
      '2': { name: 'OrgL', required: 1 },
      '8': { name: 'Intensivpflege' },
      '12': { name: 'Höhenretter' },
      '14': { name: 'Bergrettung' },
    },
    '5': { // Rettungshubschrauber
      '13': { name: 'Windenoperator', required: 5 },
    },
    '12': { // SEG
      '3': { name: 'SEG ELW', required: 2 },
      '4': { name: 'SEG GW-San', required: 6 },
      '5': { name: 'GW-Wasserrettung', required: 12 },
      '6': { name: 'GW-Taucher', required: 4 },
      '7': { name: 'Rettungshundeführer', required: 10 },
      '9': { name: 'Drohnenoperator', required: 5 },
      '10': { name: 'Betreuungsdienst', required: 30 }, // Kombi: 9, LKW: 3x3, GW: 3x3
      '11': { name: 'Verpflegungshelfer', required: 30 },
      '15': { name: 'Technik und Sicherheit', required: 25 }, // GW: 5, LKW: 0, MTW: 7
    },
    '15': { // DLRG
      '6': { name: 'GW-Taucher', required: 4 },
      '5': { name: 'GW-Wasserrettung', required: 12 },
    },
  },
  '8': { // Polizei
    '6': { // Polizeiwache
      '6': { name: 'Hundeführer', required: 2 },
      '7': { name: 'Polizeimotorad', required: 2 },
      '9': { name: 'Kriminalpolizei', required: 2 },
      '10': { name: 'Dienstgruppenleitung', required: 2 },
      '11': { name: 'Reiterstaffel' },
    },
    '11': { // BePo
      '0': { name: 'Zugführer', required: 15 }, // 5*3
      '1': { name: 'Hundertschaftsführer', required: 10 },
      '3': { name: 'Wasserwerfer', required: 20 },
      '4': { name: 'SEK', required: 45 },
      '5': { name: 'MEK', required: 45 },
      '6': { name: 'Hundeführer', required: 15 }, // 5*3
      '13': { name: 'Lautsprecheroperator', required: 5 },
    },
    '13': { // BePo Heli
      '2': { name: 'Polizeihubschrauber', required: 5 },
      '8': { name: 'Brandbekämpfung', required: 5 },
      '12': { name: 'Windenoperator', required: 5 },
    },
    '17': { // BePo Sondereinheiten
      '1': { name: 'Hundertschaftsführer', required: 15 }, // 5*3
      '4': { name: 'SEK', required: 45 }, // ZF: 6*4, MTF: 9*2
      '5': { name: 'MEK', required: 45 },
      '6': { name: 'Hundeführer', required: 12 }, // 4*3
    },
  },
  '10': { // THW
    '9': { // THW
      '0': { name: 'Zugtrupp', required: 10 },
      '1': { name: 'Räumen', required: 10 },
      '2': { name: 'Wasserrettung' },
      '3': { name: 'Taucher', required: 2 },
      '4': { name: 'Rettungshunde', required: 10 },
      '5': { name: 'Wasserschaden/Pumpen', required: 10 },
      '6': { name: 'Schwere Bergung', required: 5 },
      '7': { name: 'Elektroversorgung', required: 5 },
      '8': { name: 'Unbemannte Luftfahrtsysteme', required: 5 },
      '9': { name: 'Führung und Kommunikation', required: 20 },
      '10': { name: 'Logistik-Verpflegung', required: 10 },
      '11': { name: 'Verpflegungshelfer', required: 10 },
    },
  },
};

document.lss_helper.checkEducation = (schoolType, buildingTypes, educationIds) => {
  const school = document.lss_helper.buildings.find((b) => b.type === schoolType);
  if (!school) {
    return;
  }
  const header = { method: 'GET', cache: "no-cache" };
  const regexInProgress = /([0-9]+) in Ausbildung/;
  const regexDone = /([0-9]+) ausgebildete Person/;
  buildingTypes = buildingTypes || Object.keys(document.lss_helper.educations[schoolType]);
  const queue = document.lss_helper.buildings.filter((b) => buildingTypes.includes(b.type)).map((building, bidx) => {
    const options = educationIds ? {} : document.lss_helper.educations[schoolType][building.type];
    if (educationIds) {
      educationIds.forEach((eid) => {
        if (document.lss_helper.educations[schoolType][building.type][eid]) {
          options[eid] = document.lss_helper.educations[schoolType][building.type][eid];
        }
      });
    }

    return Object.keys(options).map((educationId, eidx) => {
      const url = (document.lss_helper.url ?? 'https://www.leitstellenspiel.de') + '/buildings/' + school.id + '/schoolingEducationCheck?education=' + educationId + '&only_building_id=' + building.id;
      document.lss_helper.log('Checking education', url);
      return () => {
        setTimeout(() => {
          fetch(url, header).then((r) => r.text()).then((text) => {
            countInProgress = text.match(regexInProgress);
            countDone = text.match(regexDone);
            countInProgress = (countInProgress && countInProgress.length > 1) ? parseInt(countInProgress[1], 10) : 0;
            countDone = (countDone && countDone.length > 1) ? parseInt(countDone[1], 10) : 0;
            count = countInProgress + countDone;
            const lg = ((options[educationId].required ?? 0) <= count) ? document.lss_helper.debug : document.lss_helper.warn;
            lg(
              'Checked education', school.name, building.name, options[educationId].name,
              'in progress:', countInProgress, 'done:', countDone, 'total:', count,
              'required:', options[educationId].required ?? 'n/a'
            );

          }).catch((err) => { document.lss_helper.error(err); });
        }, (bidx * Object.keys(options).length + eidx) * 200);
      }
    });

  });

  return queue.flat();
};

document.lss_helper.educationFn = {
  dlrg: {
    all: () => document.lss_helper.checkEducation('3', ['15']).forEach(fn => fn()),
  },
  seg: {
    all: () => document.lss_helper.checkEducation('3', ['12']).forEach(fn => fn()),
    sani: () => document.lss_helper.checkEducation('3', ['12'], ['3', '4']).forEach(fn => fn()),
    bt: () => document.lss_helper.checkEducation('3', ['12'], ['10', '11']).forEach(fn => fn()),
  },
  polizei: {
    all: () => document.lss_helper.checkEducation('8', ['6']).forEach(fn => fn()),
  },
  bepo: {
    all: () => document.lss_helper.checkEducation('8', ['11', '13', '17']).forEach(fn => fn()),
  },
  thw: {
    all: () => document.lss_helper.checkEducation('10').forEach(fn => fn()),
    zugtrupp: () => document.lss_helper.checkEducation('10', ['9'], ['0']).forEach(fn => fn()),
  }
};