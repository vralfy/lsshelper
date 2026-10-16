# LSSHelper Performance Handoff

## Current State
- Repository: `lsshelper`, branch `dev`, current `HEAD`: `e2330de` (`Optimize vehicle retrieval logic in getVehiclesByScene function`). Worktree was clean when checked.
- The optimization is in `script.scene.js`, in `document.lss_helper.getVehiclesByScene()`.
- With `optimize_scene` enabled, the function now computes and sorts available vehicles once, reuses that scored list for final selection, and clones it for the replacement pre-pass so the pre-pass can filter independently. The option-off path remains as before.
- The ternary selecting between optimized and normal paths is parenthesized for readability.
- `update()` now computes the snapshot hash once and reuses it as `renderHash` after rendering.
- `getVehiclesList()` now flattens vehicle arrays with `flatMap()` and indexes vehicle markers once, preserving vehicle order and the previous last-matching-marker behavior.
- `helper.getDistance()` now reuses identical Haversine sine/cosine results instead of recalculating them.
- The optimized replacement pre-pass now associates reserved vehicles with the specific scene requirement they fulfilled, keeps that order, and leaves the input scene unchanged.

## Performance Evidence
- Live-game baseline before the change, with `optimize_scene` enabled: 190 calls in about 31 seconds; 365 calls/minute; 1,159.4 ms aggregate; 6.102 ms average; 7 ms p95; 7.5 ms max.
- Live-game measurement after the change: 101 calls; 202 calls/minute; 427.7 ms aggregate; 4.235 ms average; 5.4 ms p95; 5.8 ms max.
- Per-call timing improved: average decreased by 30.6%, p95 by 22.9%, and max by 22.7%. Aggregate time decreased by 63.1%, but the call rate also decreased from 365 to 202 calls/minute, so this is not a workload-matched aggregate comparison.
- The baseline implied about 3.7% of elapsed time was spent inside this function. The measured improvement supports keeping the optimization, subject to the outstanding behavior check.
- `perfmon.js` measures `getVehiclesByScene()`, `getVehiclesList()`, and `helper.hash()` after 30 seconds, then restores the original functions. Hash calls are separated into snapshot-fallback and explicit-argument paths.
- Expanded-profiler sample before the latest hash/list edits: `getVehiclesByScene()` 454 calls, 908/min, 1,789.2 ms total, 3.941 ms average, 5.6 ms p95, 13.8 ms max; `getVehiclesList()` 3 calls, 121.9 ms total, 40.633 ms average, 45.4 ms p95/max; snapshot hash 9 calls, 93.4 ms total, 10.378 ms average, 10.9 ms p95/max; explicit-argument hash 21,606 calls, 3.6 ms total, under 0.001 ms average, 0.1 ms max.
- Latest expanded-profiler sample reported after the hash/list changes: `getVehiclesByScene()` 206 calls, 412/min, 828.1 ms total, 4.02 ms average, 5.1 ms p95, 6.9 ms max; `getVehiclesList()` 2 calls, 60.8 ms total, 30.4 ms average, 31.7 ms p95/max; snapshot hash 4 calls, 39.7 ms total, 9.925 ms average, 10.3 ms p95/max; explicit-argument hash 14,404 calls, 2.1 ms total, under 0.001 ms average, 0.1 ms max. It is unconfirmed whether the updated distance-function script was loaded for this sample.
- Compared with the prior expanded sample, `getVehiclesList()` average decreased about 25% and snapshot-hash average about 4%. `getVehiclesByScene()` average changed from 3.941 to 4.02 ms, while call rate fell from 908 to 412/min; the aggregate-time decrease is therefore not evidence of a per-call improvement.
- Latest profiler sample with distance diagnostics: `getVehiclesByScene()` 457 calls, 895/min, 1,841.3 ms total, 4.029 ms average, 5.6 ms p95, 15.7 ms max; `getVehiclesList()` 3 calls, 87.9 ms total, 29.3 ms average, 31.1 ms p95/max; snapshot hash 7 calls, 77.4 ms total, 11.057 ms average, 16.5 ms p95/max; explicit-argument hash 21,606 calls, 2.9 ms total, under 0.001 ms average, 0.1 ms max.
- This latest scene sample is close in call rate to the earlier 454-call/908-per-minute sample: average changed from 3.941 to 4.029 ms (+2.2%), p95 stayed 5.6 ms, and max increased from 13.8 to 15.7 ms. This does not show a per-call scene improvement. `getVehiclesList()` average is about 28% lower than its earlier 40.633 ms measurement, though hash/list timings can vary with list size and state.
- Distance diagnostics for the latest sample: `useExactDistance` false; `kmperdegree` 73.5353952064854, finite and nonzero; `haversineBranchPerCall` false. Repeated Haversine work was not the cause of the earlier `getDistance()` samples in this runtime state.
- Post-replacement-fix profiler sample: `getVehiclesByScene()` 183 calls, 366/min, 657.2 ms total, 3.591 ms average, 5.3 ms p95, 5.7 ms max; `getVehiclesList()` 1 call, 27.5 ms; snapshot hash 2 calls, 33 ms total, 16.5 ms average; explicit-argument hash 7,202 calls, 1 ms total.
- Both browser parity comparisons now report `matches: true` for the tested `GKW: 2` shortage mission with `noFillOrKill` false and true. IDs, group order, `mission.missing`, and input scene match. This run was 366 calls/min versus 895/min in the previous sample, so its lower scene average is not a comparable performance result.
- Chrome trace `Trace-20261014T194312.json` was captured after the hash/list edits and before the distance-function edit. Over about 21.1 seconds of V8 samples, `getVehiclesByScene()` accounted for about 5.10 seconds inclusive, with `getDistance()` about 0.92 seconds self time; snapshot `helper.hash()` was about 0.30 seconds self time. `getVehiclesList()` was about 0.31 seconds inclusive and 0.009 seconds self time. These sampled CPU times are estimates and are not directly comparable to `perfmon.js` wall-clock timings.

