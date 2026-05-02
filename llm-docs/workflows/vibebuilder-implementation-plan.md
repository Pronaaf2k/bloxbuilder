# VibeBuilder Implementation Plan

## Implementation Status

- Last updated: `2026-05-02`
- Overall status: `Phase 1 complete, Phase 2 in progress`
- Done:
  - Added `src/modules/vibe-builder/` module entry point
  - Added protected routes for dashboard, site settings, and editor
  - Added public live-site routes
  - Added sidebar entry for VibeBuilder
  - Added first placeholder pages for dashboard, site settings, editor, and public renderer
  - Added VibeBuilder GraphQL types, queries, mutations, services, and hooks for `Site` and `SitePage`
  - Fixed runtime regressions introduced during initial wiring
- In progress:
  - Phase 2 project and page management
- Next:
  - Add rename/delete flows for pages
  - Add rename/delete flows for sites

## Progress Log

### [2026-05-01] Foundation wiring complete

- Added `src/modules/vibe-builder/` module exports.
- Added protected routes for dashboard, site settings, and editor.
- Added public routes for live-site rendering.
- Added sidebar entry for VibeBuilder.
- Added first placeholder pages for the dashboard, site settings, editor, and live renderer.

### [2026-05-01] Runtime regressions fixed

- Replaced an unsupported sidebar icon that could crash the shell.
- Added a defensive guard in `src/components/core/menu-icon/menu-icon.tsx` so an invalid icon name returns `null` instead of crashing the app.
- Removed `Button asChild` usage from the initial VibeBuilder pages to avoid the Radix `Slot` single-child runtime error.

### [2026-05-01] Data layer scaffold complete

- Added VibeBuilder `Site` and `SitePage` types.
- Added GraphQL queries and mutations for `Site` and `SitePage`.
- Added service helpers for listing, creating, updating, and deleting sites and pages.
- Added React Query hooks for the new VibeBuilder data layer.
- Marked the Phase 1 GraphQL data-layer task as complete.

### [2026-05-01] Dashboard and create-site flow started

- Replaced the placeholder VibeBuilder dashboard with a real data-driven dashboard view.
- Wired the dashboard to owned-site queries using the authenticated user and selected organization context.
- Added create-site dialog and form validation.
- Wired create-site submission to the `insertSite` mutation hook.
- Added loading, empty, and backend-not-ready error states.
- Added direct links from site cards into the site settings route and public preview route.

### [2026-05-01] Site settings and page creation started

- Replaced the placeholder site settings page with a data-driven site overview.
- Wired the site settings route to load the selected site using authenticated ownership filters.
- Wired the page list to `SitePage` queries scoped to the current site.
- Added create-page dialog and form validation.
- Wired create-page submission to the `insertSitePage` mutation hook.
- Added page cards with editor-route and public-preview links.
- Added loading, empty, and backend-not-ready error states for both site and page queries.

### [2026-05-01] Runtime hardening for missing backend schemas

- Added graceful mutation error handling for create-site and create-page flows.
- Replaced uncaught backend schema failures with inline guidance that tells the user to import the generated VibeBuilder schema first.
- Hardened `MenuIcon` with a safe fallback icon path.
- Suppressed generic global mutation toasts for VibeBuilder CRUD flows so backend-setup failures do not surface as noisy `[object Object]` notifications.

### [2026-05-01] Data Gateway query naming corrected

- Verified the Data Gateway Playground schema.
- Updated VibeBuilder list queries to use `getSites` and `getSitePages`, matching the actual GraphQL API exposed by SELISE Data Gateway.

### [2026-05-01] Schema field compatibility fix

- Updated create-site payload handling so `ThemeConfig` is sent as a stringified JSON value, matching the current `Site` schema field type in Data Gateway.

### [2026-05-01] Visibility filter fix for newly created records

- Removed strict `IsDeleted: false` list filters that could hide newly created Data Gateway records when the field was not explicitly persisted.

### [2026-05-01] Creation flow improvements

- Removed `IsDeleted` from create payloads after confirming the generated insert input types do not accept it.
- Updated create-site to navigate into the new site on success.
- Updated create-page to navigate directly into the editor for the new page on success.
- Improved inline mutation error parsing so backend messages are shown cleanly instead of raw serialized payloads.

