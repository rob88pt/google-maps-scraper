# Implementation Plan: Advanced Filtering and Search Templates

This plan outlines the steps to implement advanced filtering, filter search, column ordering persistence, category presets, and search-and-filter templates.

## Proposed Changes

### Database
#### [NEW] [008_add_search_templates.sql](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/supabase/migrations/008_add_search_templates.sql)
Create a table to store search and filter configurations.
```sql
CREATE TABLE IF NOT EXISTS search_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}',
  column_visibility JSONB NOT NULL DEFAULT '{}',
  column_order JSONB NOT NULL DEFAULT '[]',
  column_sizing JSONB NOT NULL DEFAULT '{}',
  sorting JSONB NOT NULL DEFAULT '[]',
  category TEXT,
  search_query TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE search_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own search templates"
    ON search_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search templates"
    ON search_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search templates"
    ON search_templates FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search templates"
    ON search_templates FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_search_templates_updated_at
    BEFORE UPDATE ON search_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```


### API
#### [NEW] [api/search-templates/route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/search-templates/route.ts)
Implement GET, POST, and DELETE endpoints for search templates.

### UI Components
#### [MODIFY] [leads-filters.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-filters.tsx)
- **Filter Search**: Add a search input at the top of the filter popover to quickly filter the available filter fields (e.g., searching "web" will show only the website filters).

#### [NEW] [search-preset-manager.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/search-preset-manager.tsx)

- **Comprehensive Templates**: A dedicated component to Save, Load, and Manage "God Presets".
- **State Capture**: When saving, it captures:
    - `Filters`: All values in the `LeadsFilters` state.
    - `Category`: The currently selected category.
    - `Column Layout`: Visibility, Order, and Sizing.
    - `Search Query`: The main search term.
    - `Sorting`: Current column sort state.
- **One-Click Apply**: Loading a template instantly resets the UI to that complete configuration.

### Integration
#### [MODIFY] [leads/page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)
- Integrate `SearchPresetManager` (Templates) into the toolbar.
- Implement logic to "deep apply" a template, updating all local states (filters, search, category, etc.) simultaneously.
- Enhance column visibility/ordering state management for easier template integration.


## Verification Plan
### Automated Tests
- N/A (No existing testing framework for UI components in this project yet, will focus on manual verification).

### Manual Verification
1. **Filtering**: Verify new filter fields correctly filter the leads list.
2. **Filter Search**: Search for a filter field in the filter popover and verify it works.
3. **Column Ordering**: Change column order and verify it's saved in a template.
4. **Category Presets**: Select a category preset and verify the filter updates correctly.
5. **Templates**: 
   - Save a complex filter/column configuration as a "Custom Template".
   - Refresh the page and load the template.
   - Verify all settings (search, filters, category, columns, sorting) are restored.
   - Delete a template and verify it's removed from the list.
