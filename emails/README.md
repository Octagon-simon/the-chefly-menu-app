# CheflyMenu Email Templates

This folder contains HTML email templates with placeholders that can be used with any email service provider.

## Templates Available

1. **new-feature.html** - Announce new features to users
2. **subscription-expiry.html** - Warn users about subscription expiration
3. **welcome.html** - Welcome new users and encourage Pro upgrade
4. **monthly-analytics.html** - Monthly analytics report with upgrade prompts for free users

## Placeholder Variables

### Common Variables (used in all templates)
- `{{user}}` - User's name
- `{{app_url}}` - Link to the user's menu/dashboard
- `{{unsubscribe_url}}` - Unsubscribe link

### New Feature Template
- `{{feature_name}}` - Name of the new feature
- `{{feature_description}}` - Description of what the feature does
- `{{how_to_use_steps}}` - HTML list items explaining how to use the feature

### Subscription Expiry Template
- `{{expiry_date}}` - Date when subscription expires
- `{{renewal_url}}` - Link to renew subscription

### Welcome Template
- `{{upgrade_url}}` - Link to upgrade to Pro
- `{{help_url}}` - Link to help/documentation

### Monthly Analytics Template
- `{{month}}` - Month name (e.g., "January 2024")
- `{{total_visits}}` - Total number of menu visits
- `{{unique_visitors}}` - Number of unique visitors
- `{{popular_category}}` - Most popular menu category
- `{{peak_time}}` - Peak viewing time
- `{{menu_url}}` - Link to user's public menu
- `{{dashboard_url}}` - Link to user's dashboard
- `{{upgrade_url}}` - Link to upgrade (for free users)
- `{{#if_free_user}}...{{/if_free_user}}` - Conditional content for free users

## Usage

1. Copy the HTML content of the desired template
2. Replace placeholders with actual values using your email service
3. Send via your preferred email provider (Mailgun, SendGrid, etc.)

## Email Client Compatibility

These templates use:
- Inline CSS for maximum compatibility
- Table-based layouts for older email clients
- Web-safe fonts and colors
- Responsive design principles
