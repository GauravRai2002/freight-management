# Fleet Tracker Backend Development Guide

This document provides complete specifications for building a REST API backend for the Fleet Tracker application. The frontend is built with Next.js and currently uses localStorage for data persistence. This guide covers all requirements to replace localStorage with a proper backend.

---

## Technology Stack Recommendations

- **Framework**: Node.js with Express.js OR NestJS OR Python FastAPI OR Go Gin
- **Database**: PostgreSQL (recommended) OR MongoDB
- **Authentication**: JWT-based authentication
- **API Style**: RESTful JSON API
- **Hosting**: Railway, Render, AWS, or any cloud provider

---

## Database Schema

### Master Data Tables

#### 1. vehicles
```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    veh_no VARCHAR(20) NOT NULL UNIQUE,
    veh_type VARCHAR(50) DEFAULT '',
    total_trip INTEGER DEFAULT 0,
    net_profit DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. drivers
```sql
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    contact_no VARCHAR(20) DEFAULT '',
    dr_cr VARCHAR(2) DEFAULT '', -- 'Dr' or 'Cr' or ''
    open_bal DECIMAL(12,2) DEFAULT 0,
    remark TEXT DEFAULT '',
    debit DECIMAL(12,2) DEFAULT 0,
    credit DECIMAL(12,2) DEFAULT 0,
    close_bal DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. billing_parties
```sql
CREATE TABLE billing_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    contact_no VARCHAR(20) DEFAULT '',
    dr_cr VARCHAR(2) DEFAULT '',
    open_bal DECIMAL(12,2) DEFAULT 0,
    remark TEXT DEFAULT '',
    bill_amt_trip DECIMAL(12,2) DEFAULT 0,
    bill_amt_rt DECIMAL(12,2) DEFAULT 0,
    receive_amt DECIMAL(12,2) DEFAULT 0,
    balance_amt DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. transporters
```sql
CREATE TABLE transporters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    veh_no VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    dr_cr VARCHAR(2) DEFAULT '',
    open_bal DECIMAL(12,2) DEFAULT 0,
    remark TEXT DEFAULT '',
    total_trip INTEGER DEFAULT 0,
    profit DECIMAL(12,2) DEFAULT 0,
    bill_amt DECIMAL(12,2) DEFAULT 0,
    paid_amt DECIMAL(12,2) DEFAULT 0,
    close_bal DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. expense_categories
```sql
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('General', 'Expenses', 'Fuel')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. payment_modes
```sql
CREATE TABLE payment_modes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed default data
INSERT INTO payment_modes (name) VALUES ('CASH'), ('ONLINE'), ('CHEQUE'), ('UPI');
```

#### 7. stock_items
```sql
CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    open_qty DECIMAL(10,2) DEFAULT 0,
    stk_in DECIMAL(10,2) DEFAULT 0,
    stk_out DECIMAL(10,2) DEFAULT 0,
    close_qty DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Transaction Tables

#### 8. trips
```sql
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_no INTEGER NOT NULL UNIQUE,
    date DATE NOT NULL,
    veh_no VARCHAR(20) NOT NULL,
    driver_name VARCHAR(100) DEFAULT '',
    from_location VARCHAR(100) NOT NULL,
    to_location VARCHAR(100) NOT NULL,
    trip_km INTEGER DEFAULT 0,
    fuel_exp_amt DECIMAL(12,2) DEFAULT 0,
    average DECIMAL(6,2) DEFAULT 0,
    trip_fare DECIMAL(12,2) DEFAULT 0,
    rt_fare DECIMAL(12,2) DEFAULT 0,
    total_trip_fare DECIMAL(12,2) DEFAULT 0,
    trip_expense DECIMAL(12,2) DEFAULT 0,
    profit_statement DECIMAL(12,2) DEFAULT 0,
    st_miter INTEGER DEFAULT 0,
    end_miter INTEGER DEFAULT 0,
    diesel_rate DECIMAL(6,2) DEFAULT 0,
    ltr DECIMAL(10,2) DEFAULT 0,
    is_market_trip BOOLEAN DEFAULT FALSE,
    ex_income DECIMAL(12,2) DEFAULT 0,
    driver_bal DECIMAL(12,2) DEFAULT 0,
    lock_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 9. trip_books
```sql
CREATE TABLE trip_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_no INTEGER NOT NULL,
    date DATE NOT NULL,
    lr_no VARCHAR(50) DEFAULT '',
    billing_party_id UUID REFERENCES billing_parties(id),
    billing_party_name VARCHAR(100) DEFAULT '',
    freight_mode VARCHAR(10) CHECK (freight_mode IN ('FIX', 'PE Ton', 'PE KG')),
    trip_amount DECIMAL(12,2) DEFAULT 0,
    advance_amt DECIMAL(12,2) DEFAULT 0,
    shortage_amt DECIMAL(12,2) DEFAULT 0,
    deduction_amt DECIMAL(12,2) DEFAULT 0,
    holding_amt DECIMAL(12,2) DEFAULT 0,
    received_amt DECIMAL(12,2) DEFAULT 0,
    pending_amt DECIMAL(12,2) DEFAULT 0,
    transporter_id UUID REFERENCES transporters(id),
    transporter_name VARCHAR(100) DEFAULT '',
    market_veh_no VARCHAR(20) DEFAULT '',
    market_freight DECIMAL(12,2) DEFAULT 0,
    market_advance DECIMAL(12,2) DEFAULT 0,
    market_balance DECIMAL(12,2) DEFAULT 0,
    l_weight DECIMAL(10,2) DEFAULT 0,
    u_weight DECIMAL(10,2) DEFAULT 0,
    remark TEXT DEFAULT '',
    net_profit DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 10. driver_advances
