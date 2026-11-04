// temporary working file, ignore that
document.lss_helper.analyzeMissingInMission = (mission) => {
  const txt = (mission.info?.missing?.innerText ?? "").trim();
  const regexSpace = /\s+/g;

  const vehicles = (
    txt
      .split("\n")
      .filter((t) => t.indexOf("Fehlende Fahrzeuge") >= 0)
      .map((t) => t.replaceAll(/Fehlende Fahrzeuge:\s+/g, "").replaceAll(/Fehlendes Personal.*/g, ""))
      .pop() ?? ""
  )
    .split(",")
    .map((t) => t.trim())
    .map((t) => t.match(/(\d+)\s+(.*)/))
    .filter((t) => !!t)
    .map((mg) => ({
      count: parseInt(mg[1]),
      vehicles: mg[2]
        .split(",")
        .map((v) => v.trim())
        .pop()
        .replaceAll(regexSpace, " "),
    }))
    .reduce((acc, cur) => {
      acc[cur.vehicles] = (acc[cur.vehicles] ?? 0) + cur.count;
      return acc;
    }, {});

  const material = (
    txt
      .split("\n")
      .filter((t) => t.indexOf("Uns fehlt") >= 0)
      .map((t) => t.replaceAll(/Uns fehlt:\s+/g, ""))
      .pop() ?? ""
  )
    .split(",")
    .map((t) => t.trim())
    .map((t) => t.match(/(\d+)\s+(.*)/))
    .filter((t) => !!t)
    .map((mg) => ({
      count: parseInt(mg[1]),
      material: mg[2]
        .split(",")
        .map((v) => v.trim())
        .pop()
        .replaceAll(regexSpace, " "),
    }))
    .reduce((acc, cur) => {
      acc[cur.material] = (acc[cur.material] ?? 0) + cur.count;
      return acc;
    }, {});

  const personal = (
    txt
      .split("\n")
      .filter((t) => t.indexOf("Fehlendes Personal") >= 0)
      .map((t) => t.replaceAll(/Fehlende Fahrzeuge.*Fehlendes Personal:\s+/g, ""))
      .pop() ?? ""
  )
    .split(",")
    .map((t) => t.trim())
    .map((t) => t.match(/(\d+)x?\s+(.*)/))
    .filter((t) => !!t)
    .map((mg) => ({
      count: parseInt(mg[1]),
      personal: mg[2]
        .split(",")
        .map((v) => v.trim())
        .pop()
        .replaceAll(regexSpace, " "),
    }))
    .reduce((acc, cur) => {
      acc[cur.personal] = (acc[cur.personal] ?? 0) + cur.count;
      return acc;
    }, {});

  const patients = (mission.info?.patients?.innerText ?? "")
    .split("\n")
    .filter((t) => t.indexOf("Wir benötigen") >= 0)
    .map((t) => (t.startsWith("Wir") ? "1x " + t : t))
    .map((t) => t.replaceAll(/Wir benötigen:\s+/g, ""))
    .map((t) => t.match(/(\d+)x\s(.*)/))
    .filter((t) => !!t)
    .map((mg) => ({
      count: parseInt(mg[1]),
      vehicles: mg[2]
        .split(",")
        .map((v) => v.trim())
        .map((v) => v.replaceAll(regexSpace, " ")),
    }))
    .reduce((acc, cur) => {
      cur.vehicles.forEach((v) => (acc[v] = (acc[v] ?? 0) + cur.count));
      return acc;
    }, {});

  return {
    ...mission,
    missingTxt: txt,
    missingPatients: mission.info?.patients?.innerText ?? "",
    missing: {
      vehicles,
      material,
      personal,
      patients,
    },
  };
};

