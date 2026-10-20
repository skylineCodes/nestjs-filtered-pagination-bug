# NestJS Filtering and Pagination Lab

A small, self-contained **synthetic training project** for practicing diagnosis of an API filtering/pagination defect. It does not represent a real customer report, production service, or external company's code.

## Requirements

- Node.js 18 or newer
- npm
- Optional: Postman for API-level requests

## Setup

```bash
npm install
npm run build
npm test
```

Start the API:

```bash
npm run start:dev
```

Base URL: `http://localhost:3000`

## Endpoint

`GET /orders`

Query parameters:

- `status` (optional): `pending`, `paid`, or `cancelled`
- `page` (optional, default `1`): positive integer
- `pageSize` (optional, default `2`): integer from 1 to 100

Example:

```http
GET http://localhost:3000/orders?status=paid&page=1&pageSize=2
```

Response shape:

```json
{
  "data": [
    {
      "id": 102,
      "customer": "Customer B",
      "status": "paid",
      "amount": 8500
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 2,
    "total": 3,
    "totalPages": 2
  }
}
```

The exact `data` and `meta` values should be checked against the endpoint contract and dataset. For a filtered request, `total` is intended to represent the number of records matching the filter, before pagination. Pagination should be applied to the filtered set.

## Dataset

The API uses a fixed in-memory set of synthetic orders. There is no external database and no credentials are required.

## Exercise context

The starting implementation contains a deliberately seeded filtering/pagination defect for this lab. Diagnose it from the code and observed responses rather than assuming the cause. The current unit tests cover basic unfiltered pagination but do not cover the interaction between filtering and pagination.

For an authentic engineering workflow, establish the baseline first, then add a regression test that captures the observed failure, make the smallest suitable fix, and verify the behavior again. Keep the task description honest: this is a self-authored synthetic project prepared for a controlled debugging exercise, not a bug reported by a real client.

## Suggested API checks

1. `GET /orders?page=1&pageSize=2`
2. `GET /orders?status=paid&page=1&pageSize=2`
3. `GET /orders?status=paid&page=2&pageSize=2`
4. `GET /orders?status=cancelled&page=1&pageSize=2`

Compare the response rows and pagination metadata with the intended contract.
