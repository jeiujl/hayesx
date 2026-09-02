# 3. Data Model

Relational, written here as Postgres. The same shape is mirrored in IndexedDB on
the device; `sync_state` and `updated_at` exist on every table to drive the
offline queue.

## 3.1 Entity relationships

```
users ──< pilots_aircraft >── aircraft
  │                              │
  │                              ├──< defects >──< defect_photos
  │                              ├──< return_to_service
  │                              └──< preflight_records
  │                                        │
  ├──< preflight_records ──< preflight_item_results
  │            │
  │            └──1:1── flights (logbook entries)
  │                        └──< flight_amendments
  │
  ├──< signatures
  ├──< message_threads ──< messages ──< attachments
  ├──< bulletin_acknowledgements >── bulletins
  └──< manual_acknowledgements >── manual_revisions
```

## 3.2 Core tables

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `email` | text unique | |
| `full_name` | text | Default `pilot_name` on flights |
| `phone` | text | |
| `emergency_contact_name` | text | |
| `emergency_contact_phone` | text | |
| `signature_id` | uuid fk | Current signature |
| `units` | enum | `metric` \| `imperial` |
| `locale` | text | `en` \| `zh` |
| `created_at`, `updated_at` | timestamptz | |

### `aircraft`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `serial_number` | text unique | **Entered once at onboarding** |
| `model` | text | Default `HayesX-250` |
| `category` | text | Default `Ultralight — FAA Part 103` |
| `tail_id` | text | Optional display identifier |
| `in_service_date` | date | |
| `status` | enum | `airworthy` \| `grounded` |
| `grounded_reason_defect_id` | uuid fk | Null unless grounded |
| `total_flights` | int | Denormalised running total |
| `total_flight_minutes` | int | Denormalised; drives Phase 2 maintenance intervals |

`pilots_aircraft` is a join table (`user_id`, `aircraft_id`, `role`) so a guest or
instructor pilot can log against an airframe they do not own.

### `preflight_records`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `aircraft_id`, `pilot_user_id` | uuid fk | |
| `pilot_name_snapshot` | text | Names are copied in, never joined at read time — the record must survive a profile edit |
| `checklist_version` | int | Which `preflight-checklist.json` schema version |
| `manual_revision` | text | e.g. `A` — what the pilot was checking against |
| `status` | enum | `in_progress` \| `no_go` \| `complete_unsigned` \| `signed` \| `expired` |
| `started_at`, `completed_at` | timestamptz | |
| `signed_at` | timestamptz | Null until signed |
| `signature_image` | bytea/url | **Copied in**, not referenced — the signature on a signed record must never change |
| `latitude`, `longitude`, `location_accuracy_m` | numeric | Captured at signing |
| `battery_percent_at_boarding` | int | From item J-05 |
| `app_version`, `device_model` | text | Provenance |
| `expires_at` | timestamptz | `signed_at + validity` |

### `preflight_item_results`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `preflight_record_id` | uuid fk | |
| `item_id` | text | e.g. `C-05` |
| `item_text_snapshot` | text | Verbatim text as shown to the pilot |
| `fm_section` | text | e.g. `4.3.2` |
| `result` | enum | `pass` \| `no_go` |
| `numeric_value` | numeric | Only for `numeric_gate` items |
| `answered_at` | timestamptz | |
| `sequence_index` | int | Order actually answered — proves sequence compliance |

> Snapshotting `item_text_snapshot` and `fm_section` is not redundancy. A signed
> preflight is a record of *what the pilot was asked and what they answered*. If
> the manual is revised next year, old records must still read correctly.

### `defects`
`id`, `aircraft_id`, `raised_by_user_id`, `source` (`preflight` \| `hard_landing`
\| `manual` \| `abnormal_condition`), `preflight_item_id`, `item_text`,
`fm_section`, `description`, `severity`, `status` (`open` \| `in_repair` \|
`closed`), `raised_at`, `latitude`, `longitude`, `closed_by_rts_id`.
`defect_photos`: `id`, `defect_id`, `url`, `thumb_url`, `taken_at`.

