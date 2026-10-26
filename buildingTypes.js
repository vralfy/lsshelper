document.lss_helper.buildingTypes = {
  '0': 'Feuerwehr',
  '1': 'Schule Feuerwehr',
  '2': 'Rettungsdienst',
  '3': 'Schule Rettungsdienst',
  '4': 'Krankenhaus',
  '5': 'Rettungshubschrauber',
  '6': 'Polizei',
  '7': 'Leitstelle',
  '8': 'Schule Polizei',
  '9': 'THW',
  '10': 'Schule THW',
  '11': 'Bereitschaftspolizei',
  '12': 'SEG',
  '13': 'Bereitschaftspolizei Helikopter',
  '14': 'Bereitstellungsraum',
  '15': 'Wasserretung',
  '17': 'Bereitschaftspolizei Sondereinheiten',
  '18': 'Feuerwehr (klein)',
  '19': 'Polizei (klein)',
  '20': 'Rettungsdienst (klein)',
  '21': 'Rettungshundestaffel',
  '24': 'Reiterstaffel',
  '25': 'Bergrettung',
  '26': 'Seenotrettung',
  '27': 'Schule Seenotrettung',
  '28': 'Seenotrettung Helikopter',
  '29': 'Autobahnpolizei',
};
//document.lss_helper.buildingTypes = document.lss_helper.buildingTypes ?? {};
document.lss_helper.buildingMeta = {};
(document.lss_helper?.buildings ?? []).forEach((b) => {
  document.lss_helper.buildingTypes[b.type] = document.lss_helper.buildingTypes[b.type] ?? b.name;
  document.lss_helper.buildingMeta[b.type] = {
    type: b.type,
    typeName: document.lss_helper.buildingTypes[b.type],
    amount: (document.lss_helper.buildingMeta[b.type]?.amount ?? 0) + 1
  }
});