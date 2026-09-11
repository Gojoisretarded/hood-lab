# Session Handoff: Robinhood Library (frontend prototype)
**Date:** 2026-09-11
**Handoff #:** 1
**Session descriptor:** Spec review → fact-check → prototype build → iterative visual redesign (hero, parallax landing, history flight, preloader, cards)
**Depth level:** Deep
**Prepared for:** Next Claude session

> **Session continuity:** This is an ongoing build. A Next.js app is running locally and has been rebuilt several times in response to visual references. Nothing has been committed to git.

---

## 1. Mission
Samuel is building **Robinhood Library**, an *independent, unofficial* web product described in `Robinhood_Library_Developer_Spec.pdf` (project root). It is an interactive historical archive of Robinhood / retail trading / meme stocks / crypto, plus live market and onchain intelligence for **Robinhood Chain** (Ethereum L2 on Arbitrum, chain ID 4663). Samuel's own meme token appears only as a "Current Artifact" inside the Library. The current phase is a **cinematic, award-site-quality frontend prototype**. Samuel wants it to feel like Büro (18.burocratik.com), a dark fintech hero with an ASCII money-glyph band (the "bank you can build on" screenshot), and ThoughtLab's (thoughtlab.com) liquid-glass lens. Every factual claim still has to be sourced, per the spec. The mission has evolved over the session: it started as "homepage + Chapter 1" and became "parallax landing + Robinhood Chain-era history flight + section pages + memory-lane preloader".

---

## 2. Current State (What Is True Right Now)
- **Project:** `C:\Users\samue\Desktop\Web3 Works\Robinhood`. Next.js 16.3.4 App Router, React 19.2, TypeScript ~5.9, Lenis 1.3.26. No GSAP or Three.js.
- **Dev server:** running on **http://localhost:3000**, started through the Browser pane preview config `.claude/launch.json` (name `robinhood-library`, `npm run dev`).
- **Checks:** `npx tsc --noEmit` passes. The last `next build` passed before the latest round; it hasn't been re-run since.
- **Visual direction:** locked to **A: "Ledger & Carbon"**. Styles B/C, the style switcher and the `/styles` board were deleted.
  - Light pages: bond paper `#e8ebe4` with ledger ink `#121714`.
  - "Night"/inverse sections: `#111412` with `#ece9e1`.
  - Accent: carbon blue `#2336b0`.
  - Fonts: Libre Caslon Display for display, Instrument Sans for text, Geist Mono for labels and buttons (uppercase).
- **Routes that work:**
  - `/` landing:
    - **Dark hero** with a serif headline, two-tone intro line and mono pill buttons.
    - `HeroPlane`: a real jet with a dotted trail.
    - `ChainBadge`: a live "Robinhood Chain is live · Block N" link.
    - `LiquidLens`: a liquid-glass lens that follows the cursor or drifts idle, and refracts the headline with RGB fringes (Chromium only).
    - `GlyphField`: an animated canvas band of `$ / ·` glyphs forming an **original feather emblem**.
    - **Stacked sticky parallax panels** follow: History flight (fan cards + timeline), Market & Impact (mini quotes + Impact weights), Onchain (inverse, live block pulse), Newsroom + Current-artifact card.
  - `/flight`: "Robinhood Chain" History flight.
    - The plane follows a Catmull-Rom dotted route on scroll.
    - Pop-up cards spring out where the route touches them: RH-2025-001 → RH-2026-001 → **mainnet inverse moment (RH-2026-002)** → RH-2026-003 → RH-2026-004 → a live chain card.
    - Bottom `ProgressStrip` with a list of the moments.
  - `/market`: LiveWindow (real Stock Token quotes) + ImpactWindow (formula only, no scores) + house rules.
  - `/onchain`: live ChainPulse, the network settings table, and a filterable canonical Stock Token registry (194 tokens).
  - `/newsroom`: all archive records by year, with Verify.
  - `/current-artifact`: pre-launch token page. The contract reads "Not deployed", the metrics read "Waiting for deployment", and it shows the GME canonical address plus the no-shareholder-rights disclaimer.
