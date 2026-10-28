document.lss_helper.lastMissionSend = document.lss_helper.lastMissionSend || {};
document.lss_helper.lastMissionResend =
  document.lss_helper.lastMissionResend || {};

document.lss_helper.analyzeMissingInMission = (mission) => {
  const txt = (mission.info?.missing?.innerText ?? "").trim();

  const vehicles = (
    txt
      .split("\n")
      .filter((t) => t.indexOf("Fehlende Fahrzeuge") >= 0)
      .map((t) => t.replaceAll(/Fehlende Fahrzeuge:\s+/g, ""))
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
        .pop(),
    }));
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
        .pop(),
    }));
  const personal = (
    txt
      .split("\n")
      .filter((t) => t.indexOf("Fehlendes Personal") >= 0)
      .map((t) => t.replaceAll(/Fehlendes Personal:\s+/g, ""))
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
        .pop(),
    }));

  const patients = (mission.info?.patients?.innerText ?? "")
    .split("\n")
    .filter((t) => t.indexOf("Wir benötigen") >= 0)
    .map((t) => (t.startsWith("Wir") ? "1x " + t : t))
    .map((t) => t.replaceAll(/Wir benötigen:\s+/g, ""));
  // .map(t => t.match(/(\d+)x\s(.*)/))
  // .filter(t => !!t)
  // .map(mg => ({ count: parseInt(mg[1]), vehicles: mg[2].split(',').map(v => v.trim()) }))
  return {
    mission,
    txt,
    txt2: mission.info?.patients?.innerText ?? "",
    missing: {
      vehicles,
      material,
      personal,
      patients,
    },
  };
};
document.lss_helper.missions
  .filter((m) => m.info?.missing.innerText)
  .map((m) => document.lss_helper.analyzeMissingInMission(m));

