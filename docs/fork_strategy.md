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

| File                            | Critical Customization                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `gmaps/entry.go`                | **JSON Tags** (`json:"name"`) on Review struct. <br> **RPC Indices** (`jd[2][0][4]`) fallback. |
| `gmaps/reviews.go`              | **Scroll Limit Logic**: Must be dynamic (`extraReviews`), NOT hardcoded.                       |
| `gmaps/place.go`                | **Extra Reviews Logic**: Must trigger `FetchReviewsWithFallback`.                              |
| `runner/webrunner/webrunner.go` | **UTF-8 BOM**: Essential for Excel export compatibility.                                       |