- **Global features:**
  - **MemoryLane** preloader: a 3D "memory lane" of year cards, the jet flying forward and a year counter from 2013 to 2026. It plays once per browser session and shows a Skip button.
  - Ctrl/⌘K search.
  - Verify drawer showing claims, labels and source records.
  - Header auto-switches to the inverse palette over dark sections.
  - Reduced-motion is respected throughout.
- **Last visual checks:**
  - Hero screenshot confirmed: the lens refracts the headline, the feather shows in the glyph field, and the header turns dark.
  - A flight card was confirmed with the new anatomy.
  - The card footer stagger delay was shortened after it looked empty in one screenshot (a timing issue, not a bug).
- **Last thing delivered:** the dark hero + liquid lens + glyph emblem + card redesign + removal of B/C. **Samuel has not reacted to this round yet.**
- **Git:** on branch `master`.
  - The previous project ("NVIDIA Time Machine") files are **deleted in the working tree but not committed**. They are recoverable from commit `1c5c3d8`.
  - All new Robinhood Library files are uncommitted.
  - Samuel never decided between "clean slate in this repo" and "separate repo".

---

## 3. Work Completed This Session
- Reviewed the 28-page spec PDF and 2 WhatsApp images: a storytelling concept (paper plane on a dotted path) and a notebook sketch (glassmorphism cards along the path).
- Analysed the reference sites: Büro (Nuxt, GSAP, Lenis, Three; horizontal scroll with a dotted route and a chapter pill), ThoughtLab (GSAP + Three; WebGL liquid-glass blob with chromatic refraction that later becomes a project portal) and the dark fintech hero screenshot (serif headline, mono pill buttons, ASCII `$ £ /` band).
- **Fact-checked the spec's history against its 11 links plus search.** Everything matches. Six timeline items had no link, the 2014 waitlist has no primary source, and the spec omits that Stock Tokens aren't available to US persons or UK residents (see Section 10 for the verified facts).
- Built the Next.js prototype, then rebuilt it three times following Samuel's direction:
  1. Homepage + "Chapter 1: Origins 2013–2015".
  2. Parallax landing + Chain-era flight + preloader + 3 style directions + section pages.
  3. Direction A only + dark reference-style hero + liquid lens + glyph emblem + card redesign.
- Replaced the paper plane with an original top-down jet SVG (`components/Airplane.tsx`). Its livery stripe uses `var(--accent)`, and it has red/green navigation lights.
- Built server API proxies for Robinhood's Stock Token API and Robinhood Chain RPC, with caching and stale fallback.
- Built a data layer, `lib/archive.ts`: sources registry, artifacts with labelled claims, and the canonical token list. It stands in for the spec's Postgres tables.

---

## 4. Active Tasks & Next Steps

### Immediate (start here):
- [ ] **Get Samuel's reaction to the latest round.** That covers the dark hero, the liquid lens, the `$` glyph field with the feather emblem, and the redesigned cards. Iterate on specifics. The user tab is usually `tab-3` in the Browser pane, and Samuel often clicks around in it, so test in a separate background tab.
- [ ] **Ask what "Something else" meant.** Samuel ticked it as a fifth landing-page section but gave no text.

### Queued:
- [ ] Decide the dotted-route colour. The route uses `mix-blend-mode: difference`, so its dots invert per background. On the light A pages they read dark; on the inverse mainnet section, light. Samuel may want a fixed colour.
- [ ] Re-run `npx next build` to confirm the production build after the latest round.
- [ ] ThoughtLab's second effect was never built: the glass blob becoming a **portal/window showing each section's content on scroll**. It could link hero → parallax panels.
- [ ] Mobile pass on the new hero: lens size, glyph field height and the ChainBadge position at ≤860px were not visually verified.
- [ ] Confirm the lens fallback in Safari and Firefox (plain glass, no refraction).

