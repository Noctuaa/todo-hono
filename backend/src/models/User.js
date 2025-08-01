import { Model } from "objection";

/**
 * User model - manages user accounts and authentication
 */
class User extends Model {

   static get tableName() {
      return "users";
   }

   static get jsonSchema() {
      return {
         type: 'object',
         required: ['username', 'email', 'password'],
         properties: {
            id: { type: 'integer'},
            username: { type: 'string', minLength: 5, maxLength: 255 },
            email: { type: 'string', format: 'email', maxLength: 255 },
            password: { type: 'string', minLength: 8, maxLength: 255 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time'}
         }
      }
   }

   static get relationMappings() {
      return {
         tasks: {
            relation: Model.HasManyRelation,
            modelClass: require('./Task'),
            join: {
               from: 'users.id',
               to: 'tasks.user_id'
            }
         }
      }  
   }

   $formatJson(json) {
      json = super.$formatJson(json);
      // Remove password from the JSON response
      delete json.password;
      return json;
   }
}

module.exports = User;