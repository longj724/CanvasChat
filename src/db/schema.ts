// External Dependencies
import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const spaces = pgTable('space', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  userId: text('userId').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export const spacesRelations = relations(spaces, ({ many }) => ({
  messages: many(messages),
  edges: many(edges),
}));

export const positionsEnum = pgEnum('positions', [
  'top',
  'bottom',
  'left',
  'right',
]);

export const messages = pgTable(
  'message',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userMessage: text('content'),
    response: text('response'),
    imageUrl: text('image_url').array(),
    modelName: text('model_name')
      .notNull()
      .references(() => models.name, { onDelete: 'cascade' }),
    spaceId: text('space_id')
      .notNull()
      .references(() => spaces.id, { onDelete: 'cascade' }),
    xPosition: numeric('x_position').notNull(),
    yPosition: numeric('y_position').notNull(),
    createdFrom: positionsEnum('created_from'),
    previousMessageContext: text('previous_message_context'),
    width: numeric('width').default('420').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    userMessageSearchIndex: index('user_message_search_index').using(
      'gin',
      sql`to_tsvector('english', ${table.userMessage})`
    ),
    responseSearchIndex: index('response_search_index').using(
      'gin',
      sql`to_tsvector('english', ${table.response})`
    ),
  })
);

export const messagesRelations = relations(messages, ({ one, many }) => ({
  models: one(models, {
    fields: [messages.modelName],
    references: [models.name],
  }),
  spaces: one(spaces, { fields: [messages.spaceId], references: [spaces.id] }),
  edges: many(edges),
}));

export const edges = pgTable('edges', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  spaceId: text('space_id')
    .notNull()
    .references(() => spaces.id, { onDelete: 'cascade' }),
  sourceId: text('source_id'),
  targetId: text('target_id'),
});

export const edgesRelations = relations(edges, ({ one, many }) => ({
  source: one(spaces, {
    fields: [edges.spaceId],
    references: [spaces.id],
  }),
}));

export const models = pgTable('model', {
  name: text('name').notNull().primaryKey(),
  acceptsImages: boolean('accepts_images').default(false).notNull(),
  displayName: text('display_name'),
  contextWindow: integer('context_window').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export const modelsRelations = relations(models, ({ many }) => ({
  messages: many(messages),
}));

export const openAIKey = pgTable('openai_key', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text('key').notNull(),
  userId: text('userId').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export const ollama = pgTable('ollama', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  baseUrl: text('base_url').notNull(),
  userId: text('userId').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});
