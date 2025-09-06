# SQL Query Viewer

Dummy application with simple text area to input queries that when ran shows some dummy data.

## Ideation

Features (shown/implemented):
- Editable query
- Searchable (with debounce), sortable output
- Multi query and multi output
- multi db connections
- history
- saved_queries
- format, analyze, help with AI
- downloadable content
- auto add limit to data
- expandable query area / data area.
- persisted history
- keyboard bindings

Features (could have):
- multiple queries in single query tab
- autocomplete and validation (right now it just checks table name)
-  Maybe add option to have them top down by having different layouts.
- even larger row count handling
- editing (with guardrails / confirmation screens)
- mobile view (??)
- schema explorer
- searchable history

## Implementation

Initial release was all AI prompted by me. Fixed bunch of small state related issues and added some basic features later.

Went with react, vite and tailwind (with radix-ui) for the project.

Also uses tanstack table for easier sorting, searching implementations. Tanstack-virtual to handle large datasets. Monaco editor for easy highlighting.

Others are just minor packages that AI kind of decided it needed.

## Performance

Can comfortably render 50k rows, works also for 500k but search/sort slows down, added warnings for that.

Measured page load via lighthouse (use pvt to avoid chrome extensions disturbing the score), got almost full points.
