(() => {
  const helper = document.lss_helper;
  const original = helper.getVehiclesByScene;
  const startedAt = performance.now();
  const samples = [];

  helper.getVehiclesByScene = function (...args) {
    const start = performance.now();
    try {
      return original.apply(this, args);
    } finally {
      samples.push(performance.now() - start);
    }
  };

  window.lssScenePerf = {
    report() {
      const elapsedSeconds = (performance.now() - startedAt) / 1000;
      const sorted = [...samples].sort((a, b) => a - b);
      const sum = samples.reduce((total, value) => total + value, 0);
      const percentile = (p) =>
        sorted.length ? sorted[Math.ceil(p * sorted.length) - 1] : 0;

      console.table({
        calls: samples.length,
        callsPerMinute: Math.round((samples.length / elapsedSeconds) * 60),
        totalMs: +sum.toFixed(2),
        averageMs: +(sum / (samples.length || 1)).toFixed(3),
        p95Ms: +percentile(0.95).toFixed(3),
        maxMs: +(sorted.at(-1) || 0).toFixed(3),
      });
    },
    restore() {
      if (helper.getVehiclesByScene !== original) {
        helper.getVehiclesByScene = original;
      }
    },
  };

  console.info("Profiling started. After ~30 seconds, run lssScenePerf.report(); then lssScenePerf.restore().");
})();
setTimeout(() => {
  lssScenePerf.report();
  lssScenePerf.restore();
}, 30000);