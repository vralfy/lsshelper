document.lss_helper.autoPrisoner = (force) => {
    if (!force) {
        setTimeout(() => { document.lss_helper.autoPrisoner(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
    }
    if (!force && !document.lss_helper.getSetting('autoPrisoner')) {
        return;
    }
    document.lss_helper.debug('auto prisoner running');

    const types = ['32', '52', '98', '103', '184'];
    const call = document.lss_helper.vehicles.filter((v) => types.indexOf(v.type) >= 0).filter((v) => v.call).pop();

    if (!call) {
        return;
    }

    document.lss_helper.info('sending to prison', call.name);
    const header = { method: 'GET', cache: "no-cache" };
    return fetch((document.lss_helper.url ?? 'https://www.leitstellenspiel.de') + '/vehicles/' + call.id, header)
        .then((response) => response.text())
        .then((html) => html.split("\n").filter((l) => l.includes('_prisons.push(')).join(''))
        .then((html) => {
            const erb_prisons = [];
            const erb_alliance_prisons = [];
            eval(html);

            const prisons = [...erb_prisons, ...erb_alliance_prisons].filter((p) => p.free_cells !== '0');
            if (prisons.length) {
                const prison = prisons[0];
                const url = (document.lss_helper.url ?? 'https://www.leitstellenspiel.de') + '/vehicles/' + call.id + '/gefangener/' + prison.id + '?load_all_prisons=true&show_only_available=false';
                fetch(url)
                    .then((resp) => resp.text())
                    .then((resp) => {
                        document.lss_helper.debug(resp);
                        document.lss_helper.updateLists(-1);
                    });
            }

        });
};

document.lss_helper.autoPrisonerMission = (force) => {
    // schedule next run (if not forced)
    if (!force) {
        setTimeout(() => { document.lss_helper.autoPrisonerMission(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
    }
    if (!force && !document.lss_helper.getSetting('autoPrisonerMission')) {
        return;
    }

    // find missions that require prisoner transport
    let missions = document.lss_helper.missions.filter(m => m.info.missing.innerText.indexOf('Gefangene sollen abtransportiert werden') >= 0);
    [missions[0]].forEach((m) => {
        if (!m) return;

        const url = (document.lss_helper.url ?? 'https://www.leitstellenspiel.de') + '/missions/' + m.data.id + '?ifs=at_fi&sd=a&sk=cr';

        // Create hidden iframe to let page JS execute (same-origin) and then query for dynamically inserted buttons
        const createAndLoadIframe = (src, opts = {}) => new Promise((resolve, reject) => {
            const timeout = opts.timeout || 7000; // ms
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.left = '-9999px';
            iframe.style.width = '1px';
            iframe.style.height = '1px';
            iframe.style.visibility = 'hidden';
            iframe.src = src;
            document.body.appendChild(iframe);

            let settled = false;
            const cleanup = () => {
                try { iframe.remove(); } catch (e) { }
            };

            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                cleanup();
                reject(new Error('iframe load timeout'));
            }, timeout + 100); // slightly longer than poll

            const onResolve = (links) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                cleanup();
                resolve(links);
            };

            iframe.addEventListener('load', () => {
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;

                    // Poll for prison links for a short time because page JS may insert them asynchronously
                    const pollInterval = 100;
                    const maxPolls = Math.ceil(timeout / pollInterval);
                    let polls = 0;

                    const check = () => {
                        polls++;
                        // select links that either have data-prison-id or the success button class
                        const prisonAnchors = Array.from(doc.querySelectorAll('a[data-prison-id]'));
                        if (prisonAnchors.length) {
                            // map to plain objects (do not return DOM nodes from iframe after cleanup)
                            const mapped = prisonAnchors.map(a => ({
                                text: a.innerText.trim(),
                                href: a.getAttribute('href')
                            }));
                            return onResolve(mapped);
                        }
                        if (polls < maxPolls) {
                            setTimeout(check, pollInterval);
                        } else {
                            reject(new Error('no prison links found'));
                            cleanup();
                        }
                    };

                    check();
                } catch (err) {
                    clearTimeout(timer);
                    cleanup();
                    reject(err);
                }
            }, { once: true });
        });

        createAndLoadIframe(url, { timeout: 7000 })
            .then((prisonLinks) => {
                document.lss_helper.debug('prison links found for mission', m.data.id, prisonLinks);
                // pop first link from prisonLinks and call its url
                if (prisonLinks.length > 0) {
                    const firstLink = prisonLinks.shift();
                    document.lss_helper.log('Sending to prison', m, firstLink);
                    fetch(firstLink.href, { method: 'GET', cache: 'no-cache' });
                }
                // refresh lists / state
                document.lss_helper.updateLists(-1);
            })
            .catch((err) => {
                document.lss_helper.error('autoPrisonerMission iframe error', err);
                // fallback: attempt the previous fetch approach (non-executing HTML parsing)
                const header = { method: 'GET', cache: 'no-cache' };
                fetch(url, header)
                    .then((r) => r.text())
                    .then((r) => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(r, 'text/html');
                        const prisonLinks = Array.from(doc.querySelectorAll('a.btn-success[data-prison-id]'));
                        document.lss_helper.log(m, prisonLinks);
                        prisonLinks.forEach((link) => {
                            document.lss_helper.error(link, link.innerText);
                        });
                    })
                    .catch((err2) => {
                        document.lss_helper.error(err2);
                    });
            });
    });

    // const types = ['32', '52', '98', '103'];
    // const calls = document.lss_helper.vehicles.filter((v) => types.indexOf(v.type) >= 0).filter((v) => !v.call && v.status === '4');
    // calls.forEach((v, idx) => {
    //     setTimeout(() => {
    //         const header = { method: 'GET', cache: "no-cache" };
    //         const url = (document.lss_helper.url ?? 'https://www.leitstellenspiel.de') + '/vehicles/' + v.id;
    //         fetch(url, header)
    //             .then((r) => r.text())
    //             .then((r) => {
    //                 const parser = new DOMParser();
    //                 const doc = parser.parseFromString(r, 'text/html');
    //                 const prisonLinks = Array.from(doc.querySelectorAll('a.btn.btn-success'));
    //                 document.lss_helper.log(v, prisonLinks);
    //                 prisonLinks.forEach((link) => {
    //                     document.lss_helper.error(link, link.innerText);
    //                 });
    //             })
    //     }, idx * 1000);
    // });
}