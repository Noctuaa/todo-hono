import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useTodoStore } from "@/stores/todoStore";

describe("TodoStore", () => { 
   let store;
   beforeEach(() => {
      const pinia = createPinia();
      setActivePinia(pinia)
      store = useTodoStore();
      store.todos = [];
   })

   it("start with empty todos", () => {
      expect(store.allTodos).toEqual([]);
   })

   it("adds a new todo", () => {
      store.addTodo("Test Todo");
      expect(store.allTodos).toHaveLength(1);
      expect(store.allTodos[0]).toEqual({
         id: expect.any(Number),
         title: "Test Todo",
         completed: false
      });
   })

   it("does not add empty todo", () => {
      store.addTodo("");
      store.addTodo("   ");
      expect(store.allTodos).toHaveLength(0);
   })

   it("trims todo text", () => {
      store.addTodo("   Spaced Task   ");
      expect(store.allTodos[0].title).toBe("Spaced Task");
   })

   it("toggles todo completion status", () => {
      store.addTodo("Toggle Task");
      const todoId = store.allTodos[0].id;

      expect(store.allTodos[0].completed).toBe(false);

      store.toggleTodo(todoId);
      expect(store.allTodos[0].completed).toBe(true);

      store.toggleTodo(todoId);
      expect(store.allTodos[0].completed).toBe(false);
   })

   it("does nothing when toggling non-existent todo", () => {
      store.addTodo("test");
      const initialState = [...store.allTodos];

      store.toggleTodo(999);

      expect(store.allTodos).toEqual(initialState);
   })

   it("deletes a todo", () => {
      store.addTodo("First Task");
      store.addTodo("Second Task");
      expect(store.allTodos).toHaveLength(2);


      const firstId = store.allTodos[0].id;
      store.deleteTodo(firstId);

      expect(store.allTodos).toHaveLength(1);
      expect(store.allTodos[0].title).toBe("Second Task");
   })

   it('does nothing when deleting non-existent todo', () => {
      store.addTodo('Test')
      const initialLength = store.allTodos.length
      
      store.deleteTodo(999)
      
      expect(store.allTodos).toHaveLength(initialLength)
   })

   // Test for updating a todo
   it('updates a todo title', () => {
      store.addTodo('Original title')
      const todoId = store.allTodos[0].id
      
      store.updateTodo(todoId, 'Updated title')
      
      expect(store.allTodos).toHaveLength(1)
      expect(store.allTodos[0].title).toBe('Updated title')
      expect(store.allTodos[0].completed).toBe(false) // Ensure completed status remains unchanged
})

   it('trims whitespace when updating', () => {
      store.addTodo('Original')
      const todoId = store.allTodos[0].id
      
      store.updateTodo(todoId, '  Updated title  ')
      
      expect(store.allTodos[0].title).toBe('Updated title')
   })

   it('does nothing when updating non-existent todo', () => {
      store.addTodo('Test')
      const initialState = [...store.allTodos]
      
      store.updateTodo(999, 'New title')
      
      expect(store.allTodos).toEqual(initialState)
   })

   describe("getters", () => {
      beforeEach(() => {
         store.todos = [
            { id: 1, title: 'Active task 1', completed: false },
            { id: 2, title: 'Active task 2', completed: false },
            { id: 3, title: 'Completed task', completed: true }
         ]
      })

      it("returns remaining count correctly", () => {
         expect(store.remainingCount).toBe(2);
      })

      it("filters active todos", () => {
         store.setFilter("active");

         expect(store.filteredTodos).toHaveLength(2);
         expect(store.filteredTodos.every(todo => !todo.completed)).toBe(true);
         
      })

      it("filters completed todos", () => {
         store.setFilter("completed");

         expect(store.filteredTodos).toHaveLength(1);
         expect(store.filteredTodos[0].title).toBe('Completed task')
      })

      it('filters all todos (default)', () => {
         store.setFilter('all')
         
         expect(store.filteredTodos).toHaveLength(3)
         expect(store.filteredTodos).toEqual(store.allTodos)
      })

      it('handles unknown filter gracefully', () => {
         store.setFilter('unknown-filter')
         
         expect(store.filteredTodos).toHaveLength(3)
         expect(store.filteredTodos).toEqual(store.allTodos)
      })

      it('returns 0 remaining when all todos are completed', () => {
         store.todos.forEach(todo => todo.completed = true)
         
         expect(store.remainingCount).toBe(0)
      })

         it('returns correct count when no todos exist', () => {
         store.todos = []
         
         expect(store.remainingCount).toBe(0)
      })
   })

})