document.lss_helper.getResendMissions = () => {
  const interval = document.lss_helper.getSetting(
    "autoResendIntervalTimeout",
    "300000",
  );
  const sicherheitswache = document.lss_helper.getSetting(
    "acceptSicherheitswache",
    "false",
  );
  const now = new Date().getTime();
  return document.lss_helper.missions
    .filter((m) => m.unattended && m.hasAlert)
    .filter((m) => m.type !== "sicherheitswache" || sicherheitswache)
    .filter(
      (m) =>
        now - (document.lss_helper.lastMissionResend[m.data.id] ?? 0) >
        interval,
    )
    .map((m) => {
      const resendGroups = {};
      const resendGroupsScene = {};
      const missing = m.info.missing.innerText.replaceAll(/\s+/g, " ").trim();

      const patientsInfo = (m.info?.patients?.innerText ?? "")
        .split("\n")
        .filter((t) => t.indexOf("Wir benötigen") >= 0)
        .map((t) => (t.startsWith("Wir") ? "1x " + t : t))
        .map((t) => t.replaceAll(/Wir benötigen:\s+/g, ""))
        .map((t) => t.match(/([0-9]+)x (.*)/))
        .filter((t) => !!t)
        .map((mg) => ({
          count: parseInt(mg[1]),
          vehicles: mg[2].split(",").map((v) => v.trim()),
        }));

      ["LNA", "OrgL"].forEach((vt) => {
        const vtk = vt.toUpperCase();
        const rsg = "rescue2";
        if (m.info?.patients?.innerText.indexOf(" " + vt) >= 0) {
          resendGroups[rsg] = resendGroups[rsg] || [];
          resendGroups[rsg].push({ scene: vtk, count: 1 });
          delete m.resendScene[vtk];
        }
      });

      [["NEF"], ["RTW"], ["RTH"]].forEach((vt) => {
        resendGroupsScene["rescue" + vt.join("-")] = patientsInfo
          .map((mg) => ({
            ...mg,
            vehicles: mg.vehicles.filter((v) => vt.indexOf(v) >= 0),
          }))
          .filter((mg) => mg.vehicles.length > 0)
          .reduce((acc, cur) => {
            cur.vehicles.forEach((v) => (acc[v] = (acc[v] ?? 0) + cur.count));
            return acc;
          }, {});
      });

      if (missing.indexOf("l. Wasser") > 0 && missing.indexOf("TLF-W") < 0) {
        resendGroups["water"] = [{ scene: "RESENDWATER", count: 1 }];
      } else if (
        missing.indexOf("Feuerwehrleute") > 0 ||
        missing.indexOf("Feuerwehrmann") > 0
      ) {
        resendGroups["firefighter"] = [
          { scene: "RESENDFIREFIGHTER", count: 1 },
        ];
      } else if (missing.indexOf("Sonderlöschmittel") > 0) {
        resendGroups["slf"] = [{ scene: "SLF", count: 1 }];
      }

      if (missing.indexOf("Verpflegungsausstattung") > 0) {
        // resendGroups['catering'] = [{ scene: 'AAOSEGBT', count: 1 }];
      } else if (
        missing.indexOf("Betreuungshelfer") > 0 ||
        missing.indexOf("Verpflegungshelfer") > 0
      ) {
        resendGroups["catering"] = [{ scene: "131", count: 1 }];
      }

      // if trailer is missing; add towing vehicle to vehicleResend.js
      if (
        missing.indexOf("Radlader (BRmG R)") > 0 &&
        missing.indexOf("LKW Kipper (LKW K 9)") < 0
      ) {
        resendGroups["radlader"] = [{ scene: "43", count: 1 }];
      }

      if (missing.indexOf("Polizeipferd") > 0) {
        resendGroups["horse"] = [{ scene: "HORSE", count: 1 }];
      }

      // if trailer is missing; add towing vehicle to vehicleResend.js
      if (missing.indexOf("Anh FüLa") > 0 && missing.indexOf("FüKomKW") < 0) {
        resendGroups["fuela"] = [{ scene: "146", count: 1 }];
      }

      // if trailer is missing; add towing vehicle to vehicleResend.js
      if (missing.indexOf("Anh TeSi") > 0 && missing.indexOf("GW-TeSi") < 0) {
        resendGroups["tesi"] = [{ scene: "174", count: 1 }];
      }

      //1 FüKW (THW), 1 FmKW, 1 MTW FGr K
      if (
        missing.indexOf("FüKW (THW)") > 0 ||
        missing.indexOf("FmKW") > 0 ||
        missing.indexOf("MTW FGr K") > 0
      ) {
        resendGroups["fuekwthw"] = [{ scene: "AAOTHWF", count: 1 }];
      }

      // Fehlendes Personal: 2 GW-Wasserrettung
      if (missing.indexOf("Fehlendes Personal:") >= 0) {
        const missingPersonel = missing
          .replace(/.*Fehlendes Personal:/, "")
          .split(",")
          .map((v) => v.trim());
        missingPersonel
          .map((v) => v.match(/([0-9]+) (.*)/))
          .filter((v) => !!v)
          .map((v) => ({ count: parseInt(v[1]), personal: v[2].trim() }))
          .forEach((mg) => {
            if (mg.personal.indexOf("GW-Wasserrettung") >= 0) {
              resendGroups["wasserrettung"] = [
                { scene: "WASSERRETTUNG", count: Math.ceil(mg.count / 6) },
              ];
            }
            if (mg.personal.indexOf("Rettungsdienstler") >= 0) {
              resendGroups["rescueservice"] = [
                { scene: "RESCUESERVICE", count: Math.ceil(mg.count / 9) },
              ];
            }
          });
      }

      const carry =
        patientsInfo.filter(
          (p) => p.vehicles.indexOf("Tragehilfe (z.B. durch ein LF)") >= 0,
        ).length > 0;
      if (carry) {
        resendGroups["carry"] = [{ scene: "LF", count: 1 }];
      }

      return document.lss_helper.enrichResendMission(
        m,
        resendGroups,
        resendGroupsScene,
      );
    });
};

document.lss_helper.enrichResendMission = (
  m,
  resendGroups,
  resendGroupsScene,
) => {
  Object.keys(resendGroups).forEach((rgk) => {
    m.resend = m.resend.filter(
      (r) => r.scene.toUpperCase() !== rgk.toUpperCase(),
    );
    resendGroupsScene[rgk] = resendGroupsScene[rgk] || {};
    resendGroups[rgk].forEach((o) => {
      resendGroupsScene[rgk][o.scene] = o.count;
    });
  });

  const maxRTW = parseInt("" + document.lss_helper.getSetting("maxRTW", "99"));
  Object.keys(resendGroupsScene).forEach((k) => {
    ["RTW", "NEF", "RTH"].forEach((t) => {
      if (resendGroupsScene[k][t]) {
        resendGroupsScene[k][t] = Math.min(resendGroupsScene[k][t], maxRTW);
      }
    });
  });

  const fok = document.lss_helper.getSetting("autoResendAll", "true");
  const resendGroupsVehicles = [
    ...Object.keys(resendGroupsScene)
      .filter((k) => ["slf"].indexOf(k) < 0)
      .map((k) => ({ key: k, fok })),
    { key: "slf", fok: false },
    { key: "rescueRTH", fok: false },
    // { key: 'rescueRTW', fok: false },
    // { key: 'rescueNEF', fok: false },
  ]
    .map((i) => {
      if (!resendGroupsScene[i.key]) {
        return null;
      }
      return {
        key: i.key,
        vehicles: document.lss_helper.getVehiclesByScene(
          JSON.parse(JSON.stringify(m)),
          JSON.parse(
            JSON.stringify(
              document.lss_helper.addAAOtoScene(resendGroupsScene[i.key]),
            ),
          ),
          i.fok,
        ),
      };
    })
    .filter((i) => !!i && i.vehicles?.length);

  return {
    ...m,
    resendGroups,
    resendGroupsScene,
    resendGroupsVehicles,
    resendVehicles: document.lss_helper.getVehiclesByScene(
      JSON.parse(JSON.stringify(m)),
      JSON.parse(
        JSON.stringify(document.lss_helper.addAAOtoScene(m.resendScene)),
      ),
      !document.lss_helper.getSetting("autoResendAll"),
    ),
  };
};

