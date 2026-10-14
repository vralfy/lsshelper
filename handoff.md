# LSSHelper Performance Handoff

## Current State
- Repository: `lsshelper`, branch `dev`, current `HEAD`: `e2330de` (`Optimize vehicle retrieval logic in getVehiclesByScene function`). Worktree was clean when checked.
- The optimization is in `script.scene.js`, in `document.lss_helper.getVehiclesByScene()`.
- With `optimize_scene` enabled, the function now computes and sorts available vehicles once, reuses that scored list for final selection, and clones it for the replacement pre-pass so the pre-pass can filter independently. The option-off path remains as before.
- The ternary selecting between optimized and normal paths is parenthesized for readability.
- `update()` now computes the snapshot hash once and reuses it as `renderHash` after rendering.
- `getVehiclesList()` now flattens vehicle arrays with `flatMap()` and indexes vehicle markers once, preserving vehicle order and the previous last-matching-marker behavior.

## Performance Evidence
- Live-game baseline before the change, with `optimize_scene` enabled: 190 calls in about 31 seconds; 365 calls/minute; 1,159.4 ms aggregate; 6.102 ms average; 7 ms p95; 7.5 ms max.
- Live-game measurement after the change: 101 calls; 202 calls/minute; 427.7 ms aggregate; 4.235 ms average; 5.4 ms p95; 5.8 ms max.
- Per-call timing improved: average decreased by 30.6%, p95 by 22.9%, and max by 22.7%. Aggregate time decreased by 63.1%, but the call rate also decreased from 365 to 202 calls/minute, so this is not a workload-matched aggregate comparison.
- The baseline implied about 3.7% of elapsed time was spent inside this function. The measured improvement supports keeping the optimization, subject to the outstanding behavior check.
- `perfmon.js` measures `getVehiclesByScene()`, `getVehiclesList()`, and `helper.hash()` after 30 seconds, then restores the original functions. Hash calls are separated into snapshot-fallback and explicit-argument paths.
- Expanded-profiler sample before the latest hash/list edits: `getVehiclesByScene()` 454 calls, 908/min, 1,789.2 ms total, 3.941 ms average, 5.6 ms p95, 13.8 ms max; `getVehiclesList()` 3 calls, 121.9 ms total, 40.633 ms average, 45.4 ms p95/max; snapshot hash 9 calls, 93.4 ms total, 10.378 ms average, 10.9 ms p95/max; explicit-argument hash 21,606 calls, 3.6 ms total, under 0.001 ms average, 0.1 ms max.

## Next Steps
1. Confirm behavior remains stable, especially selected vehicle IDs and order, shortage/null behavior, replacement handling, and the existing `mission.missing` / scene mutation behavior.
2. Run the expanded `perfmon.js` in the game under a representative workload. Compare per-call timings and call rates; aggregate time is only comparable when workload and call rates are similar.
3. After verifying behavior, use the before/after profiles to decide whether further optimization is worthwhile. The snapshot-fallback hash and list-building costs are now being addressed; the new timings have not yet been collected.

## Validation and Guardrails
- `node --check` passed for `script.scene.js`, `lsshelper.user.js`, `script.lists.js`, and `perfmon.js`. A focused Node check confirmed flattening order and last-marker selection; live behavior still needs verification.
- There is no automated test suite: root `package.json` has a placeholder `test` script that exits with an error.
- `.github/workflows/lint.yml` runs Super Linter on pushes to `master`, `main`, `stage`, and `dev`; it does not define a test job or a `pull_request` trigger.
- The earlier scene optimization has live timing data; the latest hash/list optimizations do not yet have post-change runtime measurements. An automated or manual behavioral comparison is still outstanding.

## Retrospective Suggestions
1. Highest priority: add a focused test harness for `getVehiclesByScene()` covering the behavior cases above, then wire it into CI. This would make performance changes less dependent on manual live-game verification.
2. Preserve comparable before/after profiler output with the commit or issue. Browser runtime measurements are not available from a source-only environment, so this evidence materially improves the next agent's ability to choose a target.
3. Keep performance changes measurement-led: use the expanded profiler before assuming any candidate dominates.

## Suggested Skills
- None required; continue with the repository's JavaScript conventions and a focused profiling/test workflow.
