import { Model } from "objection";
import { Task } from "./Task.js";


/**
 * User model - manages user accounts and authentication
 */

export class User extends Model {

   id!: number;
   username!: string;
   email!: string;
   active!: boolean;
   email_verified!: boolean;
   password!: string;
   created_at?: string;
   updated_at?: string;

   static tableName = 'users';

   static jsonSchema = {
      type: 'object',
      required: ['username', 'email', 'password'],
      properties: {
         id: { type: 'integer'},
         username: { type: 'string', minLength: 3, maxLength: 255 },
         email: { type: 'string', format: 'email', maxLength: 255 },
         active: { type: 'boolean', default: true },
         email_verified: { type: 'boolean', default: false },
         password: { type: 'string', minLength: 8, maxLength: 255 },
         created_at: { type: 'string', format: 'date-time' },
         updated_at: { type: 'string', format: 'date-time'}
      }
   }

   static relationMappings = () => ({
      tasks: {
         relation: Model.HasManyRelation,
         modelClass: Task,
         join: {
            from: 'users.id',
            to: 'tasks.user_id'
         }
      } 
   })

   $formatJson(json: Record<string, unknown>) {
      json = super.$formatJson(json);
      // Remove password from the JSON response
      delete json.password;
      return json;
   }
}