### `return_to_service`
Maintenance Manual Ch. 15 and 16 name exactly what must be recorded:
`id`, `aircraft_id`, `defect_id`, `aircraft_serial_number`, `flight_hours_at_service`,
`service_date`, `maintenance_item`, `defect_description`, `corrective_action`,
`replaced_component`, `component_serial_number`, `functional_check_performed` (bool),
`maintenance_personnel`, `inspector`, `signature_image`, `signed_at`.

### `flights` — the digital logbook entry
| Column | Type | Source |
|---|---|---|
| `id` | uuid pk | |
| `aircraft_id` | uuid fk | |
| `preflight_record_id` | uuid fk null | Links the flight to its preflight |
| `aircraft_description` | text | Default `HayesX-250` |
| `aircraft_category` | text | Default `Ultralight — FAA Part 103` |
| `aircraft_serial_number` | text | Snapshot from registry |
| `pilot_user_id` | uuid fk | |
| `pilot_name` | text | Editable — supports a different pilot |
| `flight_datetime` | timestamptz | Defaults to device time |
| `timezone` | text | Store the zone, not just the offset |
| `route_from`, `route_to` | text | |
| `flight_minutes` | int | From the flight timer, editable |
| `weather_condition` | text | Free text per the brief |
| `notes` | text | "About Flight or Machine" |
| `certified` | bool | The certification checkbox |
| `signature_image` | bytea/url | Copied in |
| `signed_at` | timestamptz | **Once set, the row is immutable** |
| `hard_landing` | bool | Triggers the FM 3.16 grounding flow |
| `created_at`, `updated_at` | timestamptz | |

`flight_amendments`: `id`, `original_flight_id`, `amended_by_user_id`, `reason`,
plus the same changed fields, `signature_image`, `signed_at`. Amendments are how
a signed entry is corrected. The original is never touched.

### Messaging and documents

- `message_threads` (`id`, `user_id`, `subject`, `last_message_at`, `unread_count`)
- `messages` (`id`, `thread_id`, `sender_type` `pilot`\|`hayesx`, `sender_id`, `body`, `sent_at`, `delivery_state`)
- `attachments` (`id`, `message_id`, `url`, `mime_type`, `size_bytes`, `defect_id` nullable)
- `bulletins` (`id`, `title`, `body`, `severity` `info`\|`service`\|`safety`, `requires_ack`, `published_at`, `applies_to_models[]`)
- `bulletin_acknowledgements` (`bulletin_id`, `user_id`, `acknowledged_at`)
- `manual_revisions` (`id`, `document_number`, `title`, `revision`, `issue_date`, `description`, `file_url`, `size_bytes`, `published_at`)
- `manual_acknowledgements` (`manual_revision_id`, `user_id`, `acknowledged_at`) — this is what makes checklist item **A-01** truthful

## 3.3 Integrity rules

These are enforced in the database, not only in the UI. A client bug must not be
able to produce an invalid safety record.

1. **Immutability.** A trigger rejects any `UPDATE` to `preflight_records`,
   `preflight_item_results`, or `flights` once `signed_at IS NOT NULL`, other than
   sync bookkeeping columns.
2. **Grounding gate.** Inserting a `flights` row is rejected if the aircraft's
   `status = 'grounded'`.
3. **Preflight completeness.** A `preflight_records` row cannot reach `signed`
   unless it has one `preflight_item_results` row per required item for its
   `checklist_version`, all `pass`.
4. **No-go cascade.** Any `preflight_item_results` row with `result = 'no_go'`
   forces the parent record to `no_go` and creates a `defects` row.
5. **Un-grounding.** `aircraft.status` may only move `grounded → airworthy`
   through a signed `return_to_service` row that closes the open defect.
6. **Signature snapshot.** `signature_image` on any signed record is stored by
   value. Changing a profile signature must not retroactively alter history.
7. **Totals.** `aircraft.total_flights` and `total_flight_minutes` are maintained
   by trigger on signed `flights` only. Drafts do not count.

## 3.4 Offline representation

Local store (IndexedDB via Dexie) mirrors the tables above, plus:

- `outbox` — `id`, `entity`, `entity_id`, `op`, `payload`, `attempts`,
  `last_error`, `created_at`.
- `blobs` — photos and signatures held locally until upload succeeds.
- `manual_cache` — downloaded manual content, keyed by revision.

Sync is last-write-wins on drafts, and append-only for anything signed — so
signed records can never conflict. The outbox retries with exponential backoff
and surfaces a pending count in Account.
