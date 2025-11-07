# API Setup Guide - Mobile Number Update

## 📋 Overview

यह guide `update_mobile.php` API endpoint को setup करने के लिए है।

## 📁 File Location

Upload करें: `https://xtend.online/Voter/update_mobile.php`

## 🔧 Setup Steps

### Step 1: Database Configuration

`update_mobile.php` file खोलें और database credentials update करें:

```php
$host = 'localhost'; // Your database host
$dbname = 'your_database_name'; // Your database name
$username = 'your_db_username'; // Your database username
$password = 'your_db_password'; // Your database password
```

### Step 2: Table Structure

Ensure your voters table has these columns:
- `epic_id` or `मतदान कार्ड क्र.` - EPIC ID (Primary identifier)
- `mobile_number` or `मोबाईल नं.` - Mobile number field
- `serial_number` or `अनु क्र.` - Serial number (optional)
- `updated_at` - Timestamp field (optional, for tracking)

### Step 3: Update SQL Query

File में SQL query को अपने table structure के अनुसार update करें:

```php
$sql = "UPDATE your_table_name SET 
        mobile_number = :mobile,
        updated_at = NOW()
        WHERE epic_id = :epic_id";
```

**Important:** Column names को अपनी database structure के अनुसार बदलें।

### Step 4: Enable Database Connection

File में commented database code को uncomment करें:

```php
// Remove the comment markers (/* and */) around the database code
$pdo = new PDO(...);
```

और temporary test code को remove करें।

### Step 5: Test the API

1. File को server पर upload करें
2. Frontend app से mobile number update करके test करें
3. Browser console में errors check करें

## 📡 API Endpoint Details

### Request
- **URL:** `POST /api/Voter/update_mobile.php`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "epic_id": "ABC123456",
  "mobile": "9876543210",
  "serial_no": "001",
  "voter_id": 123
}
```

### Response (Success)
```json
{
  "status": "success",
  "message": "Mobile number updated successfully",
  "data": {
    "epic_id": "ABC123456",
    "mobile": "9876543210",
    "updated_at": "2024-01-15 10:30:00"
  }
}
```

### Response (Error)
```json
{
  "status": "error",
  "message": "Error message here"
}
```

## 🔒 Security Recommendations

1. **Authentication:** Add authentication token validation
2. **Rate Limiting:** Implement rate limiting to prevent abuse
3. **Input Sanitization:** Already included, but review for your needs
4. **HTTPS:** Ensure API is served over HTTPS
5. **Logging:** Add logging for audit trail

## 🐛 Troubleshooting

### Issue: "No voter found with the provided EPIC ID"
- Check if EPIC ID format matches your database
- Verify column names in WHERE clause

### Issue: "Database connection failed"
- Verify database credentials
- Check if database server is accessible
- Ensure PDO extension is enabled in PHP

### Issue: CORS errors
- Headers are already set in the file
- If issues persist, check server CORS configuration

## 📝 Notes

- Currently, the API works in test mode (simulated response)
- Configure database connection to enable actual updates
- Mobile number validation: Must be exactly 10 digits
- EPIC ID is used as primary identifier for updates

## 🔄 Example Database Table Structure

```sql
CREATE TABLE voters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    epic_id VARCHAR(20) UNIQUE NOT NULL,
    serial_number VARCHAR(10),
    mobile_number VARCHAR(10),
    name_english VARCHAR(255),
    name_marathi VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_epic (epic_id)
);
```



