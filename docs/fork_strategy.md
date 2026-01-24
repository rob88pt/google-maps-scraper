# Fork Strategy & Maintenance

## Overview
This document describes how to maintain our Google Maps Scraper fork and sync with upstream updates.

## Git Remote Configuration

| Remote       | URL                                                  | Purpose                   |
| ------------ | ---------------------------------------------------- | ------------------------- |
| **origin**   | `https://github.com/rob88pt/google-maps-scraper.git` | Your fork (push here)     |
| **upstream** | `https://github.com/gosom/google-maps-scraper`       | Original repo (pull here) |

Verify with:
```powershell
cd d:\Websites\GMaps_scraper_gosom\source
git remote -v
```

## Docker Images

| Image                        | Purpose                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `google-maps-scraper:custom` | Our custom build with UTF-8 BOM fix for Portuguese characters |
| `gosom/google-maps-scraper`  | Original upstream image (no BOM fix)                          |

## Why We Have a Custom Fork

The upstream `gosom/google-maps-scraper` image does not include a UTF-8 BOM (Byte Order Mark) in CSV exports. This causes Excel to incorrectly display Portuguese special characters (ã, ç, ê, etc.).

**Our fix** (applied in `source/runner/webrunner/webrunner.go`) writes a UTF-8 BOM at the beginning of CSV files, ensuring Excel reads them correctly.

## Git Workflow

### Push Your Changes
```powershell
cd d:\Websites\GMaps_scraper_gosom\source
git add .
git commit -m "your commit message"
git push origin main
```

### Sync with Upstream (gosom's updates)
```powershell
cd d:\Websites\GMaps_scraper_gosom\source

# Fetch latest from upstream
git fetch upstream

# Merge upstream changes into your local main
git merge upstream/main

# Resolve any conflicts if needed, then push to your fork
git push origin main
```

### Rebuild Custom Docker Image After Sync
```powershell
cd d:\Websites\GMaps_scraper_gosom\source

# Verify BOM fix is still in place (check webrunner.go)
# Then rebuild
docker build -t google-maps-scraper:custom .

# Test the new image
docker run google-maps-scraper:custom -h
```

## Submit PR Upstream (Optional, Best Long-term)
If your fix is merged upstream, you can use the official image directly:

1. Create a PR on [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper)
2. Reference the UTF-8 BOM fix for Excel compatibility
3. Once merged, switch to `gosom/google-maps-scraper` official image

## Files Modified in Our Fork

| File                                       | Change                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| `source/runner/webrunner/webrunner.go`     | Added UTF-8 BOM to CSV output                                                   |
| `source/web/web.go`                        | Fixed Content-Disposition header                                                |
| `source/web/static/templates/job_row.html` | Added download attribute                                                        |
| `source/gmaps/entry.go`                    | Added JSON tags, updated RPC path `jd[2][0][4]`, restored legacy image fallback |
| `source/gmaps/reviews.go`                  | Dynamic `maxScrollAttempts`, RPC/DOM fallback structure                         |
| `source/gmaps/place.go`                    | Added `ExtractExtraReviews` logic                                               |

## Leads Command Center Compatibility

The **Leads Command Center** webapp (in `leads-command-center/`) is completely separate from the scraper. It:
- Calls the Docker container via CLI
- Uses `-dsn` flag to point scraper at Supabase
- Does NOT modify scraper source code

This means:
- Webapp works with any image version
- Scraper updates don't break the webapp
- You only need to rebuild custom image if you want new scraper features
