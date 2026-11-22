# AgriNex AI Demo Walkthrough (3–5 minutes)

1. Show the dashboard and explain the goal: trusted weather, market and location context in one workspace.
2. Open the location selector. Choose **Tamil Nadu → Salem**, then show a Maharashtra district such as **Beed**.
3. Choose **Bihar** and show that districts remain available while the place list is empty—no fake village result is shown.
4. Open Weather and show the live Salem forecast. If the provider is unavailable, show the honest unavailable state.
5. Open Markets and explain that it uses AGMARKNET/data.gov.in only when a key is configured; it never estimates prices.
6. Open the AI Assistant and point out the safety and evidence rules. If Gemini is unconfigured, state that openly.
7. Close with next steps: synchronized national LGD releases, authenticated farmer profiles, verified knowledge ingestion and deployed credentials.

## Limits to state to judges

- The LGD demo snapshot has 125,119 accepted village records in six states only; no India-wide village claim is made.
- Rejected LGD rows remain documented in `backend/data/lgd/staging/`; none was auto-corrected.
- Market and Gemini require credentials. Weather depends on Open-Meteo connectivity.
