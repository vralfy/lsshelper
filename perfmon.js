(() => {
  const helper = document.lss_helper;
  const originalGetVehiclesByScene = helper.getVehiclesByScene;
  const startedAt = performance.now();
  const metrics = {
    getVehiclesByScene: [],
    getVehiclesList: [],
    hashWithSnapshot: [],
    hashWithArgument: [],
  };
  const wrappers = [];

  const wrap = (owner, method, metricName) => {
    const original = owner[method];
    const wrapped = function (...args) {
      const start = performance.now();
      try {
        return original.apply(this, args);
      } finally {
        const name = typeof metricName === 'function' ? metricName(args) : metricName;
        metrics[name].push(performance.now() - start);
      }
    };

    owner[method] = wrapped;
    wrappers.push({ owner, method, original, wrapped });
  };

  wrap(helper, 'getVehiclesByScene', 'getVehiclesByScene');
  wrap(helper, 'getVehiclesList', 'getVehiclesList');
  wrap(helper.helper, 'hash', (args) => args[0] ? 'hashWithArgument' : 'hashWithSnapshot');

  const summarize = (samples, elapsedSeconds) => {
    const sorted = [...samples].sort((a, b) => a - b);
    const total = samples.reduce((sum, value) => sum + value, 0);
    const percentile = (p) =>
      sorted.length ? sorted[Math.ceil(p * sorted.length) - 1] : 0;

    return {
      calls: samples.length,
      callsPerMinute: elapsedSeconds > 0
        ? Math.round((samples.length / elapsedSeconds) * 60)
        : 0,
      totalMs: +total.toFixed(2),
      averageMs: +(total / (samples.length || 1)).toFixed(3),
      p95Ms: +percentile(0.95).toFixed(3),
      maxMs: +(sorted.at(-1) || 0).toFixed(3),
    };
  };

  window.lssScenePerf = {
    compareScenePaths(mission, scene, noFillOrKill = false) {
      if (!mission || !scene || typeof scene !== 'object') {
        throw new TypeError('Pass a mission and a scene object to compareScenePaths().');
      }

      const originalSetting = helper.getSetting('optimize_scene');
      const run = (optimizeScene) => {
        helper.setSetting('optimize_scene', optimizeScene);
        const testMission = { lat: mission.lat, lng: mission.lng };
        const testScene = JSON.parse(JSON.stringify(scene));
        const vehicles = originalGetVehiclesByScene(testMission, testScene, noFillOrKill);

        return {
          selectedIds: vehicles === null
            ? null
            : vehicles.map((group) => Array.isArray(group) ? group.map((vehicle) => vehicle.id) : group),
          missing: testMission.missing,
          scene: testScene,
        };
      };

      let baseline;
      let optimized;
      try {
        baseline = run(false);
        optimized = run(true);
      } finally {
        helper.setSetting('optimize_scene', originalSetting);
      }

      const matches = ['selectedIds', 'missing', 'scene']
        .every((key) => JSON.stringify(baseline[key]) === JSON.stringify(optimized[key]));
      const result = { matches, baseline, optimized };
      console.info('Scene path comparison', result);
      return result;
    },
    report() {
      const elapsedSeconds = (performance.now() - startedAt) / 1000;
      console.table(Object.fromEntries(
        Object.entries(metrics).map(([name, samples]) => [name, summarize(samples, elapsedSeconds)]),
      ));
      console.info('Distance calibration', {
        useExactDistance: helper.useExactDistance,
        kmperdegree: helper.kmperdegree,
        kmperdegreeIsUsable: Number.isFinite(helper.kmperdegree) && helper.kmperdegree !== 0,
        haversineBranchPerCall: Boolean(helper.useExactDistance || !helper.kmperdegree),
      });
    },
    restore() {
      wrappers.forEach(({ owner, method, original, wrapped }) => {
        if (owner[method] === wrapped) owner[method] = original;
      });
    },
  };

  console.info("Profiling started. After ~30 seconds, run lssScenePerf.report(); then lssScenePerf.restore(). For an unmeasured parity check, run lssScenePerf.compareScenePaths(mission, scene, noFillOrKill) afterward.");
})();
setTimeout(() => {
  window.lssScenePerf.report();
  window.lssScenePerf.restore();
}, 30000);

setTimeout(() => {
  const mission = document.lss_helper.missions.find(
    (m) => m.unattended && document.lss_helper.getScene(m.missionType)
  );
  const scene = mission && document.lss_helper.getScene(mission.missionType);

  lssScenePerf.compareScenePaths(mission, scene, false);
  lssScenePerf.compareScenePaths(mission, scene, true);
}, 35000);