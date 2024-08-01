// External Dependencies
import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

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

export const messages = pgTable('message', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userMessage: text('content'),
  response: text('response'),
  modelId: text('model_id')
    .notNull()
    .references(() => models.id, { onDelete: 'cascade' }),
  spaceId: text('space_id')
    .notNull()
    .references(() => spaces.id, { onDelete: 'cascade' }),
  previousMessageContext: text('previous_message_context'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export const messagesRelations = relations(messages, ({ one, many }) => ({
  models: one(models, { fields: [messages.modelId], references: [models.id] }),
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
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
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
