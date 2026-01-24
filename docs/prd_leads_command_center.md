# Leads Command Center - Product Requirements Document

## Overview

**Product Name**: Leads Command Center  
**Version**: 1.0  
**Last Updated**: 2026-01-23

A web application for managing Google Maps scraping jobs and working with scraped business leads. Replaces the basic built-in web UI with a full-featured platform for lead generation workflows.

---

## Problem Statement

The current `gosom/google-maps-scraper` web UI is minimal:
- Limited job configuration (no access to all CLI flags)
- No persistent storage or CRM features
- No map visualization for geographic analysis
- Manual CSV exports with no bulk selection

**Target Users**: Lead generation professionals, local business marketers, sales teams.

---

## Goals

| Goal                            | Success Metric                           |
| ------------------------------- | ---------------------------------------- |
| Full CLI flag access via web UI | All 20+ flags configurable in form       |
| Persistent lead storage         | Leads survive across sessions (Supabase) |
| Visual lead exploration         | Map view with clustering for 10k+ leads  |
| CRM-lite features               | Notes, tags, and status per lead         |
| Flexible export                 | Export selected leads to CSV/JSON        |
| SaaS-ready architecture         | Auth infrastructure in place             |

---

## User Stories

### Epic 1: Job Management

| ID  | As a... | I want to...                                                | So that...                                            |
| --- | ------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| J1  | User    | submit a scraping job with all CLI flags                    | I can customize depth, language, geo, proxies, etc.   |
| J2  | User    | see all my jobs in a queue with status                      | I know which jobs are running/completed/failed        |
| J3  | User    | cancel a running job                                        | I can stop a job if I made a mistake                  |
| J4  | User    | see real-time progress + browser notification on completion | I don't have to keep watching                         |
| J5  | User    | re-run a previous job with same settings                    | I can quickly repeat successful scrapes               |
| J6  | User    | save current CLI flags as a named preset                    | I can reuse configurations like "Lisbon Electricians" |
| J7  | User    | load a preset to auto-fill the job form                     | I don't have to reconfigure settings every time       |

### Epic 2: Leads Table

| ID  | As a... | I want to...                                                  | So that...                                                 |
| --- | ------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| L1  | User    | view all scraped leads in a data table                        | I can browse and analyze results                           |
| L2  | User    | search leads by name, category, or location                   | I can find specific businesses                             |
| L3  | User    | filter leads by rating, review count, etc.                    | I can focus on quality leads                               |
| L4  | User    | select multiple leads with checkboxes                         | I can perform bulk actions                                 |
| L5  | User    | export selected leads to CSV, JSON, or Google Contacts format | I can use data in other tools or import directly to Google |
| L6  | User    | see full lead details in a side panel                         | I can view all 33 data points without leaving the table    |

### Epic 3: Map Visualization

| ID  | As a... | I want to...                          | So that...                               |
| --- | ------- | ------------------------------------- | ---------------------------------------- |
| M1  | User    | see leads plotted on a map            | I can understand geographic distribution |
| M2  | User    | see clustered markers for dense areas | The map remains usable with many leads   |
| M3  | User    | click a marker to see lead summary    | I can quickly identify businesses        |
| M4  | User    | draw a region to select leads         | I can bulk-select by geography           |
| M5  | User    | toggle heatmap view                   | I can identify concentration areas       |

### Epic 4: CRM Features

| ID  | As a... | I want to...                              | So that...                        |
| --- | ------- | ----------------------------------------- | --------------------------------- |
| C1  | User    | add notes to a lead                       | I can track my interactions       |
| C2  | User    | add tags to categorize leads              | I can organize by industry/status |
| C3  | User    | set a follow-up reminder                  | I don't forget to contact leads   |
| C4  | User    | mark a lead as contacted/qualified/closed | I can track my pipeline           |

### Epic 5: Authentication

| ID  | As a... | I want to...                          | So that...               |
| --- | ------- | ------------------------------------- | ------------------------ |
| A1  | User    | sign up and log in                    | My data is private       |
| A2  | User    | have my leads persist across sessions | I don't lose my work     |
| A3  | Admin   | (future) manage multiple users        | I can run this as a SaaS |

---

## Functional Requirements

### FR1: Job Submission Form

The form MUST include all CLI flags organized by category:

**Core Options**
- Queries textarea (one per line) — REQUIRED
- Depth (1-100, default: 10)
- Concurrency (1-16, default: auto)
- Output format toggle (CSV/JSON)

**Email & Reviews**
- Extract emails (checkbox)
- Extra reviews (checkbox, up to ~300)

**Location Settings**
- Language (dropdown: en, pt, de, es, fr, etc.)
- Geo coordinates (lat,lng input)
- Zoom level (0-21 slider)
- Radius in meters (input)