document.lss_helper.autoAccept = (force) => {
  if (
    document.lss_helper.sending_vehicles ||
    !document.lss_helper.lists_updated
  ) {
    document.lss_helper.debug(
      "Sending vehicles is already in progress or lists not updated yet",
    );
    setTimeout(
      () => {
        document.lss_helper.autoAccept();
      },
      document.lss_helper.getSetting("autoAcceptInterval", "5000"),
    );
    return false;
  }
  const interval = document.lss_helper.getSetting(
    "autoAcceptIntervalTimeout",
    "300000",
  );
  const now = new Date().getTime();
  document.lss_helper.lastMissionSend =
    document.lss_helper.lastMissionSend || {};
  Object.keys(document.lss_helper.lastMissionSend || {})
    .filter((k) => now - document.lss_helper.lastMissionSend[k] > interval)
    .forEach((k) => {
      delete document.lss_helper.lastMissionSend[k];
    });

  if (!force) {
    setTimeout(
      () => {
        document.lss_helper.autoAccept();
      },
      document.lss_helper.getSetting("autoAcceptInterval", "5000"),
    );
  }

  if (!force && !document.lss_helper.vehiclesFetched) {
    return;
  }

  const missionFrameOpen =
    Array.from(
      document.getElementById("lightbox_box").getElementsByTagName("iframe"),
    ).length > 0;

  if (!force && missionFrameOpen) {
    return;
  }

  if (
    document.lss_helper.getSetting("autoResend") &&
    document.lss_helper.autoResend(force)
  ) {
    return;
  }

  if (force || document.lss_helper.getSetting("autoAccept")) {
    document.lss_helper.debug("auto accept running");
    const maxDistance = parseInt(
      document.lss_helper.getSetting("autoAcceptMaxDistance", "9999"),
    );
    const maxUnits = parseInt(
      document.lss_helper.getSetting("autoAcceptMaxUnits", "99999"),
    );
    const maxInProgress = document.lss_helper.getSetting(
      "autoAcceptMaxAttended",
      "5",
    );
    const inProgress = document.lss_helper.missions.filter(
      (m) => m.hasAlert || m.attended,
    ).length;

    const missions = document.lss_helper.missions
      .filter((m) => m.unattended && !m.hasAlert)
      .filter((m) => !!m.maxDistance)
      .filter((m) => document.lss_helper.scenes[m.missionType])
      .filter(
        (m) =>
          now - (document.lss_helper.lastMissionSend[m.data.id] ?? 0) >
          interval,
      )
      .filter(
        (m) => m.proposedVehiclesCount && m.proposedVehiclesCount <= maxUnits,
      )
      .filter(
        (m) =>
          maxDistance >=
          document.lss_helper.helper.getDistanceInKm(m.maxDistance),
      )
      .filter((m) =>
        document.lss_helper.getVehiclesByMission(m, m.missionType),
      );
    if (missions.length < 1) {
      return;
    }

    if (!force && maxInProgress > 0 && maxInProgress <= inProgress) {
      return;
    }
    const m = missions.shuffle().pop();
    document.lss_helper.debug(
      "AutoAccept",
      inProgress,
      "/",
      maxInProgress,
      m.missionType,
      m,
      "from",
      missions,
    );
    document.lss_helper.info("sending vehicles to", m.data.caption);
    document.lss_helper.sendByScene(m, m.missionType);
    document.lss_helper.lastMissionSend[m.data.id] = new Date().getTime();
    //const amountOfVehicles = Math.max((m.resendVehicles ?? []).length, 5);
    //setTimeout(() => document.lss_helper.updateLists(-1), 200 * amountOfVehicles);
  }
};