### Parked / Later:
- [ ] Git decision: commit the removal of the NVIDIA files (clean slate) vs a separate repo. **Do not commit unless Samuel asks.**
- [ ] Verify the pending sources: IPO release (investors.robinhood.com), Web3 wallet beta post, EU crypto launch post, and a primary source dating the 2014 waitlist.
- [ ] Backend from the spec (Postgres schema, Admin CMS, indexer, Impact engine, news ingestion). Not started; the prototype uses static `lib/archive.ts`.
- [ ] Project token: name and contract. The `/current-artifact` page stays pre-launch until they exist.
- [ ] Remove the prototype-only "Replay intro" affordance. It was inside the deleted switcher, so there is currently **no UI to replay the preloader**. Use `sessionStorage.removeItem('rl-lane')` and reload.

---

## 5. Key Decisions & Rationale

| Decision | Chosen Option | Confidence | Rationale | Alternatives Rejected |
|---|---|---|---|---|
| Visual direction | A "Ledger & Carbon" (light paper + night inverse sections) | FIRM | Samuel: "A works" | B Microfilm (teal/amber/Archivo), C Pit Jacket (royal blue/yellow/Big Shoulders): deleted |
| Hero style | Dark hero modelled on the fintech screenshot: serif headline, mono caps pill buttons, ASCII money-glyph band | FIRM | Samuel sent the reference: "something like this" | Light hero with guilloché rosette (previous) |
| Hero motion | Liquid-glass lens (ThoughtLab-inspired) over the headline | TENTATIVE | Samuel: "notice the animation used on this". Built, no feedback yet | Three.js/WebGL rebuild (not attempted) |
| Emblem | Original feather/quill drawn in `$` glyphs (`EMBLEM` paths in `GlyphField.tsx`) | ASSUMED | Samuel asked for "the Robinhood emblem", but the spec forbids Robinhood marks and implied affiliation. Swappable if licensed | Tracing Robinhood's logo |
| Traveller | Real top-down jet airliner | FIRM | Samuel: "make it an actual plane" | Paper plane (removed) |
| History content | Flight covers **Robinhood Chain era only** (Jun 2025 → Jul 2026 + live card); earlier history lives in `/newsroom` | FIRM | Samuel chose "Robinhood Chain era only" | Chapter-per-era structure; "Chapter 1: Origins" page (deleted) |
| Card reveal | Pop-up spring from the route contact point, with staggered inner elements | FIRM (animation) / TENTATIVE (card design) | Requested; the card was redesigned after "card isn't well designed to taste" | Circular clip-path unfold (v1) |
| Card anatomy | Mono date strip + ID / serif title / body / one figure or pills / footer (status, source count, Verify). Claims moved to the drawer | ASSUMED | Declutter per feedback | Inline claims + chips on the card |
| Landing structure | Sticky stacked parallax panels: hero → History flight → Market & Impact → Onchain → Newsroom + token | FIRM | Samuel picked these four sections (+ an unexplained "Something else") | Single scroll page with route through it |
| Preloader | "Memory lane": 3D lane of year cards, once per session, Skip, waits for fonts + load | FIRM (feature) / TENTATIVE (look) | Samuel requested "a preloader (like a memory lane)" | none |
| Labels & buttons | Geist Mono uppercase for buttons, chips, IDs and kickers | ASSUMED | Matches the fintech reference | Sentence-case sans labels |
| Stack | Next.js 16 + React 19 + Lenis; hand-written scroll/rAF, no GSAP | ASSUMED | Spec suggests Next.js; light deps | GSAP ScrollTrigger, Three.js |
| Data honesty | Claims carry VERIFIED/ONCHAIN/CALCULATED/ESTIMATED/EDITORIAL labels + Pending status; no fake numbers anywhere (Impact, token metrics) | FIRM | Spec principles; failure shows stale values, never fabricated ones | Placeholder scores |

---

