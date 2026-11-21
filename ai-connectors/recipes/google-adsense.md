# Google AdSense connector recipe

Service: Google AdSense — AdSense Management API v2
Purpose: read site review status and earnings reports without opening the AdSense console.
Verified against Google's official API reference on 2026-11-21.

## API facts

- API host: `adsense.googleapis.com`
- Auth: OAuth 2.0 authorization code flow (no API key; service accounts are NOT supported by AdSense)
  - Authorize: `https://accounts.google.com/o/oauth2/v2/auth`
  - Token: `https://oauth2.googleapis.com/token`
  - Revoke: `https://oauth2.googleapis.com/revoke`
  - Scope (least privilege): `https://www.googleapis.com/auth/adsense.readonly`
- Key endpoints:
  - List accounts: `GET /v2/accounts`
  - Site review status: `GET /v2/accounts/{account}/sites` — each site carries a `state` (e.g. `READY`, `GETTING_READY`, `REQUIRES_REVIEW`, `NEEDS_ATTENTION`)
  - Earnings report: `GET /v2/accounts/{account}/reports:generate`
    - Query: `dateRange` via `startDate.year/month/day` + `endDate.year/month/day`, or `date_range=THIS_MONTH` style presets are NOT in v2 — pass explicit dates
    - `metrics[]`: e.g. `ESTIMATED_EARNINGS`, `CLICKS`, `IMPRESSIONS`, `PAGE_VIEWS`
    - `dimensions[]`: e.g. `DATE`, `DOMAIN_NAME`
    - Response: `ReportResult` with `headers`, `rows`, `totals`

## Human setup (once, in Google Cloud Console)

1. Create (or pick) a Google Cloud project.
2. Enable the **AdSense Management API**.
3. Configure the OAuth consent screen (Google Auth Platform). Set the user type and **publish the app to "In production"** — while it stays in "Testing", refresh tokens expire after 7 days and the connector silently breaks weekly.
4. Create an OAuth client (Web application) and register the redirect URI your platform gives you.
5. Connect with the Google account that owns the AdSense account, granting only the readonly scope above.

## Known blocker (Muse custom connectors, 2026-11-21)

Muse's secure connector flow requires every OAuth endpoint to sit on a single issuer domain or its subdomains. Google's authorize endpoint is on `accounts.google.com` while the token endpoint is on `oauth2.googleapis.com`, so registration is declined with "endpoints span domains". Workarounds an agent can use instead:

- Check AdSense through the signed-in browser session (console UI).
- Route through a hub the user already connected (e.g. Zapier / Composio) if it offers AdSense actions.
- On platforms whose OAuth flow accepts Google's endpoints, this recipe works as-is.

## Pitfalls

- The publisher ID looks like `pub-XXXXXXXXXXXXXXXX`; the API account name is `accounts/pub-XXXXXXXXXXXXXXXX`.
- Report rows are strings; parse numbers before summing.
- AdSense data is timezone-sensitive: pass `reportingTimeZone` = the account's timezone for day-accurate figures.
