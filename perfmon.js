(() => {
  const helper = document.lss_helper;
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
    report() {
      const elapsedSeconds = (performance.now() - startedAt) / 1000;
      console.table(Object.fromEntries(
        Object.entries(metrics).map(([name, samples]) => [name, summarize(samples, elapsedSeconds)]),
      ));
    },
    restore() {
      wrappers.forEach(({ owner, method, original, wrapped }) => {
        if (owner[method] === wrapped) owner[method] = original;
      });
    },
  };

  console.info("Profiling started. After ~30 seconds, run lssScenePerf.report(); then lssScenePerf.restore().");
})();
setTimeout(() => {
  window.lssScenePerf.report();
  window.lssScenePerf.restore();
}, 30000);