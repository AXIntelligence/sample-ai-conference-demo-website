# AI Conference Demo Website - Dynamic Version

This website now fetches real data from your Supabase database and displays it dynamically.

## Features

- **Dynamic Event Data**: Fetches event information from Supabase `events` table
- **Real Sessions**: Displays actual sessions from the `sessions` table grouped by day
- **Company Sponsors**: Shows companies from your database (tries multiple table sources)
- **Live Statistics**: Calculates stats based on actual data (sessions, speakers, companies, tracks)

## Files Created

1. **config.js** - Contains Supabase connection configuration
2. **data.js** - Data fetching service that connects to Supabase
3. **render.js** - Rendering logic that populates the HTML with fetched data
4. **.env** - Environment variables (Supabase credentials and event ID)

## How It Works

1. When the page loads, `render.js` initializes the `EventDataService`
2. The service connects to Supabase using credentials from `config.js`
3. It fetches:
   - Event data from `events` table (ID: `0dc01c27-ed09-4716-8a78-c7def724b7bc`)
   - All sessions for that event from `sessions` table
   - Companies from `companies` table (or falls back to `event_participants` or `profiles`)
4. The renderer updates the HTML:
   - Hero section with event name, dates, and location
   - Stats section with real counts
   - Agenda section with sessions grouped by day
   - Sponsors section with company logos

## Opening the Website

Simply open `index.html` in a web browser:

```bash
# Using Python
python3 -m http.server 8000

# Or using Node.js http-server
npx http-server

# Or just open directly in browser
open index.html
```

**Important**: Due to browser CORS restrictions, it's recommended to use a local server rather than opening the file directly.

## Configuration

To change the event being displayed, update the `eventId` in `config.js`:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://spnauawcnewdcuawfxgv.supabase.co',
    key: 'your-anon-key',
    eventId: 'your-event-id-here'  // Change this
};
```

## Database Schema Expected

The code expects these Supabase tables:

### events
- `id` (uuid)
- `name` (text)
- `description` (text)
- `start_date` (timestamp)
- `end_date` (timestamp)
- `location` (text)

### sessions
- `id` (uuid)
- `event_id` (uuid) - foreign key to events
- `title` (text)
- `description` (text)
- `speaker` (text)
- `start_time` (timestamp)
- `duration` (integer)
- `room` (text)
- `track` (text)
- `tags` (array)

### companies (optional)
- `id` (uuid)
- `name` (text)
- `logo_url` (text)

If `companies` table doesn't exist, the system will try to extract company names from:
- `event_participants.company`
- `profiles.company`

## Troubleshooting

### No data showing?
1. Open browser console (F12) to see error messages
2. Check if the event ID exists in your database
3. Verify Supabase credentials are correct
4. Ensure tables have the expected columns

### CORS errors?
Use a local web server instead of opening the file directly.

### Companies not showing?
The code tries multiple table sources. If you don't have a `companies` table, it will extract company names from participant profiles.

## Security Note

The `.env` file and `config.js` contain your Supabase anon key, which is safe to expose on the client side as long as you have Row Level Security (RLS) policies configured in Supabase.

For production use, ensure your Supabase RLS policies are properly configured to protect sensitive data.
