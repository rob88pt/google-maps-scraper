# Tech Context

## Tech Stack
| Component   | Technology                     |
| ----------- | ------------------------------ |
| Language    | Go                             |
| Scraping    | Playwright (headless Chromium) |
| Web UI      | Go templates + HTMX            |
| Deployment  | Docker                         |
| Data Format | CSV (UTF-8 with BOM)           |

## Prerequisites
- Docker Desktop installed and running
- Port 8080 available

## Setup & Run

### Web UI (Recommended)
```powershell
# Start the Web UI
d:\Websites\GMaps_scraper_gosom\google-maps-scraper\start_web_ui.ps1
```
Then open [http://localhost:8080](http://localhost:8080)

### CLI
```powershell
# Create input file
echo "restaurants lisbon" > queries.txt
New-Item -ItemType File results.csv

# Run scraper
docker run `
  -v ${PWD}/queries.txt:/queries.txt `
  -v ${PWD}/results.csv:/results.csv `
  google-maps-scraper:custom `
  -depth 1 `
  -input /queries.txt `
  -results /results.csv `
  -exit-on-inactivity 3m
```

## Key Files
| File                                       | Purpose                             |
| ------------------------------------------ | ----------------------------------- |
| `google-maps-scraper/start_web_ui.ps1`     | Convenience script to launch Web UI |
| `source/runner/webrunner/webrunner.go`     | Modified to add UTF-8 BOM           |
| `source/web/web.go`                        | Fixed Content-Disposition header    |
| `source/web/static/templates/job_row.html` | Added download attribute            |

## Docker Images
- `google-maps-scraper:custom` - Custom build with all fixes applied
- `gosom/google-maps-scraper` - Original upstream image (no BOM fix)