### [2026-05-01] Backend contract hardening

- Centralized allowed Data Gateway fields for `Site` and `SitePage` create/update payloads.
- Added payload sanitization in the VibeBuilder service layer so unsupported frontend fields are automatically stripped before mutations are sent.
- This reduces repeat backend mismatch regressions when the UI evolves faster than the Data Gateway schema.

### [2026-05-01] Delete flows added to site settings

- Added delete-site action to the site settings page with confirmation.
- Deleting a site now navigates back to `/vibe-builder`.
- Added delete-page actions to page cards inside the site settings page.
- The site settings surface now covers create, list, and delete for pages, and delete for sites.

### [2026-05-01] Rename flows added to site settings

- Added rename-site dialog to the site settings page.
- Added rename-page dialogs accessible from each page card.
- Site and page CRUD are now functionally complete in the current VibeBuilder surfaces.

### [2026-05-01] Site settings runtime fix

- Fixed a render-time crash in `VibeBuilderSiteSettingsPage` caused by referencing `site` before it was initialized.
- Restored access to the site settings route for created websites so implementation can continue on top of a stable CRUD surface.

### [2026-05-02] Shared shell noise reduced for builder routes

- Disabled notification polling/subscription UI inside `/vibe-builder` routes.
- Reduced SignalR/WebSocket console noise from the shared shell while working in the builder.

### [2026-05-02] Page ordering and home-page management added

- Added move-up and move-down page actions in the site settings page.
- Added `Set home page` action that updates both `Site.HomePageId` and `SitePage.IsHomePage` flags.
- The site settings surface now supports basic navigation management for multi-page sites.

### [2026-05-02] Image block upload integration added

- Reused the existing SELISE Media presigned upload pattern from the project.
- Added file upload support to image blocks in the editor properties panel.
- Uploaded image URLs are now written back into layout JSON so image blocks no longer depend only on pasted URLs.

### [2026-05-02] No-code block library expanded

- Expanded the editor block library with Google Sites-style no-code sections.
- Added `Button`, `Divider`, `Spacer`, and `Social links` blocks.
- Extended the properties panel so these blocks can be configured without exposing any coding concepts.

### [2026-05-02] Draft hydration race fixed

- Fixed an editor hydration race where the page record could arrive before the saved `SitePageLayout`, causing the editor to initialize an empty draft and ignore the real saved layout on refresh.
- The editor now waits for the layout query to finish before hydrating the initial page state.

### [2026-05-02] Local draft fallback added

- Added local draft persistence keyed by site and page so refreshes do not lose editor work even if backend layout fetch timing is inconsistent.
- The editor still prefers the backend `SitePageLayout` when present, but now falls back to locally saved draft state when needed.

### [2026-05-02] Per-page editor isolation fix

- Reset editor hydration and in-memory layout state whenever the route switches to another page.
- Prevented one page from reusing another page's draft blocks when navigating between pages inside the editor.

### [2026-05-02] Autosave loop fix

- Removed a save-loop condition in the editor where updating the layout version number could retrigger autosave repeatedly.
- Moved layout version and layout record tracking into refs so autosave no longer recursively schedules more saves after a successful write.

### [2026-05-02] Builder auth-redirect hardening

- Added a query/mutation option to suppress automatic auth redirect behavior in the shared React Query wrappers.
- Applied that suppression to VibeBuilder queries and mutations so transient UDS auth failures no longer immediately log the user out while editing.

### [2026-05-02] Shared shell auth-noise isolation for builder routes

- Disabled shared account/org/profile fetch dependencies on `/vibe-builder` routes where they were not required for the editor itself.
- Switched VibeBuilder route ownership filters to fall back to `user_id` from the JWT when account/profile hydration is skipped.
- This reduces unrelated `GetAccount`/`GetOrganizations` 401 churn while keeping builder-specific data access working.

### [2026-05-02] Explicit logout redirect fix

- Hardened the shared session-expiration handler so it now forces a browser-level redirect to `/login` after clearing auth state.
- This prevents the app from getting stuck on a builder screen showing a logout toast without actually navigating away.

### [2026-05-02] Publish flow and live renderer started

