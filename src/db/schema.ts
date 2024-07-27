// External Dependencies
import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
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
  chats: many(chats),
}));

export const chats = pgTable('chat', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  spaceId: text('spaceId')
    .notNull()
    .references(() => spaces.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export const chatsRelations = relations(chats, ({ one, many }) => ({
  space: one(spaces, {
    fields: [chats.spaceId],
    references: [spaces.id],
  }),
  messages: many(messages),
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
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export const messagesRelations = relations(messages, ({ one, many }) => ({
  chats: many(chats),
  models: one(models),
}));

export const chatsToMessages = pgTable('chats_to_messages', {
  chatId: text('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  messageId: text('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
});

export const usersToGroupsRelations = relations(chatsToMessages, ({ one }) => ({
  chat: one(chats, {
    fields: [chatsToMessages.chatId],
    references: [chats.id],
  }),
  messages: one(messages, {
    fields: [chatsToMessages.messageId],
    references: [messages.id],
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
