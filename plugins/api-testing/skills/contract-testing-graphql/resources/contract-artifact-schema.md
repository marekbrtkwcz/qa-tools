# GraphQL contract artifact schema

One artifact per consumer operation. Stored in the broker or a `contracts/` directory.

```yaml
consumer: payments-web          # consumer name
provider: orders-subgraph       # provider / subgraph name
operation_name: GetOrderForCheckout
operation_kind: query           # query | mutation
operation: |                    # the exact document the consumer sends
  query GetOrderForCheckout($id: ID!) {
    order(id: $id) { id status total { amount currency } }
  }
variables:                      # representative variable values used in the test
  id: "ord_123"
expect:                         # what the consumer depends on
  data_fields:                  # paths that must exist with compatible types
    - order.id: ID!
    - order.status: OrderStatus!
    - order.total.amount: Float!
    - order.total.currency: String!
  nullable_fields:              # fields the consumer explicitly handles as null
    - order.status
  error_handling:               # declared behaviour when errors occur
    - partial_null_field        # tolerates data.order = null on field error
    - errors_array_present      # reads errors[].message for user display
severity: critical              # critical | normal | deprecated
recorded_at: 2026-01-15
```

## Verification classification

When the provider replays the operation against the real schema:

| Result | Meaning | Gate |
| --- | --- | --- |
| safe | operation valid, all expected fields present and compatible | pass |
| warning | a depended-on field is deprecated (still works) | pass with report |
| breaking | field removed/retyped, required input added, operation invalid | blocks deploy |

## Federation note

With subgraphs, `provider` is the subgraph name and verification runs against that subgraph's schema. After all subgraphs verify, run one gateway-level composition check: the composed schema still contains every consumer operation's fields.
