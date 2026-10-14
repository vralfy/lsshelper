# LSSHelper Performance Handoff

## Current State
- Repository: `lsshelper`, branch `dev`, current `HEAD`: `e2330de` (`Optimize vehicle retrieval logic in getVehiclesByScene function`). Worktree was clean when checked.
- The optimization is in `script.scene.js`, in `document.lss_helper.getVehiclesByScene()`.
- With `optimize_scene` enabled, the function now computes and sorts available vehicles once, reuses that scored list for final selection, and clones it for the replacement pre-pass so the pre-pass can filter independently. The option-off path remains as before.
- The ternary selecting between optimized and normal paths is parenthesized for readability.

## Performance Evidence
- Live-game baseline before the change, with `optimize_scene` enabled: 190 calls in about 31 seconds; 365 calls/minute; 1,159.4 ms aggregate; 6.102 ms average; 7 ms p95; 7.5 ms max.
- The baseline implies about 3.7% of elapsed time was spent inside this function. The post-change measurement has not yet been reported.
- `perfmon.js` wraps `getVehiclesByScene()`, reports these metrics after 30 seconds, and restores the original function.

## Next Steps
1. In the game with the updated userscript loaded and `optimize_scene` enabled, rerun `perfmon.js` under a comparable workload. Compare call count and aggregate/average/p95 timings with the baseline above.
2. Confirm behavior remains stable, especially selected vehicle IDs and order, shortage/null behavior, replacement handling, and the existing `mission.missing` / scene mutation behavior.
3. If the gain is confirmed, profile `getVehiclesList()` and `helper.hash()` before selecting another optimization. `getVehiclesList()` in `script.lists.js` repeatedly flattens nested arrays using spread in `reduce()` and performs three chained sorts; `helper.hash()` in `script.helper.js` JSON-stringifies mission/vehicle snapshots on each refresh. These are hypotheses, not measured bottlenecks.

## Validation and Guardrails
- `node --check script.scene.js` passed after the edit; editor diagnostics reported no errors.
- There is no automated test suite: root `package.json` has a placeholder `test` script that exits with an error.
- `.github/workflows/lint.yml` runs Super Linter on pushes to `master`, `main`, `stage`, and `dev`; it does not define a test job or a `pull_request` trigger.
- No post-change runtime benchmark or automated behavioral test has been completed.

## Retrospective Suggestions
1. Highest priority: add a focused test harness for `getVehiclesByScene()` covering the behavior cases above, then wire it into CI. This would make performance changes less dependent on manual live-game verification.
2. Preserve comparable before/after profiler output with the commit or issue. Browser runtime measurements are not available from a source-only environment, so this evidence materially improves the next agent's ability to choose a target.
3. Keep performance changes measurement-led: once this patch is remeasured, instrument `getVehiclesList()` and `helper.hash()` separately rather than assuming their apparent costs dominate.

## Suggested Skills
- None required; continue with the repository's JavaScript conventions and a focused profiling/test workflow.
