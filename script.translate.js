document.lss_helper.language = document.lss_helper.language || 'de';
document.lss_helper.translationTable = {
  'de': {
    'Vehicles': 'Fahrzeuge',
    'Missions': 'Einsätze',
    'AutoAccept': 'Automatisierung',
    'General': 'Allgemein',
    'UI Elements': 'UI Elemente',
    'Other': 'Sonstiges',

    'show_vehicle_available': 'Verfügbare Fahrzeuge',
    'show_vehicle_unavailable': 'Nicht verfügbare Fahrzeuge',
    'show_vehicle_call': 'Fahrzeug-Alarmierung',
    'show_vehicle_summary': 'Fahrzeug-Übersicht',
    'show_vehicle_missing': 'Fehlende Fahrzeuge',

    'show_missions': 'Einsätze',
    'show_mission_unattended': 'Unbeaufsichtigte Einsätze',
    'show_mission_attended': 'Beaufsichtigte Einsätze',
    'show_mission_finishing': 'Abschließende Einsätze',
    'show_mission_unattended_alert': 'Unbeaufsichtigte Einsätze mit Alarm',
    'show_mission_attended_alert': 'Beaufsichtigte Einsätze mit Alarm',
    'show_mission_finishing_alert': 'Abschließende Einsätze mit Alarm',
    'show_mission_age': 'Alter des Einsatzes',
    'show_mission_credits': 'Credits des Einsatzes',
    'show_mission_credits_rate': 'Credits/Fahrzeug des Einsatzes',
    'show_mission_max_distance': 'Maximale Entfernung des Einsatzes',
    'show_mission_type': 'Einsatztyp',
    'show_mission_lf1': 'Einsätze für LF1',
    'show_mission_lf2': 'Einsätze für LF2',
    'mission_verband': 'Verbandseinsätze',
    'mission_sort': 'Einsatzsortierung',

    'autoAccept': 'Automatisch annehmen',
    'autoPatient': 'Automatisch Patienten zuweisen',
    'autoPrisoner': 'Automatisch Gefangene zuweisen',
    'autoPrisonerMission': 'Missions Gefangene',
    'autoResend': 'Automatisch nachsenden',
    'autoResendAll': 'Nachsenden wenn alle verfügbar',
    'optimize_scene': 'Einsätze optimieren',

    'ui_map': 'Karte',
    'ui_missions': 'Einsätze',
    'ui_buildings': 'Gebäude',
    'ui_chat': 'Chat',
    'ui_radio': 'Funk',
  },
};

document.lss_helper.translate = (key, lang) => {
  lang = lang || document.lss_helper.language;
  const translation = document.lss_helper.translationTable[lang] || {};
  return translation[key] || key;
};