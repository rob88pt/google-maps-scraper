# Google Maps Scraper - Project Brief

## Overview
A customized fork of [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper) with enhancements for Portuguese character encoding and improved file download behavior.

## Goals
- Scrape Google Maps business data via Web UI or CLI
- Export clean CSV files with proper UTF-8 encoding (Excel-compatible)
- Provide a simple, Docker-based deployment

## Key Customizations
1. **UTF-8 BOM for CSVs** - Ensures Excel correctly displays Portuguese characters (ã, ç, etc.)
2. **Fixed Download Filenames** - Browser downloads now include `.csv` extension

## Project Structure
```
GMaps_scraper_gosom/
├── docs/                    # Project documentation (this folder)
├── google-maps-scraper/     # Docker compose and convenience scripts
│   └── start_web_ui.ps1     # Launch script for Web UI
└── source/                  # Modified source code (Go)
    ├── runner/webrunner/    # Web runner with BOM fix
    └── web/                 # Web UI templates and server
```

## Quick Start
See [tech_context.md](tech_context.md) for setup instructions.
