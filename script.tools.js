document.lss_helper.makeGreenVerband = () => {
  const ignore = [null, undefined, "", "147", "613"];
  document.lss_helper.missions
    .filter(
      (m) => m.finishing && !m.isVerband && !ignore.includes(m.missionType),
    )
    .forEach((m, idx) => {
      setTimeout(() => {
        document.lss_helper.makeVerband(m);
      }, idx * 500);
    });
};

document.lss_helper.makeVerband = (mission) => {
  const ignore = [null, undefined, "", "147", "613"];
  if (!mission || mission.isVerband || ignore.includes(mission.missionType)) {
    return;
  }

  const url = "/missions/" + mission.missionId + "/alarm";
  const body = {
    //utf8: "",
    authenticity_token: document.lss_helper.authToken,
    next_mission: 0,
    next_mission_id: 0,
    alliance_mission_publish: 1,
    sk: "cr",
    sd: "a",
    ifs: "at_fi",
  };
  document.lss_helper.warn(
    "Making mission " + mission.missionId + " a verband mission.",
    body,
  );
  fetch(url, {
    method: "POST",
    body: new URLSearchParams(body),
    headers: {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  })
    .then((response) => response.text())
    .then((json) => {
      document.lss_helper.debug(json);
      document.lss_helper.update(-1);
    });
};