## Next Steps
1. Manually verify an alarm/dispatch for a no-shortage mission with replacement vehicles; the browser comparison currently covers a shortage mission.
2. For performance, repeat `perfmon.js` under a comparable workload. The latest run had substantially fewer calls than the prior sample, so do not attribute the lower average to the code change yet.
3. Treat the Haversine micro-optimization as relevant only when `exactDistance` is enabled or calibration is invalid; the latest runtime sample stayed on the approximate branch.

## Validation and Guardrails
- `node --check` passed for the changed JavaScript files. Focused Node checks confirmed flattening order, last-marker selection, bit-identical Haversine outputs, and parity of the real `getVehiclesByScene()` function for replacement, ordering, and shortage cases with mocked data. The latest browser parity comparisons pass for both `noFillOrKill` modes.
- There is no automated test suite: root `package.json` has a placeholder `test` script that exits with an error.
- `.github/workflows/lint.yml` runs Super Linter on pushes to `master`, `main`, `stage`, and `dev`; it does not define a test job or a `pull_request` trigger.
- The latest profiler sample includes distance diagnostics and confirms that Haversine was not running on each call. The Chrome trace predates the distance-function edit. A manual in-game dispatch check remains outstanding.

## Retrospective Suggestions
1. Highest priority: add a focused test harness for `getVehiclesByScene()` covering the behavior cases above, then wire it into CI. This would make performance changes less dependent on manual live-game verification.
2. Preserve comparable before/after profiler output with the commit or issue. Browser runtime measurements are not available from a source-only environment, so this evidence materially improves the next agent's ability to choose a target.
3. Keep performance changes measurement-led: use the expanded profiler before assuming any candidate dominates.

## Suggested Skills
- None required; continue with the repository's JavaScript conventions and a focused profiling/test workflow.
