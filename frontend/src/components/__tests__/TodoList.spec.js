import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useTodoStore } from "@/stores/todoStore";
import TodoList from "@/components/TodoList.vue";

describe("TodoList", () => {
   let wrapper;
   let todoStore;

   beforeEach(() => {
      const pinia = createPinia();
      setActivePinia(pinia);

      todoStore = useTodoStore();

      todoStore.todos = [
         { id: 1, title: "First task", completed: false },
         { id: 2, title: "Second task", completed: true }
      ];

      wrapper = mount(TodoList, {
         global: { plugins: [pinia] }
      })
   })

   it('renders todos from store', () => {
      const todoItems = wrapper.findAll('.task')
      
      expect(todoItems).toHaveLength(2)
      expect(todoItems[0].text()).toContain('First task')
      expect(todoItems[1].text()).toContain('Second task')
   })

   it('toggles todo when checkbox is clicked', async () => {
      const firstCheckbox = wrapper.find('input[type="checkbox"].toggle-task')
      
      expect(firstCheckbox.element.checked).toBe(false)
      
      await firstCheckbox.trigger('change')
      
      expect(todoStore.allTodos[0].completed).toBe(true)
   })

   it('deletes todo when delete button is clicked', async () => {
      expect(todoStore.allTodos).toHaveLength(2)
      
      const deleteButton = wrapper.find('.destroy')
      await deleteButton.trigger('click')
      
      expect(todoStore.allTodos).toHaveLength(1)
      expect(todoStore.allTodos[0].title).toBe('Second task')
   })

   it('renders correct number of filtered todos', async () => {
      // Test active
      todoStore.setFilter('active')
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.task')).toHaveLength(1)
      
      // Test completed  
      todoStore.setFilter('completed')
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.task')).toHaveLength(1)
      
      // Test all
      todoStore.setFilter('all')
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.task')).toHaveLength(2)
   })
})