## 6. Dead Ends & Failed Approaches
- **`backdrop-filter: url(#id)` written in the CSS file**: Next's CSS pipeline rewrites `url()` references, so the computed value became `none`. **Fix:** set `backdropFilter` inline via React `style`. Do not move it back into CSS.
- **`feImage` displacement maps inside `backdrop-filter`** (both data-URL and in-document element references): Chrome 152 refuses them silently; the lens rendered black or unchanged. **`feTurbulence` + `feDisplacementMap` works**, so the current lens uses morphing noise with per-channel scales for the RGB fringe. Don't retry an image-based lens map unless you switch to a DOM-clone magnifier or WebGL.
- **html class `lane` colliding with the `.lane` component class**: the `.lane {display:none}` rule hid the whole `<html>`, giving a blank page. The flag was renamed to **`intro`**. Never reuse component class names as `<html>` flags.
- **Stock Token API multi-symbol requests** (`/rhj/prices/GME,AMC`): 404. One symbol per request only. The API also sends no CORS headers, so browser calls must go through `/api/market/stock-tokens`.
- **Screenshots of hidden or background Browser-pane tabs**: they time out or return blank, WebGL doesn't render, and CSS transitions freeze (`getAnimations()` shows `currentTime 0`). Front the tab for visual checks (ThoughtLab needed that), but avoid hijacking Samuel's tab. `zoom` region crop is unsupported in the pane.
- **Stale `.next/types` after deleting routes** makes `tsc` fail on missing pages. **Fix:** `Remove-Item -Recurse -Force .next/types`, then re-run.
- **`mix-blend-mode: difference` on the plane**: caused odd colour shifts (yellow on blue). The plane now uses no blend; only the route dots still blend.
- **Style switcher top-right / bottom-left placements**: overlapped the hero plane or timeline. Moot now that the switcher is deleted.

---

## 7. Constraints & Requirements
**Hard (from the spec, plus facts found this session):**
- The site is **independent and unofficial**. Never present it as Robinhood or GameStop, never use Robinhood brand assets or logo without rights, and never call the project token Robinhood-issued, GME-backed, "safe" or "official". The independent notice stays in the header ("Independent archive" tag) and footer.
- Every major factual claim needs a source record and a VERIFY affordance. Label claims with VERIFIED / ONCHAIN / CALCULATED / ESTIMATED / EDITORIAL; unchecked ones are **Pending**.
- Token identity is **chain ID + contract address**, never the ticker. Stock Tokens must match the official registry.
- Live data must show freshness (Live under 60s, "Nm ago", Stale). Upstream failure shows the last known value marked stale, never fake or zero values.
- Stock Tokens are **not available to US persons or UK residents** and give **no shareholder rights**. Keep those notes.
- No investment advice. Nothing on the site is a trade recommendation.
- Media must have rights or provenance. No hotlinked Robinhood imagery.
- Respect `prefers-reduced-motion`, keyboard navigation and visible focus.
- **Do not git commit or push unless Samuel asks.**

**Soft preferences:**
- Cinematic, award-site feel (Büro / ThoughtLab / premium fintech), restrained and editorial, not a crypto neon dashboard.
- Keeps the plane motif. Likes pop-up reveals and parallax.
- Visual references drive the direction. Extract the vibe, but make it original.

---

## 8. Open Questions & Blockers
- **"Something else" landing section**: Samuel ticked it without saying what it is. *Blocked on: Samuel's answer.*
- **Feedback on the latest round** (dark hero, lens, glyph feather, cards): unknown. *Blocked on: Samuel reviewing localhost:3000.*
- **Robinhood emblem**: Samuel asked for it, and Claude used an original feather because of the spec's trademark rule. *Blocked on: Samuel confirming the feather, or supplying a licensed mark* (swap the `EMBLEM` paths in `components/GlyphField.tsx`).
- **Route dot colour**: fixed colour vs the current blend inversion. Not blocking.
- **Git repo decision** (clean slate vs separate repo): not blocking the prototype.
- **Project token name/contract**: not blocking; the page stays pre-launch.