- Added a publish action to the editor.
- Publishing now writes a `published` `SitePageLayout` snapshot for the current page.
- Publishing updates related page/site metadata for published state tracking.
- Replaced the public live-site placeholder with a renderer that loads published page layouts.
- Added a default shared navbar and footer so all pages in the same site share the same top and bottom chrome.

### [2026-05-02] Internal live-route link normalization

- Updated published button/social/CTA links so site-internal paths resolve under `/site/:siteSlug/...` instead of the app root.
- This keeps no-code navigation inside the generated website instead of bouncing users back into the builder app routes.

### [2026-05-02] Editor page switcher added

- Added a page switcher section above the component library in the editor.
- Users can now move between pages in the same site without navigating back to the site settings screen.
- The existing site/page/editor flow was preserved without introducing a new top-level Pages tab.

### [2026-05-02] In-editor page creation added

- Added a `Create page` action directly inside the editor’s Pages section.
- Users can now create a new page without leaving the editor workflow.
- Successful page creation immediately opens the new page in the editor.

### [2026-05-02] Theme preset customization started

- Added a site-wide theme preset model inspired by Google Sites and WordPress default theme pickers.
- Added a Themes section to the editor sidebar.
- Persisted the chosen preset through `Site.ThemeConfig`.
- Applied the active preset to the published site renderer so the live site reflects site-wide visual choices.

### [2026-05-02] Auth refresh path hardened for builder stability

- Fixed the shared HTTP refresh flow so successful token refreshes now persist rotated `refresh_token` values instead of only updating the access token.
- Added single-flight refresh behavior so concurrent 401s reuse one refresh request instead of racing multiple refresh calls.
- This reduces the repeated refresh-endpoint 400 failures that could cascade into builder-session instability while editing.

### [2026-05-02] Typography controls added

- Added site-wide typography controls in the editor for font pair selection and text scale.
- Extended `Site.ThemeConfig` parsing so theme presets can be overridden with saved heading/body font choices and size scales.
- Applied the typography settings to the editor canvas previews and the published site renderer.

### [2026-05-02] Theme templates and left-rail spacing improved

- Increased the editor’s left-rail width and relaxed card/header/body spacing so page, theme, typography, and block-library text is easier to scan.
- Updated theme selection so choosing a theme now swaps the current page into a matching editable starter layout instead of only changing visual tokens.
- Starter layouts are still normal blocks, so users can immediately edit, delete, or extend the generated sections.

### [2026-05-02] Block library expanded for no-code site building

- Added a reusable VibeBuilder block catalog grouped into `Basic`, `Layout`, `Media`, `Business`, and `Advanced` categories.
- Added block definitions, starter content, canvas previews, and live rendering support for a much broader beginner-friendly component set, including headings, sections, columns, cards, galleries, video, forms, maps, pricing, testimonials, FAQ, team, services, stats, CTA, navbar, footer, tabs, carousel, timeline, tables, code/embed, product, blog/article, and icon blocks.
- Extended the editor properties panel so the new blocks expose practical editable content fields without breaking the existing drag/drop or add-block flow.

### [2026-05-02] Repeat-item controls added to block editors

- Fixed the main scalability limitation in the new properties panel by adding real add/remove controls for repeatable content collections.
- Users can now add and remove social links, gallery items, form fields, pricing plans and plan features, testimonials, FAQ items, team members, services, stats, navbar links, footer links, footer social links, tabs, carousel slides, and timeline items directly in the editor.
- Hardened the shared block factory so new block instances deep-clone their default nested props instead of reusing array/object references across blocks.

### [2026-05-02] Editor usability improved with tabs and internal scroll

- Reworked the left rail into `Site` and `Blocks` tabs so setup controls and the large component library no longer compete in one long vertical column.
- Added desktop sticky side panels with their own internal scroll regions for the left rail and properties panel.
- This reduces full-page scrolling while editing large pages or working with the expanded block catalog.

### [2026-05-02] AcneStudio starter site generator added

