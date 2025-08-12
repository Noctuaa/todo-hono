import { Model } from "objection";
import { User }  from "./User.js";

/**
 * Task model - manages tasks associated with users
 */
export class Task extends Model {

  id!: number;
  user_id!: number;
  title!: string;
  completed!: boolean;
  created_at?: string;
  updated_at?: string;
  
  tableName = "tasks";

  static jsonSchema = {
    type: 'object',
    required: ['user_id', 'title'],
    properties: {
      id: { type: 'integer' },
      user_id: { type: 'integer' },
      title: { type: 'string', minLength: 1, maxLength: 255 },
      completed: { type: 'boolean', default: false },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  }

  static relationMappings = () => ({
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: () => User,
      join: {
        from: 'tasks.user_id',
        to: 'users.id'
      }
    }
  })
}
