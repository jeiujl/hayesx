// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import {sqliteTable,text,primaryKey,index} from 'drizzle-orm/sqlite-core';
export const settings=sqliteTable('settings',{owner:text('owner').notNull(),kind:text('kind').notNull(),data:text('data').notNull()},t=>[primaryKey({columns:[t.owner,t.kind]})]);
export const flights=sqliteTable('flights',{id:text('id').primaryKey(),owner:text('owner').notNull(),date:text('date').notNull(),signedAt:text('signed_at').notNull(),data:text('data').notNull()},t=>[index('flights_owner_date').on(t.owner,t.date)]);