```sql
CREATE TABLE driver_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_no INTEGER DEFAULT 0,
    date DATE NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    mode VARCHAR(50) DEFAULT '',
    from_account VARCHAR(100) DEFAULT '',
    debit DECIMAL(12,2) DEFAULT 0,
    credit DECIMAL(12,2) DEFAULT 0,
    fuel_ltr DECIMAL(10,2) DEFAULT 0,
    remark TEXT DEFAULT '',
    run_bal DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 11. expenses
```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_no INTEGER DEFAULT 0,
    date DATE NOT NULL,
    expense_type VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    from_account VARCHAR(100) DEFAULT '',
    ref_veh_no VARCHAR(20) DEFAULT '',
    remark1 TEXT DEFAULT '',
    remark2 TEXT DEFAULT '',
    is_non_trip_exp BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 12. return_trips
```sql
CREATE TABLE return_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_no INTEGER DEFAULT 0,
    date DATE NOT NULL,
    billing_party_id UUID REFERENCES billing_parties(id),
    billing_party_name VARCHAR(100) DEFAULT '',
    lr_no VARCHAR(50) DEFAULT '',
    rt_freight DECIMAL(12,2) DEFAULT 0,
    advance_amt DECIMAL(12,2) DEFAULT 0,
    shortage_amt DECIMAL(12,2) DEFAULT 0,
    deduction_amt DECIMAL(12,2) DEFAULT 0,
    holding_amt DECIMAL(12,2) DEFAULT 0,
    received_amt DECIMAL(12,2) DEFAULT 0,
    pending_amt DECIMAL(12,2) DEFAULT 0,
    mode VARCHAR(50) DEFAULT '',
    to_bank VARCHAR(100) DEFAULT '',
    remark TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 13. party_payments
```sql
CREATE TABLE party_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_no INTEGER DEFAULT 0,
    date DATE NOT NULL,
    billing_party_id UUID REFERENCES billing_parties(id),
    billing_party_name VARCHAR(100) DEFAULT '',
    mode VARCHAR(50) DEFAULT '',
    receive_amt DECIMAL(12,2) DEFAULT 0,
    shortage_amt DECIMAL(12,2) DEFAULT 0,
    deduction_amt DECIMAL(12,2) DEFAULT 0,
    lr_no VARCHAR(50) DEFAULT '',
    to_bank VARCHAR(100) DEFAULT '',
    remark TEXT DEFAULT '',
    run_bal DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 14. market_veh_payments
