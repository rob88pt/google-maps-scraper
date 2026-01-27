# Project Maintenance & Upstream Sync

## Overview
This project is configured as a **Monorepo**. It contains:
- `leads-command-center/`: Our custom Web Application.
- `source/`: The Google Maps Scraper (forked from upstream).
- `docs/`: Project documentation.

All components are tracked in a single Git repository at the root.

## 1. Routine Work (Your Changes)
When you make changes to the Web App or the Scraper:

```powershell
# 1. Check what changed
git status

# 2. Stage changes (add specific files or use . for all)
git add .

# 3. Commit
git commit -m "Description of changes"
```

## 2. Pulling Scraper Updates (From Upstream)
We have configured a remote named `upstream-scraper` that points to the original developer's repository.
To pull their latest changes and merge them into our `source/` folder:

### Step A: Fetch Updates
```powershell
git fetch upstream-scraper
```

### Step B: Merge safely
We use the `subtree` strategy because the scraper lives in a sub-folder (`source/`) in our repo, but is at the root in theirs.

```powershell
# Merge upstream main branch into our source folder
git merge -s subtree -X subtree=source upstream-scraper/main --allow-unrelated-histories
```

- **If there are no conflicts**: Git will auto-merge. You're done!
- **If there are conflicts**: Git will pause. You must edit the conflicting files in `source/`, resolve the differences (keeping our custom JSON tags etc.), and then run:
  ```powershell
  git add .
  git commit
  ```

## 3. Rebuilding the Docker Image
Whenever code in `source/` changes (whether by you or an upstream update), you MUST rebuild the Docker image for the changes to take effect in the Web App.

```powershell
# 1. Navigate to scraper source
cd d:\Websites\GMaps_scraper_gosom\source

# 2. Build the image (using our custom tag)
docker build -t google-maps-scraper:custom .
```

## 4. Customizations to Preserve
When merging upstream updates, **ALWAYS** check that these files preserve our customizations (see `docs/fork_strategy.md` history for details):

| File               | Critical Customization                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gmaps/reviews.go` | **Scroll Limit Logic**: Dynamic (`extraReviews`) integer count instead of boolean. <br> **Safety**: Pattern map initialization to prevent nil panic. |
| `gmaps/place.go`   | **Review Pipeline**: Integrated `FetchReviewsWithFallback`.                                                                                          |
| `runner/jobs.go`   | **Query Mapping**: Added `#!#` delimiter parsing to allow custom `input_id` mapping.                                                                 |

## 5. Fork Modification Log (Technical Details)

This log tracks every change made to the `source/` (scraper) code since the initial fork. Use this to re-apply changes after an `upstream-scraper` sync.

### [2026-01-27] - Data Traceability & Mapping Fix
- **File**: `source/runner/jobs.go`
- **Change**: Added logic to split the search query by `#!#`.
- **Reason**: Allows the Web App to pass a custom UUID as the `input_id` while keeping the search query separate. Essential for mapping "Fast Mode" results back to their jobs.
- **Code Reference**:
  ```go
  if before, after, ok := strings.Cut(query, "#!#"); ok {
      query = strings.TrimSpace(before)
      id = strings.TrimSpace(after)
  }
  ```

### [2026-01-24] - Configurable Review Extraction
- **Files**: `source/gmaps/reviews.go`, `source/gmaps/place.go`, `source/runner/jobs.go`
- **Change**: Changed `-extra-reviews` flag from `bool` to `int`. Improved DOM/RPC scroll logic.
- **Reason**: Allows users to specify *how many* extra reviews to get (e.g. 50 vs 500) rather than just "on/off", preventing long hangs on large businesses.
- **Code Reference**: `maxPages := f.params.extraReviews / 10` (approx 10 reviews per page).

### [2026-01-24] - Nil Pointer Panic Fix
- **File**: `source/gmaps/reviews.go`
- **Change**: Initialized `patterns` map inside `extractPlaceID` via `sync.Once`.
- **Reason**: Scraper was panicking on startup when attempting to write to a nil map.

---

