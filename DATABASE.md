# Database Configuration

This project uses SQLite for persistent storage of iSpindel device data.

## Database Files

The application uses different database files based on the environment:

- **Development**: `ispindel-data-dev.db`
- **Production**: `ispindel-data.db`

## Environment Configuration

The database file is automatically selected based on the `NODE_ENV` environment variable:

### Development Mode
```bash
npm run dev
# or
npm run server
```
Uses `ispindel-data-dev.db`

### Production Mode
```bash
npm start
```
Uses `ispindel-data.db`

## Database Schema

### `device_history` Table

Stores all historical data points from iSpindel devices.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| device_id | TEXT | Device ID (e.g., "iSpindel001") |
| device_name | TEXT | Device name |
| timestamp | INTEGER | Unix timestamp in milliseconds |
| angle | REAL | Tilt angle |
| temperature | REAL | Temperature reading |
| temp_units | TEXT | Temperature units (F or C) |
| battery | REAL | Battery voltage |
| gravity | REAL | Specific gravity |
| interval | INTEGER | Reporting interval in seconds |
| rssi | INTEGER | WiFi signal strength |
| created_at | INTEGER | Record creation timestamp |

### Indexes

- `idx_device_timestamp`: Index on (device_id, timestamp DESC) for fast device history queries
- `idx_timestamp`: Index on (timestamp DESC) for time-based queries

## Data Retention

By default, the application displays the last **45 days** of history for each device. Older data remains in the database but is not displayed in the UI.

## Backup

To backup your data, simply copy the database file:

```bash
# Development database
cp ispindel-data-dev.db ispindel-data-dev.backup.db

# Production database
cp ispindel-data.db ispindel-data.backup.db
```

## Database Location

Database files are stored in the project root directory:
```
/Users/amoch/Dev/iSpindel-Logger/
├── ispindel-data-dev.db      # Development database
├── ispindel-data.db           # Production database
└── src/server/database.js     # Database module
```

## Switching Environments

To manually switch between databases, set the `NODE_ENV` environment variable:

```bash
# Use development database
NODE_ENV=development node src/server/index.js

# Use production database
NODE_ENV=production node src/server/index.js
```

## Seeding Test Data

For development purposes, you can populate the development database with realistic test data:

```bash
npm run seed
```

This will:
- Clear existing data in the development database
- Generate 15 days of test data for 2 devices
- Create data points every 15 minutes (1,440 points per device)
- Simulate realistic fermentation curves with:
  - Decreasing gravity over time
  - Temperature variations with daily cycles
  - Battery drain
  - WiFi signal strength variations

**Test Devices:**
- **Pale Ale Batch #42** (iSpindel001): 1.055 → 1.012 SG
- **IPA Batch #23** (iSpindel002): 1.065 → 1.015 SG

## Database Features

- **WAL Mode**: Write-Ahead Logging enabled for better concurrent access
- **Persistent Storage**: Data survives server restarts
- **Fast Queries**: Indexed for optimal performance
- **Time-based Filtering**: Efficiently retrieves data for specific time windows
- **No External Dependencies**: No database server required