- Added a one-time in-app content generator for the `acnestudio` site that creates a fuller multi-page website structure through the normal VibeBuilder page/layout mutations.
- The generator applies a curated theme preset, creates or updates core pages like `About`, `Services`, `Work`, `Pricing`, `Journal`, `FAQ`, and `Contact`, and seeds them with practical layouts that exercise the expanded block system.
- This avoids hardcoding mock pages in source only and instead populates the existing site data model with editable draft and published layouts.

### [2026-05-02] Starter-site sync flow corrected

- Removed the hidden automatic starter-site mutation behavior from editor load and replaced it with an explicit `Apply AcneStudio starter site` action in the editor header.
- The action now rewrites both draft and published layouts together, invalidates VibeBuilder queries, and refreshes the current editor page state so the visual editor starts from the same generated content that the public site renders.
- This reduces confusion between draft-only editor state and published-only public rendering when seeding the AcneStudio site.

### [2026-05-01] Editor MVP started

- Added `SitePageLayout` types, GraphQL queries, mutations, services, and hooks.
- Replaced the editor placeholder with a working V1 editor surface.
- Added a block library for `Hero`, `Text`, and `Image` blocks.
- Added sortable canvas reordering with `@dnd-kit`.
- Added block selection and property editing in the right-hand panel.
- Added draft autosave to `SitePageLayout` records.
- Added direct navigation from page creation into the editor so the page-building flow is now continuous.

### [2026-05-01] Database schema export prepared

- Added `vibe_builder_schema_export.json` in the project root.
- Kept the standard/base SELISE fields on each new schema so it matches the existing export style.
- Prepared initial schemas for `Site`, `SitePage`, `SitePageLayout`, and `SiteAsset`.

## Goal

Build VibeBuilder as a multi-tenant SaaS website builder on top of the existing React/Vite SELISE Blocks Construct app. Users should be able to sign up, create isolated website projects, visually compose multi-page websites with drag and drop, upload media through SELISE Media, and publish public live sites without using a traditional database.

## Fit With Current Codebase

This repo already has the main foundations needed for the project:

- React + Vite application shell
- Auth guard and persisted auth store in `src/state/store/auth/index.tsx`
- React Query provider in `src/state/query-client/index.tsx`
- Existing GraphQL client in `src/lib/graphql-client.ts`
- Existing GraphQL CRUD module patterns in `src/modules/task-manager/`
- Existing Media presigned upload flow patterns in `src/modules/task-manager/components/task-details-view/attachment-section.tsx`
- Existing routing and sidebar architecture in `src/routes/app-routes.tsx`
- Existing drag/drop libraries already installed: `@dnd-kit/core`, `@dnd-kit/sortable`, `react-dnd`

Because of that, the best implementation is to add a new VibeBuilder module and reuse the existing auth, GraphQL, upload, and route conventions.

## Required Applications and Surfaces

The project should be implemented as three connected application surfaces inside the same product:

1. Builder dashboard
Used after login for listing websites, creating projects, and opening the editor.

2. Visual editor
Protected app surface for page management, drag-and-drop composition, property editing, autosave, and publish controls.

3. Live site renderer
Public-facing surface that reads published page JSON and renders websites by owner/project/page slug.

## Core Feature Scope

### 1. Tenant and user management

- Use SELISE IAM for registration, login, session handling, and user identity.
- Use the authenticated user and org context from the existing auth store.
- Ensure every website query and mutation is filtered by owner or organization scope.
- Users must only see their own website projects and pages.

### 2. Website and page management

- Create website project
- Rename website project
- Delete website project
- List all projects for current user
- Create multiple pages per project
- Rename page
- Delete page
- Reorder pages in navigation
- Configure page slug, title, SEO title, SEO description
- Support draft and published versions

### 3. Drag-and-drop editor

- Left panel: component library
- Center: canvas
- Right panel: property editor
- Drag components into the canvas
- Reorder blocks within a page
- Select a block and edit content/style/settings
- Support nested structures only where required, not globally
- Show immediate preview updates

### 4. Content persistence

- Persist page layout as JSON through SELISE Blocks APIs only
- Store draft state separately from published state
- Save metadata like revision, updatedAt, updatedBy, publish status
- Use debounced autosave plus explicit publish action

### 5. Media handling

- Upload images through SELISE Media using the existing presigned upload pattern
- Store returned public URL and file metadata in block props or asset records
- Support image replacement and deletion from the editor