document.lss_helper.getResendMissionsWithAnalysis = () => {
  const interval = document.lss_helper.getSetting("autoResendIntervalTimeout", "300000");
  const sicherheitswache = document.lss_helper.getSetting("acceptSicherheitswache", "false");
  const now = new Date().getTime();
  return document.lss_helper.missions
    .filter((m) => m.unattended && m.hasAlert)
    .filter((m) => m.type !== "sicherheitswache" || sicherheitswache)
    .filter((m) => now - (document.lss_helper.lastMissionResend[m.data.id] ?? 0) > interval)
    .map((m) => {
      const resendGroups = {};
      const resendGroupsScene = {};
      m = document.lss_helper.analyzeMissingInMission(m);

      // Handle missing vehicles for patients
      if (Object.keys(m.missing.patients ?? {}).length > 0) {
        ["LNA", "OrgL"].forEach((vt) => {
          const vtk = vt.toUpperCase();
          const rsg = "rescue2";
          if (m.missing.patients[vt]) {
            resendGroups[rsg] = resendGroups[rsg] || [];
            resendGroups[rsg].push({ scene: vtk, count: 1 });
            delete m.resendScene[vtk];
          }
        });
        ["NEF", "RTW", "RTH"].forEach((vt) => {
          const vtk = vt.toUpperCase();
          const rsg = "rescue" + vtk;
          if (m.missing.patients[vt]) {
            resendGroups[rsg] = resendGroups[rsg] || [];
            resendGroups[rsg].push({ scene: vtk, count: m.missing.patients[vtk] });
            delete m.resendScene[vtk];
          }
        });
        if (m.missing.patients["Tragehilfe (z.B. durch ein LF)"]) {
          const rsg = "carry";
          resendGroups[rsg] = resendGroups[rsg] || [];
          resendGroups[rsg].push({ scene: "LF", count: m.missing.patients["Tragehilfe (z.B. durch ein LF)"] });
        }
      }

      // Handle missing material when no vehicles are missing
      if (Object.keys(m.missing.material ?? {}).length > 0 && Object.keys(m.missing.vehicles ?? {}).length < 1) {
        if (m.missing.material["l. Wasser"]) {
          resendGroups["water"] = [{ scene: "RESENDWATER", count: Math.ceil(m.missing.material["l. Wasser"] / 2000) }];
        } else if (m.missing.material["l/min Pumpenleistung"]) {
          resendGroups["pumps"] = [{ scene: "RESENDPUMP", count: Math.ceil(m.missing.material["l/min Pumpenleistung"] / 2000) }];
        } else if (m.missing.material["Sonderlöschmittel"]) {
          resendGroups["slf"] = [{ scene: "SLF", count: Math.ceil(m.missing.material["Sonderlöschmittel"] / 5000) }];
        }
      }

      if (Object.keys(m.missing.personal ?? {}).length > 0 && Object.keys(m.missing.vehicles ?? {}).length < 1) {
        if (m.missing.personal["Feuerwehrleute"] || m.missing.personal["Feuerwehrmann"]) {
          resendGroups["firefighter"] = [{ scene: "RESENDFIREFIGHTER", count: Math.ceil((m.missing.personal["Feuerwehrleute"] ?? 0 + m.missing.personal["Feuerwehrmann"] ?? 0) / 9) }];
        }
        if (m.missing.personal["Polizist"]) {
          resendGroups["police"] = [{ scene: "RESENDPOLICE", count: Math.ceil(m.missing.personal["Polizist"] / 2) }];
        }
        if (m.missing.personal["Betreuungshelfer"] || m.missing.personal["Verpflegungshelfer"]) {
          resendGroups["catering"] = [{ scene: "131", count: Math.ceil(Math.max(m.missing.personal["Betreuungshelfer"] ?? 0, m.missing.personal["Verpflegungshelfer"] ?? 0) / 9) }];
        }
        if (m.missing.personal["GW-Wasserrettung"]) {
          resendGroups["wasserrettung"] = [{ scene: "WASSERRETTUNG", count: Math.ceil(m.missing.personal["GW-Wasserrettung"] / 6) }];
        }
        if (m.missing.personal["Rettungsdienstler"]) {
          resendGroups["rescueservice"] = [{ scene: "RESCUESERVICE", count: Math.ceil(m.missing.personal["Rettungsdienstler"] / 9) }];
        }
      }

      if (m.missing.vehicles["Betreuungs- und Verpflegungsausstattung"] || m.missing.vehicles["Betreuungs- und Verpflegungsausstattungen"]) {
        resendGroups["catering"] = [{ scene: "AAOSEGBT", count: Math.ceil((m.missing.vehicles["Betreuungs- und Verpflegungsausstattung"] ?? 0 + m.missing.vehicles["Betreuungs- und Verpflegungsausstattungen"] ?? 0) / 1) }];
      }
      if (m.missing.vehicles["Radlader (BRmG R)"] > 0 && (m.missing.vehicles["LKW Kipper (LKW K 9)"] ?? 0) < 1) {
        resendGroups["radlader"] = [{ scene: "43", count: m.missing.vehicles["Radlader (BRmG R)"] }];
      }
      if (m.missing.vehicles["Anh FüLa"] > 0 && (m.missing.vehicles["FüKomKW"] ?? 0) < 1) {
        resendGroups["fuela"] = [{ scene: "146", count: m.missing.vehicles["Anh FüLa"] }];
      }
      if (m.missing.vehicles["Anh TeSi"] > 0 && (m.missing.vehicles["GW-TeSi"] ?? 0) < 1) {
        resendGroups["tesi"] = [{ scene: "174", count: m.missing.vehicles["Anh TeSi"] }];
      }
      if (m.missing.vehicles["FüKW (THW)"] > 0 || m.missing.vehicles["FmKW"] > 0 || m.missing.vehicles["MTW FGr K"] > 0) {
        resendGroups["fuekwthw"] = [{ scene: "AAOTHWF", count: Math.max(m.missing.vehicles["FüKW (THW)"] ?? 0, m.missing.vehicles["FmKW"] ?? 0, m.missing.vehicles["MTW FGr K"] ?? 0) }];
      }

      // if (missing.indexOf('Polizeipferd') > 0) {
      //   resendGroups['horse'] = [{ scene: 'HORSE', count: 1 }];
      // }

      return document.lss_helper.enrichResendMission(m, resendGroups, resendGroupsScene);
    });
};

document.lss_helper.getResendMissionsWithAnalysis().map((m) => ({
  missing: m.missing,
  resendGroups: m.resendGroups,
  title: m.data.caption,
  radlader: m.missing.vehicles["Radlader (BRmG R)"],
  m,
}));