---

## 9. Artifacts & Files

| Item | Type | Location / Description | Status |
|---|---|---|---|
| Spec | doc | `Robinhood_Library_Developer_Spec.pdf` (root) | Input |
| Concept refs | images | `WhatsApp Image 2026-09-11 at 2.06.27 PM.jpeg` (storytelling concept), `...2.06.28 PM.jpeg` (notebook sketch) | Input |
| App shell | config | `package.json`, `next.config.mjs` (devIndicators bottom-right), `tsconfig.json`, `.gitignore`, `.claude/launch.json` | FINAL |
| Layout + boot script | component | `app/layout.tsx`: 3 fonts; head script adds `motion`/`intro` classes to `<html>` | WIP |
| Styles | css | `app/globals.css`: direction A tokens, `.inverse` token flip, all component styles | WIP |
| Landing | page | `app/page.tsx`: hero + `Stack` parallax panels | WIP |
| History flight | page | `app/flight/page.tsx` | WIP |
| Section pages | pages | `app/market/page.tsx`, `app/onchain/page.tsx`, `app/newsroom/page.tsx`, `app/current-artifact/page.tsx` | DRAFT |
| API proxies | route | `app/api/market/stock-tokens/route.ts` (15s cache, registry-checked, stale fallback), `app/api/chain/overview/route.ts` (RPC latest block, 4s cache + registry count), `app/api/chain/tokens/route.ts` (registry, 1h cache) | FINAL (prototype) |
| Data layer | lib | `lib/archive.ts`: SOURCES, ARTIFACTS (with `place: flight/newsroom`), TIMELINE, STOCK_TOKENS, helpers | WIP |
| Scroll/route engine | component | `components/FlightPath.tsx`: waypoints `[data-wp]`, `data-reveals` pops `.pop` cards | FINAL |
| Parallax stack | component | `components/Stack.tsx`: `--enter`/`--cover`, `[data-speed]` layers | FINAL |
| Preloader | component | `components/MemoryLane.tsx` | TENTATIVE |
| Hero pieces | components | `GlyphField.tsx` (canvas glyphs + `EMBLEM`), `LiquidLens.tsx` (SVG turbulence backdrop filter), `HeroPlane.tsx`, `ChainBadge.tsx` | TENTATIVE |
| Plane | component | `components/Airplane.tsx` | FINAL |
| Cards | component | `components/Moment.tsx` (`Moment`, `Figure`, `Pills`, `Waypoint`) | TENTATIVE |
| Live widgets | components | `LiveWindow.tsx`, `MiniQuotes.tsx`, `ChainPulse.tsx`, `ImpactWindow.tsx`, `TokenRegistry.tsx` | FINAL (prototype) |
| Chrome | components | `SiteHeader.tsx` (auto-inverse), `SiteFooter.tsx`, `ProgressStrip.tsx`, `Timeline.tsx`, `Guilloche.tsx`, `Chip.tsx`, `Actions.tsx` (VerifyButton, SearchButton, EnterLink with depart event) | FINAL |
| Overlays | components | `ArchiveProvider.tsx` (context, Ctrl+K, trapTab), `VerifyDrawer.tsx`, `SearchOverlay.tsx`, `SmoothScroll.tsx` (Lenis on `window.__lenis`) | FINAL |
| Deleted this session | — | `app/library/origins`, `Stop.tsx`, `ChapterStrip.tsx`, `CommissionSlip.tsx`, `PaperPlane.tsx`, `DirectionSwitcher.tsx`, `lib/directions.ts`, `app/styles` | Removed |
| This handoff | doc | `handoff_robinhood-library_20260911.md` (root) | FINAL |

---

## 10. Technical Context (MODE C: Web3, read-only onchain)

