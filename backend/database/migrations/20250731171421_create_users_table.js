import { table } from "console";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = (knex) => {
   return knex.schema.createTable('users', (table) => {
      table.engine('InnoDB'); // Use InnoDB engine for MySQL
      table.increments('id').primary();
      table.string('username').notNullable();
      table.string('email').notNullable().unique();
      table.boolean('active').defaultTo(true);
      table.boolean('email_verified').defaultTo(false);
      table.string('password').notNullable();
      table.timestamps(true, true); // created_at and updated_at
   });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = (knex) => {
   table.dropTableIfExists('users');
};
