# Google Analytics (GA4) connector recipe

Service: Google Analytics 4 — Analytics Data API v1beta (+ Admin API for property management)
Purpose: read per-page / per-site traffic (page views, users, sessions) without opening the Analytics console.
Verified against Google's official API references on 2026-11-21.

## API facts

- API hosts: `analyticsdata.googleapis.com` (reports), `analyticsadmin.googleapis.com` (properties/streams)
- Auth: OAuth 2.0 authorization code flow
  - Authorize: `https://accounts.google.com/o/oauth2/v2/auth`
  - Token: `https://oauth2.googleapis.com/token`
  - Revoke: `https://oauth2.googleapis.com/revoke`
  - Scope (least privilege): `https://www.googleapis.com/auth/analytics.readonly`
  - Service accounts also work for the Data API (add the service account email as a Viewer on the GA4 property) — but a service-account key is a signed-request credential and cannot be registered in Muse's secure connector flow.
- Key endpoints:
  - Run a report: `POST /v1beta/properties/{propertyId}:runReport`
    - Body example (page views per page, last 28 days):
      ```json
      {
        "dateRanges": [{ "startDate": "28daysAgo", "endDate": "today" }],
        "dimensions": [{ "name": "pagePath" }],
        "metrics": [{ "name": "screenPageViews" }, { "name": "totalUsers" }],
        "orderBys": [{ "metric": { "metricName": "screenPageViews" }, "desc": true }],
        "limit": 100
      }
      ```
    - `propertyId` is the numeric GA4 property ID — NOT the `G-` measurement ID.
  - Realtime (last 30 min): `POST /v1beta/properties/{propertyId}:runRealtimeReport`
  - Property/stream admin (Admin API): `GET /v1beta/properties/{propertyId}`, `GET /v1beta/properties/{propertyId}/dataStreams`

## Human setup (once, in Google Cloud Console)

1. Create (or pick) a Google Cloud project.
2. Enable the **Google Analytics Data API** (and the **Admin API** if property management is needed).
3. Configure the OAuth consent screen and **publish the app to "In production"** — in "Testing", refresh tokens expire after 7 days.
4. Create an OAuth client (Web application) and register your platform's redirect URI.
5. Connect with a Google account that has Viewer access (or higher) to the GA4 property.

## Official alternative

Google publishes an official **Analytics MCP server** (see developers.google.com/analytics/devguides/MCP). It is read-only and authenticates with Application Default Credentials (`gcloud auth application-default login --scopes=https://www.googleapis.com/auth/analytics.readonly,...`). Prefer it where the platform can run it.

## Known blocker (Muse custom connectors, 2026-11-21)

Same Google OAuth cross-domain limitation as the AdSense recipe: authorize on `accounts.google.com`, token on `oauth2.googleapis.com`, so Muse's secure flow declines registration. Workarounds: browser console checks, a connected hub (Zapier / Composio), or the official MCP server where ADC is available.

## Pitfalls

- Don't confuse the property ID (numeric) with the measurement ID (`G-...`) or the account ID.
- Data API quotas are per project; batch pages into one runReport call instead of one call per page.
- Fresh properties return empty rows for the first hours; absence of rows is not an error.
