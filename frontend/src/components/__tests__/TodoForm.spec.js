import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useTodoStore } from "@/stores/todoStore";
import TodoForm from "../TodoForm.vue";

describe("TodoForm", () => {
   let wrapper;
   let todoStore;
   let input;
   let form;
   
   beforeEach(() => {
      const pinia = createPinia();
      setActivePinia(pinia);
      
      wrapper = mount(TodoForm, {
         global: { plugins: [pinia]}
      });

      todoStore = useTodoStore();

      todoStore.todos = []

      input = wrapper.find("input#newTodo");
      form = wrapper.find("form.todo-form");
   })

   it("has a required on the input", () => {
      expect(input.attributes("required")).toBeDefined();
   })

   it("adds todo and clears input on submit", async () => {
      await input.setValue("New Task");
      expect(input.element.value).toBe("New Task");


      await form.trigger("submit.prevent");
      expect(input.element.value).toBe(""); // Input should be cleared after submit

      expect(todoStore.allTodos).toHaveLength(1)
      expect(todoStore.allTodos[0].title).toBe('New Task')
   })

   it("trims spaces from input", async () => {

      await input.setValue("  New Task  ");
      await form.trigger("submit.prevent");

      expect(todoStore.allTodos).toHaveLength(1);
      expect(todoStore.allTodos[0].title).toBe('New Task')

   })

   it("does nothing when input is empty or only spaces", async () => {
      await input.setValue("  ");
      await form.trigger("submit.prevent");
      expect(todoStore.allTodos).toHaveLength(0);

      await input.setValue("");
      await form.trigger("submit.prevent");
      expect(todoStore.allTodos).toHaveLength(0);
   })

})