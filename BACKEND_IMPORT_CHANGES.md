# Backend Changes Required for Import Functionality

## Summary

The frontend now supports importing trips from Excel/CSV files. The following backend changes are required to support the new fields and ensure data integrity.

---

## 1. Database Schema Changes

### Trip Table - Add 4 New Columns

```sql
ALTER TABLE trips ADD COLUMN plant_name VARCHAR(255) DEFAULT '';
ALTER TABLE trips ADD COLUMN car_qty INTEGER DEFAULT 0;
ALTER TABLE trips ADD COLUMN load_km DECIMAL(10,2) DEFAULT 0;
ALTER TABLE trips ADD COLUMN empty_km DECIMAL(10,2) DEFAULT 0;
```

**Prisma Schema Update:**

```prisma
model Trip {
  // ... existing fields ...
  
  // New fields for import
  plantName   String  @default("")    @map("plant_name")
  carQty      Int     @default(0)     @map("car_qty")
  loadKm      Decimal @default(0)     @map("load_km") @db.Decimal(10, 2)
  emptyKm     Decimal @default(0)     @map("empty_km") @db.Decimal(10, 2)
}
```

---

## 2. New Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| plantName | string | Plant or party name (e.g., "MARKET", "TOYOTA - BANGLORE") |
| carQty | integer | Number of cars/units transported in this trip |
| loadKm | decimal | Kilometers traveled when vehicle was loaded |
| emptyKm | decimal | Kilometers traveled when vehicle was empty |

---

## 3. API Endpoint Updates

### POST /trips - Create Trip

Add the 4 new fields to the request body validation:

```typescript
// Request body should accept:
{
  // ... existing fields ...
  plantName?: string,   // Optional, defaults to ""
  carQty?: number,      // Optional, defaults to 0
  loadKm?: number,      // Optional, defaults to 0
  emptyKm?: number,     // Optional, defaults to 0
}
```

### PUT /trips/:id - Update Trip

Same fields should be updateable.

### GET /trips - List Trips

Response should include the new fields.

---

## 4. Expense Categories (Created Dynamically)

> **Note:** Expense categories are now created **dynamically from the frontend** during import.
> The backend does **not** need to seed these - just ensure the `/api/expense-categories` POST endpoint exists.

The frontend will create these categories on-demand if they don't exist:

| Name | Mode |
|------|------|
| Diesel | Fuel |
| TOLL | Expenses |
| Border | Expenses |
| Crane | Expenses |
| Maintenance | Expenses |
| POD Charges | Expenses |
| Police/Guard | Expenses |
| Conductor | Expenses |
| Parking | Expenses |
| Other | Expenses |
| Ad Blue | Expenses |

**Endpoint used:** `POST /api/expense-categories` with body `{ name, mode }`

---

## 5. Bulk Import API Endpoint

### POST /api/import/bulk

Single endpoint to import multiple trips with their associated expenses in one transaction.

**Request Body:**

```typescript
{
  trips: Array<{
    tripNo: number;
    date: string;              // ISO format: "2025-08-14"
    vehNo: string;
    fromLocation: string;
    toLocation: string;
    tripKm: number;
    tripFare: number;
    totalTripFare: number;
    tripExpense: number;
    profitStatement: number;
    plantName: string;
    carQty: number;
    loadKm: number;
    emptyKm: number;
    isMarketTrip: boolean;
    driverName?: string;
    fuelExpAmt?: number;
    average?: number;
    rtFare?: number;
    stMiter?: number;
    endMiter?: number;
    dieselRate?: number;
    ltr?: number;
    exIncome?: number;
    driverBal?: number;
    lockStatus?: boolean;
  }>;
  
  expenses: Array<{
    tripNo: number;            // Links to trip above
    date: string;
    expenseType: string;       // Category name (e.g., "TOLL", "Diesel")
    amount: number;
    fromAccount?: string;
    refVehNo?: string;
    remark1?: string;
    remark2?: string;
    isNonTripExp?: boolean;
  }>;
  
  expenseCategories?: Array<{  // Optional: create if not exists
    name: string;
    mode: "Fuel" | "Expenses" | "General";
  }>;
}
```

**Response (200 OK):**

```typescript
{
  success: true;
  data: {
    tripsCreated: number;
    tripsFailed: number;
    expensesCreated: number;
    expensesFailed: number;
    categoriesCreated: number;
    errors: Array<{
      type: "trip" | "expense" | "category";
      index: number;
      tripNo?: number;
      message: string;
    }>;
  }
}
```

**Example Request:**

```json
{
  "trips": [
    {
      "tripNo": 7,
      "date": "2025-08-14",
      "vehNo": "NL01AJ6555",
      "fromLocation": "HALOL",
      "toLocation": "THANE",
      "tripKm": 836,
      "tripFare": 47362,
      "totalTripFare": 47362,
      "tripExpense": 38266,
      "profitStatement": 9096,
      "plantName": "TCI",
      "carQty": 6,
      "loadKm": 487,
      "emptyKm": 349,
      "isMarketTrip": false,
      "driverName": "",
      "fuelExpAmt": 0,
      "average": 0,
      "rtFare": 0,
      "stMiter": 0,
      "endMiter": 0,
      "dieselRate": 0,
      "ltr": 0,
      "exIncome": 0,
      "driverBal": 0,
      "lockStatus": false
    }
  ],
  "expenses": [
    {
      "tripNo": 7,
      "date": "2025-08-14",
      "expenseType": "TOLL",
      "amount": 500,
      "refVehNo": "NL01AJ6555",
      "remark1": "Imported from TCI"
    },
    {
      "tripNo": 7,
      "date": "2025-08-14",
      "expenseType": "Diesel",
      "amount": 25000,
      "refVehNo": "NL01AJ6555",
      "remark1": "Imported from TCI"
    }
  ],
  "expenseCategories": [
    { "name": "TOLL", "mode": "Expenses" },
    { "name": "Diesel", "mode": "Fuel" }
  ]
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "tripsCreated": 1,
    "tripsFailed": 0,
    "expensesCreated": 2,
    "expensesFailed": 0,
    "categoriesCreated": 0,
    "errors": []
  }
}
```

**Backend Implementation Notes:**
1. Use a database transaction for atomicity
2. First, upsert expense categories (if provided)
3. Then, bulk insert trips
4. Finally, bulk insert expenses
5. On any fatal error, rollback the entire transaction
6. On partial failures, continue and report errors in response

---

## 6. Validation Rules

- `tripNo`: Required, should be unique per organization
- `vehNo`: Required
- `fromLocation`, `toLocation`: Required
- `date`: Required, valid ISO date
- `plantName`: Optional string, max 255 chars
- `carQty`: Optional integer >= 0
- `loadKm`, `emptyKm`: Optional decimal >= 0
- `expenseType`: Must match an existing category name
- `amount`: Must be > 0

---

## 7. Migration Steps

1. Run database migration to add new columns to trips table
2. Deploy updated API with bulk import endpoint
3. Test import functionality end-to-end
