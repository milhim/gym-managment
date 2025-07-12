# Gym Management Backend API

A robust RESTful API for gym management built with Node.js, Express, and MongoDB using Domain-Driven Design (DDD) architecture.

## Features

- **Member Management**: Create, read, update, and delete gym members
- **Payment Tracking**: Track member payments and payment history
- **Statistics**: Generate comprehensive gym statistics
- **Excel Export**: Export member data to Excel format with Arabic support
- **Data Validation**: Comprehensive input validation using Joi
- **Error Handling**: Global error handling with proper HTTP status codes
- **MongoDB Integration**: Robust database integration with Mongoose
- **Clean Architecture**: DDD implementation with proper separation of concerns

## Architecture

The project follows Domain-Driven Design (DDD) principles:

```
src/
├── domain/              # Business logic and entities
│   ├── entities/        # Domain entities (Member, Payment)
│   ├── repositories/    # Repository interfaces
│   └── services/        # Domain services
├── application/         # Application layer
│   ├── use-cases/       # Business use cases
│   └── dto/             # Data Transfer Objects
├── infrastructure/      # External concerns
│   ├── database/        # Database configuration and schemas
│   └── repositories/    # Repository implementations
└── presentation/        # API layer
    ├── controllers/     # HTTP controllers
    ├── routes/          # API routes
    └── middleware/      # Express middleware
```

## API Endpoints

### Members
- `GET /api/v1/members` - Get all members with pagination and filtering
- `GET /api/v1/members/:id` - Get member by ID
- `POST /api/v1/members` - Create new member
- `PUT /api/v1/members/:id` - Update member
- `DELETE /api/v1/members/:id` - Delete member

### Payments
- `POST /api/v1/members/:id/payments` - Add payment to member
- `GET /api/v1/members/:id/payments` - Get member payment history

### Statistics & Export
- `GET /api/v1/statistics` - Get gym statistics
- `GET /api/v1/export/members` - Export members to Excel

### Health Check
- `GET /api/v1/health` - API health check

## Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   DATABASE_NAME=gym_management
   CORS_ORIGIN=*
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `DATABASE_NAME` | Database name | `gym_management` |
| `CORS_ORIGIN` | CORS origin | `*` |

## Member Data Structure

```json
{
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "email": "string (optional)",
    "dateOfBirth": "date (optional)",
    "gender": "male|female (optional)",
    "emergencyContact": {
      "name": "string (optional)",
      "phone": "string (optional)"
    }
  },
  "membership": {
    "joinDate": "date",
    "totalFee": "number",
    "paidAmount": "number",
    "status": "active|inactive|suspended",
    "notes": "string (optional)"
  },
  "initialPaymentMethod": "cash|card|transfer (optional)"
}
```

## Payment Data Structure

```json
{
  "amount": "number",
  "date": "date (optional)",
  "method": "cash|card|transfer",
  "notes": "string (optional)"
}
```

## Query Parameters

### GET /api/v1/members

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `search` | string | Search in name or phone |
| `status` | string | Filter by status: active, inactive, suspended, paid, unpaid, partial |
| `joinDateFrom` | date | Filter by join date from |
| `joinDateTo` | date | Filter by join date to |

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "string (optional)",
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Error Handling

Error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": []
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Testing

You can test the API using tools like Postman or curl:

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Get all members
curl http://localhost:3000/api/v1/members

# Create member
curl -X POST http://localhost:3000/api/v1/members \
  -H "Content-Type: application/json" \
  -d '{
    "personalInfo": {
      "firstName": "أحمد",
      "lastName": "محمد",
      "phone": "0123456789"
    },
    "membership": {
      "totalFee": 100000,
      "paidAmount": 50000
    }
  }'
```

## Features in Development

- [ ] Member photos upload
- [ ] Membership expiration notifications
- [ ] Bulk member operations
- [ ] Advanced reporting
- [ ] Member check-in/check-out tracking
- [ ] SMS notifications
- [ ] Member mobile app API

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **joi**: Data validation
- **exceljs**: Excel file generation
- **cors**: Cross-origin resource sharing
- **compression**: Response compression
- **morgan**: HTTP request logging
- **dotenv**: Environment variable management

## License

This project is licensed under the MIT License. 