### 6. Live publishing

- Publish a complete project or selected pages
- Public site routes should resolve page JSON by project slug and page slug
- Live renderer must be separate from editor routes
- Published site must handle navigation across multiple pages

## Recommended Route Structure

Add a new module and routes similar to the existing app route pattern.

Protected routes:

- `/vibe-builder` - website list/dashboard
- `/vibe-builder/:siteId` - site overview/settings
- `/vibe-builder/:siteId/editor/:pageId` - visual editor
- `/vibe-builder/:siteId/assets` - optional asset manager view

Public routes:

- `/site/:siteSlug` - default home page for published site
- `/site/:siteSlug/:pageSlug` - published page renderer

If the product must eventually support custom domains, keep the public renderer abstraction separate so domain-based routing can be added later without changing the content schema.

## Recommended Module Structure

Create a dedicated module family under `src/modules/vibe-builder/`.

Suggested structure:

- `pages/`
- `components/`
- `services/`
- `graphql/`
- `hooks/`
- `types/`
- `store/`
- `utils/`
- `renderers/`

Suggested page/components split:

- `pages/vibe-builder-dashboard/`
- `pages/vibe-builder-editor/`
- `pages/vibe-builder-site-settings/`
- `pages/vibe-builder-live-site/`
- `components/component-library/`
- `components/editor-canvas/`
- `components/sortable-block/`
- `components/property-panel/`
- `components/page-tree/`
- `components/topbar-publish/`
- `components/live-block-renderer/`

## SELISE Blocks Services to Use

### IAM Block

- User registration
- Login and access control
- Current user identity for ownership filtering

### Content or dynamic data service via GraphQL gateway

- Store site, page, revision, and publish records
- Reuse the `graphqlClient` pattern already present in the repo
- Use JSON-capable fields for layout content

### Media Block

- Presigned URL generation
- Public asset delivery
- Image metadata persistence

## Data Model Recommendation

The most important part of the implementation is the content schema. Keep it normalized enough for listing and publish workflows, but keep the page layout itself as a single JSON document for fast editor hydration.

### Entity 1: Site

Purpose: top-level website project.

Suggested fields:

- `ItemId`
- `OwnerUserId`
- `OrganizationIds`
- `Name`
- `Slug`
- `Description`
- `Status` (`draft`, `published`, `archived`)
- `ThemeConfig` (JSON)
- `HomePageId`
- `PublishedRevisionId`
- `CreatedBy`
- `CreatedDate`
- `LastUpdatedBy`
- `LastUpdatedDate`
- `Tags`

### Entity 2: SitePage

Purpose: page metadata and ordering.

Suggested fields:

- `ItemId`
- `SiteId`
- `Name`
- `Slug`
- `Order`
- `IsHomePage`
- `SeoTitle`
- `SeoDescription`
- `DraftLayoutVersion`
- `PublishedLayoutVersion`
- `CreatedBy`
- `CreatedDate`
- `LastUpdatedBy`
- `LastUpdatedDate`

### Entity 3: SitePageLayout

Purpose: draft or published layout snapshot for a specific page.

Suggested fields:

- `ItemId`
- `SiteId`
- `PageId`
- `Version`
- `Status` (`draft`, `published`)
- `LayoutJson` (stringified JSON if raw JSON field is not supported)
- `SchemaVersion`
- `PreviewImageUrl`
- `CreatedBy`
- `CreatedDate`

### Entity 4: SiteAsset

Purpose: optional asset registry for uploaded files.

Suggested fields:

- `ItemId`
- `SiteId`
- `PageId` (nullable)
- `FileName`
- `FileUrl`
- `MimeType`
- `FileSize`
- `AltText`
- `CreatedBy`
- `CreatedDate`

## Layout JSON Recommendation

Use a block-based schema optimized for editor hydration, autosave, and renderer simplicity.

