import { defineStore } from "pinia";

export const useTodoStore = defineStore("todo", {
   // State
   state: () => ({
      todos: JSON.parse(localStorage.getItem('todos') || '[]'),
      filter: "all", // 'all', 'active', 'completed'
   }),

   // Actions
   actions: {

      /**
       * Adds a new todo item to the list.
       * @param {string} newTodo - The text content of the new todo
       * @returns {void}
       * @description This method checks if the newTodo input is not empty,
       * then pushes a new todo object into the todos array.
       * Each todo object contains an id, text, and completed status.
       */
      addTodo(newTodo = String) {
         if(newTodo && newTodo.trim()) {
            this.todos.push({
               id: Date.now(),
               title: newTodo.trim(),
               completed: false
            })

            this.saveStorage()
         }
      },

      /**
       * Updates the title of an existing todo item.
       * @param {number} todoId - The ID of the todo to update
       * @param {string} newTitle - The new title for the todo
       * @returns {void}
       * @description This method finds the todo with the given ID,
       * updates its title with the trimmed newTitle, and saves to localStorage.
       */
      updateTodo(todoid, newTitle) {
         if(!newTitle && !newTitle.trim()) return;

         const todo = this.todos.find(t => t.id === todoid);

         if (todo) {
            todo.title = newTitle.trim();
            this.saveStorage();
         }
      },

      /** 
       * Deletes a todo item by its ID.
       * @param {number} todoId - The ID of the todo to delete
       * @returns {void}
       * @description This method finds the index of the todo with the given ID,
       * removes it from the todos array if found, and saves the updated list to localStorage.
       */
      deleteTodo(todoId) {
         const index = this.todos.findIndex(t => t.id === todoId)
         if (index !== -1) {
            this.todos.splice(index, 1)
            this.saveStorage()
         }
      },

      /**
      * Toggles the completed status of a todo item
      * @param {number} todoId - The ID of the todo to toggle
      * @returns {void}
      * @description This method finds the todo with the given ID,
      * toggles its completed status, and saves the updated todos list to localStorage.
      */
      toggleTodo(todoId) {
         const todo = this.todos.find(t => t.id === todoId)
         if (todo) {
            todo.completed = !todo.completed
            this.saveStorage()
         }
      },

      /**  
       * Sets the current filter for displaying todos.
       * @param {string} filter - The filter to set ('all', 'active', 'completed')
       * @returns {void}
       */
      setFilter(filter) { this.filter = filter },

      /**
       * Saves todos to localStorage.
       * @returns {void}
       */
      saveStorage() {
         localStorage.setItem('todos', JSON.stringify(this.todos))
      },
   },

   getters: { 
      /**
       * Returns the list of todos based on the current filter.
       * @returns {Array} Filtered list of todos
       */
      allTodos: (state) => state.todos,

      /** 
       * Returns the list of todos that are not completed.
       * @returns {Array} List of active todos
       */
      remainingCount: (state) => state.todos.filter(todo => !todo.completed).length,

      /**  
       * Returns the filtered list of todos based on the current filter.
       * @returns {Array} Filtered list of todos
       * @description This getter checks the current filter state and returns:
       * - Only active todos if the filter is 'active'
       * - Only completed todos if the filter is 'completed'
       * If the filter is not recognized, it defaults to returning all todos.
       */
      filteredTodos: (state) => {
         switch (state.filter) {
            case 'active': return state.todos.filter(todo => !todo.completed);
            case 'completed': return state.todos.filter(todo => todo.completed);
            default: return state.todos; // 'all' or any other value
         }
      }
   }

})