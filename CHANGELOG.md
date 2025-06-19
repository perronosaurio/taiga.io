# Changelog

## [2.0.0] - 2025-06-19
### Major Changes
- Refactored to use environment variable for Taiga instance URL; removed user input for instance URL
- Updated branding: replaced GitHub icon with official Taiga logo throughout the UI
- Added support for Taiga 'epic' events; removed deprecated 'milestone' support
- Webhook event type selection now uses 'Epics' instead of 'Milestones'
- Epic handler now provides rich Discord embeds (description, status, direct link, etc.)
- All Discord webhooks now use the Taiga name and icon as the sender (not just in the embed)
- Embed author reverted to event-specific title and URL for clarity
- Improved error handling and logging for webhooks
- Fixed project ID logging bug ([object Object] issue)
- UI: Restored classic app bar layout with centered title and Taiga branding
- Updated documentation and .env guidance for new configuration

### Commits
- 2257cdf Refactor: use env for Taiga URL, update logo, improve webhook config instructions, fix app bar layout
- 0b093a4 UI: restore classic app bar layout with centered title and Taiga branding
- f41a153 Fix: log and use correct project ID for webhook events (no more [object Object])
- 379fb39 Refactor: Remove milestone handler, fully implement epic handler for Taiga webhook events
- d2987b5 UI: Replace 'Milestones' with 'Epics' in webhook event types (Taiga update)
- 5d65563 Enhance epic handler: add description, status name change, and direct link for all epic events
- e331d6c Branding: Use Taiga username and icon for all webhook Discord embeds
- 83343b0 Webhook: Set Discord sender to Taiga name/icon, revert embed author to event-specific title and url 