```sql
CREATE TABLE market_veh_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_no INTEGER DEFAULT 0,
    date DATE NOT NULL,
    transporter_id UUID REFERENCES transporters(id),
    transporter_name VARCHAR(100) DEFAULT '',
    market_veh_no VARCHAR(20) DEFAULT '',
    mode VARCHAR(50) DEFAULT '',
    paid_amt DECIMAL(12,2) DEFAULT 0,
    lr_no VARCHAR(50) DEFAULT '',
    from_bank VARCHAR(100) DEFAULT '',
    remark TEXT DEFAULT '',
    run_bal DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 15. stock_entries
```sql
CREATE TABLE stock_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    stock_item_id UUID REFERENCES stock_items(id),
    stock_item_name VARCHAR(100) DEFAULT '',
    entry_type VARCHAR(3) NOT NULL CHECK (entry_type IN ('IN', 'OUT')),
    quantity DECIMAL(10,2) NOT NULL,
    remark TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## REST API Endpoints

### Standard CRUD Pattern for All Entities

Each entity should have these 5 endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{entity}` | List all items |
| GET | `/api/{entity}/:id` | Get single item by ID |
| POST | `/api/{entity}` | Create new item |
| PUT | `/api/{entity}/:id` | Update existing item |
| DELETE | `/api/{entity}/:id` | Delete item |

### Entity Endpoints

```
/api/vehicles
/api/drivers
/api/billing-parties
/api/transporters
/api/expense-categories
/api/payment-modes
/api/stock-items
/api/trips
/api/trip-books
/api/driver-advances
/api/expenses
/api/return-trips
/api/party-payments
/api/market-veh-payments
/api/stock-entries
```

### Special Endpoints

#### Trip Number Generation
```
GET /api/trips/next-number
Response: { "nextTripNo": 1001 }
```
Returns the next available trip number (max trip_no + 1, or 1001 if no trips exist).

#### Dashboard Statistics
```
GET /api/dashboard/stats
Response: {
    "vehicleCount": 10,
    "driverCount": 5,
    "partyCount": 15,
    "transporterCount": 8,
    "tripCount": 150,
    "totalRevenue": 500000,
    "totalExpense": 300000,
    "totalProfit": 200000,
    "recentTrips": [...last 5 trips...]
}
```

#### Trip Report
```
GET /api/reports/trips?fromDate=2024-01-01&toDate=2024-12-31&vehicleNo=MH01AB1234&driverName=John
Response: {
    "trips": [...],
    "summary": {
        "totalTrips": 50,
        "totalFare": 100000,
        "totalExpense": 60000,
        "totalProfit": 40000,
        "totalKm": 5000
    }
}
```

#### Balance Sheet
```
GET /api/reports/balance-sheet
Response: {
    "partySummary": {
        "totalBillAmount": 500000,
        "totalReceived": 400000,
        "totalBalance": 100000,
        "parties": [...]
    },
    "driverSummary": {
        "totalDebit": 50000,
        "totalCredit": 40000,
        "totalBalance": 10000,
        "drivers": [...]
    },
    "transporterSummary": {
        "totalBillAmount": 200000,
        "totalPaid": 180000,
        "totalBalance": 20000,
        "transporters": [...]
    }
}
```

---

## Request/Response Formats

### Create Vehicle (POST /api/vehicles)
```json
// Request
{
    "vehNo": "MH01AB1234",
    "vehType": "TRUCK"
}

// Response (201 Created)
{
    "id": "uuid-here",
    "vehNo": "MH01AB1234",
    "vehType": "TRUCK",
    "totalTrip": 0,
    "netProfit": 0,
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-10T10:00:00Z"
}
```

### Create Trip (POST /api/trips)
```json
// Request
{
    "date": "2024-01-10",
    "vehNo": "MH01AB1234",
    "driverName": "John Doe",
    "from": "MUMBAI",
    "to": "PUNE",
    "tripKm": 150,
    "fuelExpAmt": 2000,
    "tripFare": 5000,
    "rtFare": 3000,
    "tripExpense": 1000,
    "stMiter": 50000,
    "endMiter": 50150,
    "dieselRate": 85,
    "ltr": 20,
    "isMarketTrip": false
}