```json
{
  "schemaVersion": 1,
  "page": {
    "id": "page_home",
    "title": "Home",
    "slug": "home"
  },
  "theme": {
    "palette": "default",
    "fontHeading": "inherit",
    "fontBody": "inherit"
  },
  "blocks": [
    {
      "id": "block_hero_1",
      "type": "hero",
      "props": {
        "headline": "Build fast",
        "subheading": "Launch without code",
        "ctaLabel": "Get started",
        "ctaHref": "/contact",
        "backgroundImage": {
          "url": "https://...",
          "alt": "Hero"
        }
      },
      "style": {
        "paddingTop": 96,
        "paddingBottom": 96,
        "textAlign": "center",
        "backgroundColor": "#ffffff"
      }
    }
  ]
}
```

Design rules for the schema:

- Every block gets a stable `id`
- `type` maps to a renderer component
- `props` stores business content
- `style` stores visual controls
- Keep nesting minimal in version 1
- Use a `schemaVersion` for future migrations

## V1 Component Library

Start with a small, useful set of Vibe Components rather than a huge library.

Recommended V1 blocks:

- Hero
- Rich text section
- Image block
- Image gallery
- Features grid
- CTA banner
- Testimonial section
- Contact form
- Spacer
- Divider
- Header/navigation block
- Footer block

Why this scope:

- Covers the demo requirements well
- Limits schema complexity
- Gives enough variety to build realistic multi-page sites

## State Management Plan

Use two layers of state.

### Server state

- React Query for loading site lists, pages, layouts, published snapshots, and assets
- Optimistic updates for page rename/reorder and block reorder when safe

### Editor client state

- Dedicated Zustand store for current site/page editor session
- Selected block id
- Current block tree
- Dirty state
- Last save time
- Save status (`idle`, `saving`, `saved`, `error`)
- Undo/redo stacks if time permits

Editor store responsibilities:

- Hydrate from page layout API
- Apply drag/drop reorder operations locally first
- Debounce serialization and persist via mutation
- Recover gracefully on save failure

## Drag-and-Drop Implementation Approach

Use `@dnd-kit` for the editor because it is already installed and is better aligned with sortable canvas interactions.

V1 behavior:

- Drag a component from the library to append to page
- Drag existing blocks to reorder vertically
- Click block to select it
- Edit properties in right sidebar
- Persist after debounce, not on every pointer movement

Avoid in V1:

- Arbitrary deep nesting
- Complex grid layout authoring
- Pixel-perfect freeform positioning

Those features would add large complexity and are not required by the brief.

## Publish Model

Do not publish directly from draft JSON. Use an explicit publish step.

Recommended flow:

1. User edits draft layout.
2. Autosave writes to the draft layout record.
3. User clicks Publish.
4. Backend mutation copies latest draft into a published layout version.
5. Site or page metadata updates `PublishedRevisionId` or `PublishedLayoutVersion`.
6. Public renderer reads only published content.

Benefits:

- Draft work never leaks publicly
- Live site remains stable
- Rollback/versioning becomes easier later

## Live Renderer Plan

The live renderer should be a pure block renderer, not the editor reused in read-only mode.

Responsibilities:

- Resolve site by `siteSlug`
- Resolve page by `pageSlug` or site home page
- Load published layout only
- Map each block `type` to a public renderer component
- Render navigation from page metadata
- Return 404 for missing unpublished routes

Keep editor-only metadata out of the public renderer whenever possible.

## Security and Isolation Rules

- All protected queries must include owner or organization filtering
- Public routes must never expose draft data
- Publish mutations must validate ownership
- Media uploads should use public access only for assets that are intentionally exposed on live sites
- Any private or temporary uploads should remain private until attached and published

## Performance Plan

To satisfy the brief's snappy UX requirement:

- Hydrate editor with a single page layout fetch
- Keep the entire page layout in local editor state
- Debounce autosave by 500 to 1500 ms after meaningful edits
- Avoid network calls during drag motion
- Persist only after drop or property changes settle
- Use lightweight block renderers in the editor preview
- Prefetch adjacent page metadata where useful

## Implementation Phases

### Phase 1: Foundation

- [done] Add `vibe-builder` module skeleton
  Note: Implemented in `src/modules/vibe-builder/` with page exports and page stubs.
- [done] Add protected routes and sidebar entry
  Note: Added routes in `src/routes/app-routes.tsx` and sidebar item in `src/constant/sidebar-menu.ts`.
- [done] Add site list page and empty-state flow
  Note: Added an initial dashboard placeholder/empty-state page at `/vibe-builder`.