**Proxy Configuration**
- Proxies textarea (one per line, format: protocol://user:pass@host:port)

**Advanced**
- Fast mode (checkbox)
- Exit on inactivity (duration input)
- Debug mode (checkbox)

**Preset Management**
- Dropdown to load saved presets (e.g., "Lisbon Electricians", "Porto Restaurants")
- "Save as Preset" button → modal to name and save current configuration
- "Delete Preset" option in dropdown
- Presets stored in Supabase `job_presets` table

### FR2: Leads Table

- Virtual scrolling for 10k+ rows
- **Default visible columns**: Thumbnail, Name, Category, City, Phone, Rating, Actions
- **Hidden columns** (toggleable): Source Query, Website, Email, Address, Reviews Count, Open Hours, etc.
- **Source Query column**: Shows the original search term that found this lead (linked via `input_id` → job)
- Column visibility toggle dropdown
- Sort by any column
- Filter by: rating (min/max), review count, has email, has website, has images, **source query**
- Global search across all text fields
- Multi-select with shift+click range selection
- Export button (CSV/JSON/Google Contacts) for selected rows

**Visual Data Indicators** (icon badges on each row):
| Icon | Meaning      | Field Check                     |
| ---- | ------------ | ------------------------------- |
| 🌐    | Has website  | `website` not empty             |
| 📧    | Has email    | `emails` array length > 0       |
| 📸    | Has photos   | `images` array length > 0       |
| 🍽️    | Has menu     | `menu.link` not empty           |
| 🛒    | Order online | `order_online` array length > 0 |
| 📅    | Reservations | `reservations` array length > 0 |
| ⭐    | High rated   | `review_rating` >= 4.5          |

### FR3: Map View

- MapLibre GL JS with OpenStreetMap tiles
- Cluster markers using supercluster
- Popup on marker click: name, rating, category, quick actions
- Draw rectangle tool for area selection
- Layer toggle: markers / heatmap
- Zoom to fit all visible leads

### FR4: Lead Detail Panel

Slide-in panel (or dedicated tab) showing all data fields:

**Hero Section**:
- Thumbnail image (large)
- Business name + category badge
- Rating stars + review count
- Open/Closed status indicator
- Data indicator badges (🌐📧📸🍽️🛒📅)

**Image Gallery**:
- Carousel of all images from `images` array
- Lightbox mode for full-size viewing
- Download individual images

**Contact Section**:
- Phone (click-to-call on mobile)
- Emails list (all from `emails` array)
- Website link (opens in new tab)
- Social links (extracted from `about` if available)

**Location Section**:
- Full address (from `complete_address`)
- Mini map preview
- "Open in Google Maps" button
- Plus code

**Business Info**:
- Open hours (formatted table by day)
- Popular times chart (if available)
- Price range
- About/Description

**Reviews Section**:
- Reviews summary with star breakdown
- Expandable list of individual reviews
- Reviewer photo, rating, date, text

**CRM Section**:
- Notes timeline (create, edit, delete)
- Tags (add, remove)
- Status dropdown (New, Contacted, Qualified, Closed)
- Follow-up date picker

**Quick Copy Actions** (one-click clipboard buttons):
- Copy phone, email, address, website URL
- Copy all reviews as JSON
- Copy all lead data as JSON (all fields)

**Quick Export Actions** (one-click file download):
- Export lead as JSON file
- Export lead as CSV file (single row with headers)
- Export reviews as JSON file

### FR5: Export

- POST /api/export endpoint
- Accepts: `{ format: 'csv' | 'json' | 'google-contacts', leadIds: string[] }`
- **CSV**: Standard format with UTF-8 BOM for Excel compatibility
- **JSON**: Array of lead objects
- **Google Contacts CSV**: Formatted for direct import to Google Contacts:
  - Maps: Name → Name, Phone → Phone 1 - Value, Email → E-mail 1 - Value
  - Maps: Address → Address 1 - Formatted, Website → Website 1 - Value
  - Maps: Category → Organization 1 - Name (as business type)
  - Includes proper headers required by Google Contacts import
- Triggers browser download

---

## Non-Functional Requirements

| Requirement              | Target                         |
| ------------------------ | ------------------------------ |
| Initial page load        | < 2s                           |
| Table render (10k rows)  | < 1s with virtualization       |
| Map render (10k markers) | < 2s with clustering           |
| Supabase region          | Europe (user-specified)        |
| Browser support          | Chrome, Firefox, Edge (latest) |
| Mobile support           | Responsive, but desktop-first  |

---

## Out of Scope (v1.0)

- Multi-user team features
- Billing/subscription management
- Email outreach integration
- Lead enrichment APIs
- Mobile native apps

---

## UI/UX Design

### Recommended Layout: Master-Detail with Tabs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Leads Command Center                      [User Menu] [Dark Mode]   │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🚀 Jobs]  [📊 Leads]  [🗺️ Map]                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ Leads Tab ─────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  [Search...]  [Filters ▼]  [Columns ▼]  [Export ▼]  [84 selected]   │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────┬─────────────────────┐   │   │
│  │  │  DATA TABLE (60% width)                 │  DETAIL PANEL (40%) │   │   │
│  │  │  ────────────────────────               │  ─────────────────  │   │   │
│  │  │  ☐ 📷 Electro Fonseca   🌐📧  ⭐4.5    │  [Hero Image]       │   │   │
│  │  │  ☑ 📷 Turma Resolvente  🌐📧📸 ⭐4.8   │  Turma Resolvente   │   │   │
│  │  │  ☐ 📷 Megafásica       🌐📧📸🍽️⭐4.9  │  ⭐⭐⭐⭐⭐ (44)      │   │   │
│  │  │  ...                                    │  🌐📧📸🛒           │   │   │
│  │  │                                         │                     │   │   │
│  │  │                                         │  [Gallery ▸▸▸]      │   │   │
│  │  │                                         │                     │   │   │
│  │  │                                         │  📞 928 063 670     │   │   │
│  │  │                                         │  📧 turma@gmail.com │   │   │
│  │  │                                         │  🌐 turmaresol...   │   │   │
│  │  │                                         │                     │   │   │
│  │  │                                         │  [📋 Copy All JSON] │   │   │
│  │  │                                         │  [📥 Export Lead]   │   │   │
│  │  │                                         │                     │   │   │
│  │  │                                         │  ── Notes ──        │   │   │
│  │  │                                         │  + Add note...      │   │   │
│  │  │                                         │                     │   │   │
│  │  │                                         │  ── Tags ──         │   │   │
│  │  │                                         │  [Priority] [Hot]   │   │   │
│  │  └─────────────────────────────────────────┴─────────────────────┘   │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key UX Decisions

| Decision                     | Rationale                                     |
| ---------------------------- | --------------------------------------------- |
| **Master-detail layout**     | See list + details without losing context     |
| **Thumbnail in table**       | Quickly identify businesses visually          |
| **Icon badges**              | Scan data availability at a glance            |
| **Sticky actions header**    | Filters/export always visible while scrolling |
| **Collapsible detail panel** | Maximize table when needed                    |
| **Dark mode default**        | Easier on eyes for extended sessions          |

### Design System
- **Component library**: shadcn/ui
- **Primary color**: Blue (#3B82F6) 
- **Background**: Slate-950 (dark mode)
- **Typography**: Inter font family
- **Border radius**: 8px (rounded-lg)
- **Spacing scale**: 4px base unit

### Interactions
- Click row → load in detail panel
- Double-click row → open in modal (full screen detail)
- Shift+click → range select
- Ctrl/Cmd+click → toggle select
- Drag table columns to reorder
- Right-click row → context menu (copy, export, delete)
- Toast notifications for async actions
- Skeleton loaders during data fetch

---

## Data Model

```
┌─────────────────┐     ┌─────────────────┐
│      jobs       │     │     results     │
├─────────────────┤     ├─────────────────┤
│ id              │     │ (scraped leads) │
│ status          │     │ cid (PK)        │
│ params (JSONB)  │     │ title           │
│ queries[]       │     │ address         │
│ created_at      │     │ phone           │
│ completed_at    │     │ latitude        │
│ result_count    │     │ longitude       │
└─────────────────┘     │ ...33 fields    │
                        └────────┬────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│  lead_notes   │       │  lead_tags    │       │ lead_status   │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id            │       │ lead_cid (FK) │       │ lead_cid (FK) │
│ lead_cid (FK) │       │ tag           │       │ status        │
│ content       │       └───────────────┘       │ updated_at    │
│ created_at    │                               └───────────────┘
└───────────────┘
```

---

## Acceptance Criteria

### MVP (v1.0) Complete When:

- [ ] User can submit a job with all CLI flags
- [ ] User can see job queue with real-time status
- [ ] User can view leads in paginated table
- [ ] User can search/filter leads
- [ ] User can export selected leads to CSV/JSON
- [ ] User can view leads on map with clusters
- [ ] User can add notes to leads
- [ ] User can tag leads
- [ ] User can sign up and log in
- [ ] Data persists in Supabase

---

## Appendix: CLI Flag Reference

| Flag                  | Type     | Default | Description                |
| --------------------- | -------- | ------- | -------------------------- |
| `-input`              | string   | -       | Path to queries file       |
| `-results`            | string   | stdout  | Output file path           |
| `-json`               | bool     | false   | Output JSON instead of CSV |
| `-depth`              | int      | 10      | Max scroll depth           |
| `-c`                  | int      | CPU/2   | Concurrency level          |
| `-email`              | bool     | false   | Extract emails             |
| `-extra-reviews`      | bool     | false   | Collect up to ~300 reviews |
| `-lang`               | string   | "en"    | Language code              |
| `-geo`                | string   | -       | Coordinates (lat,lng)      |
| `-zoom`               | int      | 15      | Zoom level 0-21            |
| `-radius`             | float    | 10000   | Search radius in meters    |
| `-proxies`            | string   | -       | Comma-separated proxy list |
| `-fast-mode`          | bool     | false   | Quick mode, reduced data   |
| `-exit-on-inactivity` | duration | -       | Exit after inactivity      |
| `-debug`              | bool     | false   | Show browser window        |
