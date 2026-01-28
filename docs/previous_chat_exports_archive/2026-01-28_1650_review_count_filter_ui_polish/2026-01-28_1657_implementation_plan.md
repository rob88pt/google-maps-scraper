# Implementation Plan - Refining Range Labels & Accessibility

Improve the clarity and accessibility of the Rating and Reviews ranges by adding descriptive helper text (subtitles) and refining the input layout.

## User Review Required

### Accessible Subtitles (Choose one pair)

| Option                   | Rating Range Subtitle           | Reviews Range Subtitle           |
| :----------------------- | :------------------------------ | :------------------------------- |
| **A (Descriptive)**      | "From 0 to 5 stars"             | "Total number of reviews"        |
| **B (Constraint-based)** | "Set minimum and maximum stars" | "Set minimum and maximum volume" |
| **C (Simple)**           | "Average star rating"           | "Social proof volume"            |

### UI Refinement for Rating Range
- **Fixed Width**: Set a fixed width for the Rating inputs (e.g., `w-12`) since they only ever contain a single digit + decimal. This will make them feel more "right" compared to the variable-width Reviews inputs.
- **SR Labels**: Add `aria-label="Minimum rating"` and `aria-label="Maximum rating"` for screen reader accessibility.

## Proposed Changes

### [Frontend] [leads-filters](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-filters.tsx)
-   Add a small `<p className="text-[10px] text-slate-500 mt-0.5">` below each range label for the chosen subtitle.
-   Adjust `Rating Range` inputs to use a fixed width instead of `flex-1` to avoid them looking overly large.
-   Ensure `aria-label` attributes are present on all range inputs.

## Verification Plan
-   **Visual Check**: Verify the new subtitles appear below the labels.
-   **Symmetry Check**: Ensure the fixed-width Rating inputs look balanced next to the Reviews inputs.
-   **Accessibility Tooling**: Quick check with browser DevTools to ensure `aria-labels` are correctly applied.
