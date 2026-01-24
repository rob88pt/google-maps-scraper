# Active Context

## Recent Changes
- **[2026-01-24]** Reverted attempts to extract review images via DOM (proved unreliable)
- **[2026-01-24]** Kept RPC path fix (`jd[2][0][4]`) in `entry.go`
- **[2026-01-24]** Fixed Extra Reviews UI/Pipeline

## Current Focus
- Ensuring scraper stability after code reversion

## Next Steps
1. **Performance Safeguards**: Add timeout safeguard to review extraction in place.go
2. **Page Limit**: Add page limit to RPC review fetcher in reviews.go to prevent hangs with high review counts
3. **Feature**: Map Coordinate Picker (deferred)

## Session Notes
- Reverted image extraction changes because they complicated the code without reliably solving the problem.
- Scraper is now in a stable state with working RPC extraction for text reviews.