- **Stack:** Next.js 16.3.4 (App Router, Turbopack dev), React ~19.2, TypeScript ~5.9, Lenis ^1.3.26, next/font/google (Libre_Caslon_Display, Instrument_Sans, Geist_Mono). No wallet libs; no contracts written or deployed. Windows 11, Node 24.12.0, npm 11.6.2.
- **Network(s):** Robinhood Chain mainnet (read-only via RPC + Robinhood Stock Token REST API).
  - **Mainnet:** chain ID **4663**, RPC `https://rpc.mainnet.chain.robinhood.com`, explorer `https://robinhoodchain.blockscout.com` (token URLs `/token/{address}`).
  - **Testnet:** chain ID **46630**, RPC `https://rpc.testnet.chain.robinhood.com`, explorer `explorer.testnet.chain.robinhood.com`.
  - Arbitrum-based L2, EVM-compatible, ETH gas, first-come-first-served sequencing.
- **Contract addresses (canonical Stock Tokens on 4663, from the official registry):**
  - GME `0x1b0E319c6A659F002271B69dB8A7df2F911c153E`
  - AMC `0x05a3d1Cd21d0C88145E82600E62e7E496e0F222B`
  - TSLA `0x322F0929c4625eD5bAd873c95208D54E1c003b2d`
  - NVDA `0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC`
  - SPY `0x117cc2133c37B721F49dE2A7a74833232B3B4C0C`
  - AAPL `0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9`
  - WETH `0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73`
  - USDG `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`
  - The project token is **not deployed**.
- **Key values:**
  - **Stock Token API:** base `https://api.robinhood.com/rhj/`. Endpoints `/assets` (194 active assets; fields `tokenSymbol`, `tokenName` "X • Robinhood Token", `deployments[{contractAddress, chainId}]`, `currentMultiplier`, `status`), `/prices/{symbol}` (`bid`, `ask`, `dailyHigh`, `dailyLow`, `generatedAt`, `isTradingHalt`; raw underlying price, **not** multiplier-adjusted) and `/corporate-actions`. 60 req/s; cache /prices 15s, corporate-actions 1h; no auth; no CORS.
  - **RPC call used:** `eth_getBlockByNumber ["latest", false]`. Block height was ~60.35M on 2026-09-11.
  - **App internals:** sessionStorage `rl-lane` (preloader seen); `<html>` classes `motion` (animations allowed), `intro` (preloader playing), `is-locked` (overlay open); `window.__lenis`; window event `library:depart` (plane take-off before navigating to `/flight`); SVG filter id `liquid-lens`.
- **Verified history (sources opened this session):**
  - 2013 founded, Palo Alto.
  - 800,000 waitlist invited before public launch, 2015-03-12. The same post gives $0 commissions and minimums, iPhone only, $5M saved, $212M+ traded, 25% first investment account.
  - 2018-02-22: BTC/ETH trading in CA, MA, MO, MT, NH.
  - 2021-01-28: temporary buying limits. SEC report press release 2021-10-18.
  - 2025-06-30: 200+ US stock/ETF tokens for eligible EU customers on Arbitrum, plus the L2 announced as in development.
  - 2026-02-10: public testnet. Partners Alchemy, Allium, Chainlink, LayerZero, TRM.
  - 2026-07-01: mainnet on Arbitrum. Stock Tokens in 120+ countries via Robinhood Wallet, 24/7. Day-one AMMs Uniswap + Pleiades; Alchemy, BitGo, Chainlink integrations; venues Uniswap, Rialto, Lighter, Arcus, 1inch; lending and borrowing.
  - **Pending (found via search, not opened):** IPO 2021-07-29 (HOOD, $38), Web3 wallet beta 2022-09-27, EU crypto 2023-12-07.
- **ABI notes:** none (no contract interaction beyond block reads).
- **Gas findings:** N/A.
- **Security flags:** none in code. Trademark/affiliation risk is the main compliance concern (see Section 7).
- **Gotchas discovered:** see Section 6. The top ones:
  - Set `backdropFilter: url(#…)` inline, not in CSS.
  - No `feImage` inside backdrop filters.
  - Clear `.next/types` after deleting routes.
  - Test visuals in a fronted tab; hidden tabs freeze animations.
  - A missing plugin hook (`agent-validator.py`) prints an error after every file edit. It is harmless: the writes succeed.
