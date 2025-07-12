# Gym Management Backend API

A simple RESTful API for gym management built with Node.js, Express, and MongoDB.

## Features

- **Member Management**: Create, read, update, and delete gym members
- **Simple Structure**: Only 4 fields per member (name, phoneNumber, joinDate, paidAmount)
- **Data Validation**: Input validation using Joi
- **Error Handling**: Global error handling with proper HTTP status codes
- **MongoDB Integration**: Database integration with Mongoose
- **Vercel Deployment**: Ready for serverless deployment

## Architecture

```
src/
├── domain/              # Business logic and entities
│   ├── entities/        # Domain entities (Member)
│   └── services/        # Domain services
├── application/         # Application layer
│   ├── use-cases/       # Business use cases
│   └── dto/             # Data Transfer Objects
├── infrastructure/      # External concerns
│   ├── database/        # Database configuration and schemas
│   └── repositories/    # Repository implementations
└── presentation/        # API layer
    ├── controllers/     # HTTP controllers
    └── middleware/      # Express middleware
```

## API Endpoints

### Members
- `GET /api/v1/members` - Get all members with pagination and filtering
- `GET /api/v1/members/:id` - Get member by ID
- `POST /api/v1/members` - Create new member
- `PUT /api/v1/members/:id` - Update member
- `DELETE /api/v1/members/:id` - Delete member

### Health Check
- `GET /api/v1/health` - API health check

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   DATABASE_NAME=gym_management
   CORS_ORIGIN=*
   ```

3. **Start the server**
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
  "name": "John Doe",
  "phoneNumber": "1234567890",
  "joinDate": "2023-12-01",
  "paidAmount": 50000
}
```

## Query Parameters

### GET /api/v1/members

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `search` | string | Search in name or phone |
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
curl https://your-api-url.vercel.app/api/v1/health

# Get all members
curl https://your-api-url.vercel.app/api/v1/members

# Create member
curl -X POST https://your-api-url.vercel.app/api/v1/members \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phoneNumber": "1234567890",
    "joinDate": "2023-12-01",
    "paidAmount": 50000
  }'
```

## Deployment

This API is ready for deployment on Vercel. See `DEPLOYMENT.md` for detailed deployment instructions.

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **joi**: Data validation
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **morgan**: HTTP request logger
- **compression**: Response compression 