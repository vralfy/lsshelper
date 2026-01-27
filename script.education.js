// https://www.leitstellenspiel.de/buildings/{{schoolId}}
// https://www.leitstellenspiel.de/buildings/{{schoolId}}/schoolingEducationCheck?education={{educationId}}&only_building_id={{buildingId}}
document.lss_helper.educations = {
  '1': { // Feuerwehr
    '0': { // Feuerwehrwache

    },
  },
  '3': { // Rettungsdienst
    '2': { // Rettungswache
      '1': { name: 'LNA' },
    },
    '5': { // Rettungshubschrauber
    },
    '12': { // SEG
    },
    '15': { // DLRG
    },
  },
  '8': { // Polizei
    '6': { // Polizeiwache
      '6': { name: 'Hundeführer' },
      '7': { name: 'Polizeimotorad' },
      '9': { name: 'Kriminalpolizei' },
      '10': { name: 'Dienstgruppenleitung' },
      '11': { name: 'Reiterstaffel' },
    },
    '11': { // BePo
      '0': { name: 'Zugführer' },
      '1': { name: 'Hundertschaftsführer' },
      '3': { name: 'Wasserwerfer' },
      '4': { name: 'SEK' },
      '5': { name: 'MEK' },
      '6': { name: 'Hundeführer' },
      '13': { name: 'Lautsprecheroperator' },
    },
    '13': { // BePo Heli
      '8': { name: 'Brandbekämpfung' },
      '12': { name: 'Windenoperator' },
    },
    '17': { // BePo Sondereinheiten
      '0': { name: 'Zugführer' },
      '1': { name: 'Hundertschaftsführer' },
      '4': { name: 'SEK' },
      '5': { name: 'MEK' },
      '6': { name: 'Hundeführer' },
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
  const regexDone = /([0-9]+) ausgebildete Personen/;
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
      const url = 'https://www.leitstellenspiel.de/buildings/' + school.id + '/schoolingEducationCheck?education=' + educationId + '&only_building_id=' + building.id;
      console.log('Checking education', url);
      return () => {
        setTimeout(() => {
          fetch(url, header).then((r) => r.text()).then((text) => {
            countInProgress = text.match(regexInProgress);
            countDone = text.match(regexDone);
            countInProgress = (countInProgress && countInProgress.length > 1) ? parseInt(countInProgress[1], 10) : 0;
            countDone = (countDone && countDone.length > 1) ? parseInt(countDone[1], 10) : 0;
            count = countInProgress + countDone;
            const lg = ((options[educationId].required ?? 0) <= count) ? console.log : console.warn;
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

//document.lss_helper.checkEducation('10').forEach(fn => fn()); // THW
//document.lss_helper.checkEducation('10', ['9'], ['0']).forEach(fn => fn()); // THW - THW - Zugtrupp