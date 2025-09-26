---
title: NHMzh REST API
description: REST API Dokumentation für Cost- und LCA-Services
---

# NHMzh REST API Documentation

## Overview

This document describes the REST APIs for the NHMzh (Nachhaltigkeitsmonitoring der Stadt Zürich) Cost and LCA services.

## Security Features

All endpoints include the following security measures:

1. **Rate Limiting**
   - Default: 100 requests per 15 minutes per IP
   - Write operations: 20 requests per 15 minutes per IP

2. **Input Validation**
   - All request parameters and body data are validated
   - Invalid requests return 400 status with error details

3. **Timeout Handling**
   - All requests timeout after 30 seconds
   - Timed out requests return 503 status

4. **Security Headers**
   - Helmet.js provides secure HTTP headers
   - CORS protection with configurable origins

5. **Error Handling**
   - Comprehensive error handling with appropriate status codes
   - Detailed error messages in development mode only

## Cost Service API

Base URL: `https://cost-api.test.fastbim5.eu` (test) / `https://cost-api.fastbim5.eu` (production)

### Endpoints

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "UP",
  "kafkaProducer": "CONNECTED",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET /projects
Retrieve all projects.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Project Name",
    "created": "2024-01-15T10:30:00.000Z"
  }
]
```

#### GET /project-elements/:projectName
Get all elements for a specific project.

**Parameters:**
- `projectName` (string, required): Name of the project

**Response:**
```json
{
  "elements": [
    {
      "id": "element-id",
      "name": "Element Name",
      "ebkp_code": "C1.1",
      "quantities": { ... }
    }
  ],
  "modelMetadata": {
    "filename": "project.ifc",
    "element_count": 150,
    "upload_timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /available-ebkp-codes
Get all available eBKP-H codes.

**Response:**
```json
{
  "codes": ["C1.1", "C1.2", "C2.1"],
  "count": 3
}
```

#### GET /get-kennwerte/:projectName
Get unit costs (Kennwerte) for a project.

**Parameters:**
- `projectName` (string, required): Name of the project

**Response:**
```json
{
  "kennwerte": {
    "C1.1": 250,
    "C1.2": 180
  }
}
```

#### POST /save-kennwerte
Save unit costs (Kennwerte) for a project.

**Request Body:**
```json
{
  "projectName": "Project Name",
  "kennwerte": {
    "C1.1": 250,
    "C1.2": 180
  }
}
```

**Response:**
```json
{
  "message": "Kennwerte saved successfully"
}
```

#### POST /reapply-costs
Trigger cost recalculation for a project.

**Request Body:**
```json
{
  "projectName": "Project Name"
}
```

**Response:**
```json
{
  "message": "Cost re-application process initiated"
}
```

#### POST /confirm-costs
Send confirmed cost data to Kafka.

**Request Body:**
```json
{
  "project": "Project Name",
  "data": [
    {
      "id": "element-id",
      "cost": 1000,
      "ebkp_code": "C1.1"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Successfully sent 1 cost elements",
  "count": 1
}
```

## LCA Service API

Base URL: `https://lca-api.test.fastbim5.eu` (test) / `https://lca-api.fastbim5.eu` (production)

### Endpoints

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET /api/kbob/materials
Get all KBOB materials from the library.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Beton",
    "density": 2400,
    "impacts": { ... }
  }
]
```

#### GET /api/projects
Get all available projects.

**Response:**
```json
{
  "projects": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Project Name"
    }
  ]
}
```

#### GET /api/projects/:projectId/materials
Get materials and mappings for a specific project.

**Parameters:**
- `projectId` (string, required): MongoDB ObjectId of the project

**Response:**
```json
{
  "projectId": "507f1f77bcf86cd799439011",
  "name": "Project Name",
  "metadata": { ... },
  "ifcData": {
    "materials": [
      {
        "name": "Concrete",
        "volume": 125.5
      }
    ],
    "elements": [ ... ]
  },
  "materialMappings": {
    "Concrete": "kbob-material-id"
  },
  "materialDensities": {
    "Concrete": 2400
  },
  "ebf": 500
}
```

#### POST /api/projects/:projectId/confirm-lca
Submit LCA calculation results.

**Parameters:**
- `projectId` (string, required): MongoDB ObjectId of the project

**Request Body:**
```json
{
  "lcaData": {
    "project": "Project Name",
    "filename": "project.ifc",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "fileId": "file-id",
    "data": [
      {
        "id": "element-id",
        "sequence": 1,
        "mat_kbob": "kbob-id",
        "gwp_absolute": 1000,
        "gwp_relative": 2.5
      }
    ]
  },
  "materialMappings": {
    "Concrete": "kbob-material-id"
  },
  "ebfValue": 500,
  "materialDensities": {
    "Concrete": 2400
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "LCA data sent."
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
Invalid input parameters or request body.
```json
{
  "errors": [
    {
      "msg": "Project name is required",
      "param": "projectName",
      "location": "params"
    }
  ]
}
```

### 403 Forbidden
CORS policy violation or CSRF token error.
```json
{
  "error": "CORS policy violation"
}
```

### 404 Not Found
Route or resource not found.
```json
{
  "error": "Route not found"
}
```

### 429 Too Many Requests
Rate limit exceeded.
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
Server error occurred.
```json
{
  "error": "Internal server error",
  "message": "Error details (development only)"
}
```

### 503 Service Unavailable
Request timeout or service unavailable.
```json
{
  "error": "Request timeout"
}
```

### Deployment Steps

1. Update GitHub workflows with new image names
2. Update docker-compose files with new service configurations
3. Rebuild and push Docker images
4. Update Traefik routes for new domains
5. Deploy updated services
6. Update frontend applications to use new endpoints

## Best Practices

1. **Always include proper error handling** in client applications
2. **Implement retry logic** for failed requests (with exponential backoff)
3. **Cache responses** where appropriate to reduce API calls
4. **Monitor rate limit headers** in responses to avoid hitting limits
5. **Use appropriate HTTP methods** (GET for reads, POST for writes)
6. **Include correlation IDs** in requests for debugging

