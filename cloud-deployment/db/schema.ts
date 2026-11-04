import {integer,sqliteTable,text,uniqueIndex,index} from 'drizzle-orm/sqlite-core';
export const actors=sqliteTable('actors',{
 id:text('id').primaryKey(),token:text('token').notNull(),room:text('room').notNull(),name:text('name').notNull(),state:text('state').notNull(),mat:text('mat'),updated:integer('updated').notNull(),lastGreet:integer('last_greet').notNull().default(0)
},t=>[uniqueIndex('one_actor_per_mat').on(t.room,t.mat),index('actors_room_updated').on(t.room,t.updated)]);
export const greetings=sqliteTable('greetings',{
 id:text('id').primaryKey(),room:text('room').notNull(),sender:text('sender').notNull(),target:text('target').notNull(),name:text('name').notNull(),created:integer('created').notNull()
},t=>[index('greetings_target_created').on(t.target,t.created)]);
