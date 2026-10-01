# OneTrust Consent Integration

Source: `onetrust.js`
Reference: https://github.com/edegagneOptimizely/optimizelyWebX-ProjectJs/tree/main/One%20Trust%20Consent

## What it does

Gates Optimizely Web Experimentation on OneTrust cookie consent. On page load, it reads the
`OptanonConsent` cookie, checks whether the configured consent category is opted out, and pushes
a message to the `window.optimizely` queue telling Web X to either hold/send events or disable
itself entirely.

## How it works

1. Reads the `OptanonConsent` cookie from `document.cookie`.
2. Parses the cookie's `groups=` segment into a list of `<categoryId>:<0|1>` pairs (`1` = opted in,
   `0` = opted out).
3. Checks whether `allowedGroup` (default `C0003`) is opted out (`<allowedGroup>:0`).
4. Pushes one message to `window.optimizely`:
   - Opted out + `holdEvents = true` → `{ type: "holdEvents" }` (Web X stays active but queues/holds events)
   - Opted out + `holdEvents = false` → `{ type: "disable" }` (Web X is disabled entirely)
   - Opted in + `holdEvents = true` → `{ type: "sendEvents" }` (releases any held events)
   - Opted in + `holdEvents = false` → no push; Web X runs normally

## Configuration

All config lives at the top of the IIFE in `onetrust.js`:

| Variable | Default | Description |
|---|---|---|
| `allowedGroup` | `'C0003'` | OneTrust consent category ID to gate Optimizely on. Must match the category mapped to analytics/targeting cookies in your OneTrust setup. |
| `cookieName` | `'OptanonConsent'` | Name of the OneTrust consent cookie. Only change if your OneTrust deployment uses a custom cookie name. |
| `holdEvents` | `true` | `true`: hold/queue Web X events until consent is granted, then release them. `false`: fully disable Web X when consent is withheld (no later "send events" release). |

## Setup notes

- This script must run **before** any other Optimizely snippet that depends on `window.optimizely`
  (ideally first in Project JS / a high-priority extension), since it instantiates
  `window.optimizely = window.optimizely || []` if nothing else has yet.
  - If `window.optimizely` is already instantiated elsewhere in Project JS, the line on line 3 can
    be omitted (see inline comment).
- Assumes the OneTrust banner/cookie has already run and set `OptanonConsent` by the time this
  executes. If this script runs before OneTrust initializes, `consentGroups` will be `null` and
  `consentGroups.indexOf(...)` will throw — there's currently no guard for a missing/empty cookie.
- Find the correct `allowedGroup` category ID in the OneTrust admin console under the cookie
  category mapped to Optimizely/analytics cookies.

## Known limitations

- No null/empty-cookie guard: if `OptanonConsent` isn't present yet (e.g., script runs too early,
  or consent banner hasn't rendered), `consentGroups` stays `null` and the opt-out check throws.
- No listener for consent changes after initial page load — if a user updates their preferences
  via the OneTrust preference center without a page reload, this script won't re-evaluate unless
  OneTrust itself triggers a reload or this logic is re-invoked on OneTrust's consent-change event.
