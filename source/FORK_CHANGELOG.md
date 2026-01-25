# Fork Changelog

This document tracks changes made to the `source/` directory, which is a subtree of [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper).

## [2026-01-24] - Fix Panic & Improve Data Quality

### Fixed
- **Panic in Reviews**: Initialized the `patterns` map in `gmaps/reviews.go` which was causing a panic (nil map assignment) during place ID extraction.
- **Image Quality**:
    - Filtered out "Report this photo" icons in `gmaps/reviews.go`.
    - Added logic to request high-resolution (1080p) versions of review images.
- **Rating Extraction**: Improved regex in `gmaps/reviews.go` to handle decimal ratings (e.g., "5.0") in aria-labels, preventing "0 stars" issues.
- **JSON Tags**: Added snake_case JSON tags (`json:"name"`, etc.) to the `Review` struct in `gmaps/entry.go` to fix data ingestion in the frontend.

### Files Affected
- `gmaps/reviews.go`
- `gmaps/entry.go`

---

## [2026-01-24] - Configurable Reviews Count

### Added
- **Integer Flag**: Changed `-extra-reviews` from boolean to integer.
    - Usage: `-extra-reviews 100` (Scrolls until ~100 reviews are collected).
- **Page Limits**: (Pending) Logic to stop scrolling after limit is reached.

### Changed
- Refactored `ExtraReviews` field in job structs from `bool` to `int`.

---