document.lss_helper.autoResend = (_force) => {
  if (
    document.lss_helper.sending_vehicles ||
    !document.lss_helper.lists_updated
  ) {
    document.lss_helper.debug(
      "Sending vehicles is already in progress or lists not updated yet",
    );
    return false;
  }
  const interval = document.lss_helper.getSetting(
    "autoResendIntervalTimeout",
    "300000",
  );
  const now = new Date().getTime();
  document.lss_helper.lastMissionResend =
    document.lss_helper.lastMissionResend || {};
  Object.keys(document.lss_helper.lastMissionResend || {})
    .filter((k) => now - document.lss_helper.lastMissionResend[k] > interval)
    .forEach((k) => {
      delete document.lss_helper.lastMissionResend[k];
    });

  const missions = document.lss_helper
    .getResendMissions()
    .filter(
      (m) =>
        (m.resendGroupsVehicles ?? []).length ||
        (m.resendVehicles ?? []).length,
    )
    .filter(
      (m) =>
        now - (document.lss_helper.lastMissionResend[m.data.id] ?? 0) >
        interval,
    );

  if (missions.length < 1) {
    return false;
  }
  const m = missions.shuffle().pop();
  document.lss_helper.debug("AutoResend", m.missionType, m);

  const resendVehicleMap = {};

  (m.resendGroupsVehicles ?? []).forEach((vehicles) => {
    if ((vehicles.vehicles ?? []).length < 1) {
      return;
    }

    const vehiclesReduced = (vehicles.vehicles ?? []).reduce(
      (acc, cur) => [...acc, ...cur],
      [],
    );
    document.lss_helper.info(
      "resending",
      vehiclesReduced.length,
      "vehicles to",
      m.data.caption,
      vehicles.key,
      m.resendGroupsScene[vehicles.key],
    );
    vehiclesReduced.forEach((vehicle) => {
      resendVehicleMap[vehicle.id] = vehicle;
    });
  });

  const amountOfVehicles = (m.resendVehicles ?? []).length;
  if (amountOfVehicles) {
    const vehiclesReduced = (m.resendVehicles ?? []).reduce(
      (acc, cur) => [...acc, ...cur],
      [],
    );
    document.lss_helper.info(
      "resending",
      vehiclesReduced.length,
      "vehicles to",
      m.data.caption,
      m.resendScene,
    );
    vehiclesReduced.forEach((vehicle) => {
      resendVehicleMap[vehicle.id] = vehicle;
    });
  }

  const resendVehicles = Object.values(resendVehicleMap);
  if (resendVehicles.length) {
    document.lss_helper.sendVehicles(m.missionId, resendVehicles);
    document.lss_helper.lastMissionResend[m.data.id] = new Date().getTime();
  }

  //setTimeout(() => document.lss_helper.updateLists(-1), 200 * Math.max(amountOfVehicles, 5));
  return true;
};

document.lss_helper.autoVerband = () => {
  if (
    !document.lss_helper.makeGreenVerband ||
    !document.lss_helper.makeVerband
  ) {
    return;
  }
  if (!document.lss_helper.getSetting("autoVerband")) {
    return;
  }
  document.lss_helper.makeGreenVerband();
};
document.lss_helper.autoVerbandInterval =
  document.lss_helper.autoVerbandInterval ||
  setInterval(() => {
    document.lss_helper.autoVerband();
  }, 5000);

document.lss_helper.fixNullVerband = () => {
  // Sometimes an "Übergabeort" mission gets stuck when its marked as Verbandseinsatz.
  // This results in vehicles being stuck and not being sent back home.
  // In order to fix this, we need to check for stuck "Übergabe" missions and call back all vehicles involved.
  // An example get request looks like: https://leitstellenspiel.de/missions/4436501903/backalarmAll?ifs=at_fi&sd=a&sk=cr
  document.lss_helper.missions
    .filter((m) => m.missionType === "" && m.isVerband)
    .forEach((m) => {
      const url =
        (document.lss_helper.url ?? "https://www.leitstellenspiel.de") +
        "/missions/" +
        m.missionId +
        "/backalarmAll?ifs=at_fi&sd=a&sk=cr";
      fetch(url, { method: "GET", cache: "no-cache" })
        .then((r) => r.text())
        .then((r) => {
          document.lss_helper.debug(
            "Called back all vehicles for stuck mission",
            m.missionId,
            r,
          );
        })
        .catch((err) => {
          document.lss_helper.error(
            "Error calling back vehicles for mission",
            m.missionId,
            err,
          );
        });
    });
};
document.lss_helper.fixNullVerbandInterval =
  document.lss_helper.fixNullVerbandInterval ||
  setInterval(
    () => {
      document.lss_helper.fixNullVerband();
    },
    10 * 60 * 1000,
  );