- **What NOT to do:**
  - Don't trace or embed Robinhood's logo.
  - Don't put numbers in Impact or token metrics without data.
  - Don't call the Stock Token API from the browser.
  - Don't key tokens by ticker.
  - Don't commit.
  - Don't reintroduce the deleted B/C styles or paper plane unless asked.

---

## 11. Samuel's Preferences Observed
- **Communication style:** very casual and terse, with typos ("lets see", "make it an actual plane", "A works....well"). Often sends new instructions mid-turn.
- **Output format:** drives by **visual references** (screenshots, URLs) and expects Claude to pull the animation or feel from them. Wants to see it running in the preview rather than read about it.
- **Pace:** fast iterative loops. Build → look → redirect. Fine with big rebuilds.
- **Likes:** the plane on a dotted route, pop-up card reveals, parallax sections, cinematic preloaders, premium dark fintech heroes, liquid-glass effects.
- **Dislikes:** cards that feel generic ("not well designed to taste"), paper-looking plane.
- **Notable corrections made:**
  - Chapter-by-chapter history → Robinhood Chain-era achievements only.
  - Paper plane → real plane.
  - Light hero → dark reference-style hero with an emblem.
  - Picked direction A and asked for "lots of tweaks".
  - Dismissed one clarifying question (about what to change on the plane) and then gave a short direct instruction instead. Ask only when truly necessary, with tight options.

---

## 12. Onboarding Prompt for Next Session

> You are continuing **Robinhood Library** (an independent, unofficial archive + live Robinhood Chain intelligence site) with Samuel. This is handoff #1. Read this document fully before responding. Do not ask for context already here.
>
> The Next.js 16 prototype lives in `C:\Users\samue\Desktop\Web3 Works\Robinhood` and runs at http://localhost:3000 via the Browser pane config `robinhood-library` (`npm run dev`). Nothing is committed; don't commit unless Samuel asks.
>
> Samuel's immediate focus: **react to and refine the latest round**:
> - the dark hero with the liquid-glass lens (`components/LiquidLens.tsx`) and the `$` glyph field with the feather emblem (`components/GlyphField.tsx`);
> - the redesigned pop-up cards on `/flight` (`components/Moment.tsx`).
>
> Also ask what the "Something else" landing section he ticked should be.
>
> Key values needed verbatim:
> - Robinhood Chain mainnet ID 4663, RPC `https://rpc.mainnet.chain.robinhood.com`, explorer `robinhoodchain.blockscout.com`.
> - Stock Token API `https://api.robinhood.com/rhj/` (one symbol per `/prices/{symbol}` call, no CORS, so it goes through `/api/market/stock-tokens`).
> - Canonical GME Stock Token `0x1b0E319c6A659F002271B69dB8A7df2F911c153E`.
> - No contracts are deployed and the project token doesn't exist yet. Do not deploy anything.
>
> Not yet locked:
> - The lens and glyph hero look.
> - The new card anatomy.
> - The memory-lane preloader look.
> - The **original feather emblem**, used instead of Robinhood's logo because the spec forbids brand marks. Samuel asked for "the Robinhood emblem" and hasn't confirmed the substitute.
>
> Do not re-suggest:
> - putting `backdrop-filter: url(#liquid-lens)` in CSS (Next rewrites it; keep it inline);
> - `feImage` lens maps inside backdrop filters (Chrome refuses them);
> - multi-symbol Stock Token price calls (they 404);
> - reusing `.lane` as an `<html>` class (it blanked the page).
>
> Test visuals in a fronted tab without hijacking Samuel's `tab-3`. Hidden tabs freeze animations and can't be screenshotted.
>
> Begin by confirming in one sentence what you'll work on first.

---
*Handoff generated by session-handoff skill — Samuel Maji / Web3 edition v1.0*