- [done] Create GraphQL types, queries, and mutations for `Site` and `SitePage`
  Note: Added GraphQL contracts, services, and React Query hooks under `src/modules/vibe-builder/`.

### Phase 2: Project and page management

- [completed] Create site CRUD
  Note: Site listing, create-site, rename-site, and delete-site flows are implemented.
- [completed] Create page CRUD
  Note: Page listing, create-page, rename-page, and delete-page flows are implemented on `/vibe-builder/:siteId`.
- [completed] Add page ordering and slug management
  Note: Page move-up/move-down and home-page selection are now implemented on the site settings page.
- [in progress] Add site settings and home page selection
  Note: The site settings route now loads site/page data and auto-marks the first created page as the home page.

### Phase 3: Editor MVP

- [in progress] Build component library
  Note: `Hero`, `Text`, `Image`, `Button`, `Divider`, `Spacer`, and `Social links` blocks are now available in the editor.
- [in progress] Build canvas with sortable blocks
  Note: Sortable block reordering is implemented for a single-column canvas.
- [in progress] Build property panel
  Note: Selected block properties can now be edited from the right-hand panel.
- [in progress] Add layout JSON serialization and hydration
  Note: Layout JSON is now parsed and serialized through `SitePageLayout.LayoutJson`.
- [in progress] Add draft autosave state and save indicators
  Note: Draft autosave and save-state badges are implemented for the editor.

### Phase 4: Media integration

- [completed] Reuse the existing Media presigned upload pattern
- [completed] Add image field controls in property panel
- [in progress] Persist asset references into block props and optional asset records
  Note: Image block URLs are now persisted in layout JSON; a separate `SiteAsset` registry flow is still optional follow-up work.

### Phase 5: Public renderer and publish flow

- [done] Add public routes
  Note: Added `/site/:siteSlug` and `/site/:siteSlug/:pageSlug` routes.
- [in progress] Add published layout fetch logic
  Note: Public renderer now fetches site, page, and published layout data for live rendering.
- [in progress] Build live block renderer map
  Note: Current live renderer supports the existing no-code block set used by the editor.
- [in progress] Implement publish mutation flow
  Note: Editor publish action writes/updates `published` page layout snapshots and related metadata.

### Phase 6: Hardening

- [pending] Add validation for slugs and duplicate page names
- [pending] Add loading/error states
- [pending] Add permission checks
- [pending] Add basic revision visibility
- [pending] Add tests for schema mapping and editor reducer/store logic

## Suggested Deliverables for a Strong Submission

- Multi-user website dashboard with isolated projects
- Visual multi-page editor with drag/drop and real-time property updates
- Persisted JSON schema stored via SELISE Blocks APIs
- Media upload through SELISE Media
- Public published site renderer with routing
- Clear architecture explanation of why the schema is designed this way

## Risks and Mitigations

### Risk: overbuilding nested layout support too early

Mitigation: keep V1 to a linear block stack with optional controlled nested components like gallery items.

### Risk: autosave causing lag or race conditions

Mitigation: debounce mutations, use a single in-flight save policy, and ignore stale responses by version or timestamp.

### Risk: schema becoming hard to evolve

Mitigation: add `schemaVersion`, stable block ids, and a layout migration utility from day one.

### Risk: public renderer accidentally reading draft state

Mitigation: separate draft and published records and never query draft content from public routes.

## Acceptance Criteria

The implementation should be considered complete when:

- A user can sign up and log in with SELISE IAM.
- A user can create multiple isolated website projects.
- Each project can contain multiple pages.
- A user can drag blocks into a page, reorder them, and edit properties.
- The page layout is serialized to JSON and persisted through SELISE Blocks APIs.
- Images are uploaded and served through SELISE Media.
- Edits autosave reliably.
- A site can be published.
- The public site renderer supports navigation across pages and only shows published content.

## Recommended Next Build Order

1. Build site and page CRUD first.
2. Lock the layout JSON schema before building too many UI controls.
3. Implement the editor with three V1 blocks first: Hero, Rich Text, Image.
4. Add autosave.
5. Add publish and live rendering.
6. Expand the component library only after the full flow works end to end.
