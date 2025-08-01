import { stat } from "fs";
import { Model } from "objection";

class Task extends Model {

   static get tableName() {
      return "tasks";
   }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'title'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: ['string', 'null'], maxLength: 1000 },
        completed: { type: 'boolean', default: false },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    }
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: () => require('./User'),
        join: {
          from: 'tasks.user_id',
          to: 'users.id'
        }
      }
    }
  }
}