// Response (201 Created)
{
    "id": "uuid-here",
    "tripNo": 1001,
    "date": "2024-01-10",
    "vehNo": "MH01AB1234",
    "driverName": "John Doe",
    "from": "MUMBAI",
    "to": "PUNE",
    "tripKm": 150,
    "fuelExpAmt": 2000,
    "average": 7.5,
    "tripFare": 5000,
    "rtFare": 3000,
    "totalTripFare": 8000,
    "tripExpense": 1000,
    "profitStatement": 7000,
    "stMiter": 50000,
    "endMiter": 50150,
    "dieselRate": 85,
    "ltr": 20,
    "isMarketTrip": false,
    "exIncome": 0,
    "driverBal": 0,
    "lockStatus": false,
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-10T10:00:00Z"
}
```

---

## Business Logic Requirements

### 1. Auto-Calculations

#### Trip Calculations (on create/update)
```javascript
tripKm = endMiter - stMiter
average = tripKm / ltr (if ltr > 0)
totalTripFare = tripFare + rtFare
profitStatement = totalTripFare - tripExpense
```

#### Trip Book Calculations
```javascript
receivedAmt = tripAmount - shortageAmt - deductionAmt - holdingAmt
pendingAmt = receivedAmt - advanceAmt
marketBalance = marketFreight - marketAdvance
netProfit = receivedAmt - marketFreight
```

#### Return Trip Calculations
```javascript
receivedAmt = rtFreight - shortageAmt - deductionAmt - holdingAmt
pendingAmt = receivedAmt - advanceAmt
```

### 2. Balance Updates

When creating transactions, update the related master data balances:

#### Driver Balance (on driver_advance create)
```javascript
// For the driver record
if (debit > 0) driver.debit += debit
if (credit > 0) driver.credit += credit
driver.closeBal = driver.openBal + driver.debit - driver.credit
```

#### Party Balance (on party_payment create)
```javascript
party.receiveAmt += receiveAmt
party.balanceAmt = party.openBal + party.billAmtTrip + party.billAmtRT - party.receiveAmt
```

#### Stock Item (on stock_entry create)
```javascript
if (entryType === 'IN') {
    stockItem.stkIn += quantity
    stockItem.closeQty += quantity
} else {
    stockItem.stkOut += quantity
    stockItem.closeQty -= quantity
}
```

#### Vehicle Trip Count (on trip create)
```javascript
vehicle.totalTrip += 1
vehicle.netProfit += trip.profitStatement
```

### 3. Trip Number Auto-Increment
- When creating a new trip, auto-assign the next trip number
- Start from 1001 if no trips exist
- Use MAX(trip_no) + 1 for subsequent trips

### 4. Cascade Deletes
When deleting master data, handle related transactions:
- Option A: Prevent deletion if related transactions exist
- Option B: Allow deletion and nullify references (recommended)

---

## Error Handling

### Standard Error Response Format
```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Vehicle number is required",
        "field": "vehNo"
    }
}
```

### HTTP Status Codes
- 200: Success (GET, PUT)
- 201: Created (POST)
- 204: No Content (DELETE)
- 400: Bad Request (validation errors)
- 404: Not Found
- 409: Conflict (duplicate unique field)
- 500: Internal Server Error

---

## CORS Configuration

Enable CORS for the frontend domain:
```javascript
// Allow requests from
origins: [
    "http://localhost:3000",
    "https://freight-management-tau.vercel.app",
    "https://*.vercel.app"
]
```

---

## Frontend Integration Points

The frontend currently stores data in localStorage using these keys:
- `fleet_vehicles`, `fleet_drivers`, `fleet_billing_parties`
- `fleet_transporters`, `fleet_expense_categories`, `fleet_payment_modes`
- `fleet_stock_items`, `fleet_trips`, `fleet_trip_books`
- `fleet_driver_advances`, `fleet_expenses`, `fleet_return_trips`
- `fleet_party_payments`, `fleet_market_veh_payments`, `fleet_stock_entries`

To integrate the backend:
1. Replace localStorage calls with API fetch calls
2. Update Redux slices to use async thunks
3. Add loading/error states for API calls
4. Configure API base URL via environment variable

---

## Optional Enhancements

### Authentication
- Add user registration/login endpoints
- Implement JWT token authentication
- Add role-based access control (admin, viewer)

### Multi-tenancy
- Add `organization_id` to all tables
- Filter all queries by organization
- Separate data per organization

### Audit Trail
- Add `created_by`, `updated_by` columns
- Track all changes in an audit log table

### File Uploads
- Support for invoice/document uploads
- Store in S3 or similar object storage

---

## Summary

**Total Tables**: 15  
**Total CRUD Endpoints**: 75 (5 per entity × 15 entities)  
**Special Endpoints**: 4 (next-trip-number, dashboard, trip-report, balance-sheet)  

This backend will provide complete data persistence, business logic calculations, and reporting capabilities for the Fleet Tracker application.
