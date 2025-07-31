import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useTodoStore } from '@/stores/todoStore'
import TodoFooter from '../TodoFooter.vue'

describe('TodoFooter', () => {
  let wrapper
  let todoStore

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    
    todoStore = useTodoStore()
    todoStore.todos = [
      { id: 1, title: 'Active task 1', completed: false },
      { id: 2, title: 'Active task 2', completed: false },
      { id: 3, title: 'Completed task', completed: true }
    ]
    
    wrapper = mount(TodoFooter, {
      global: { plugins: [pinia] }
    })
  })

   it('displays correct remaining count', () => {
      const countText = wrapper.text()
      expect(countText).toContain('2 tâches') // 2 actives
   })

   it('changes filter when buttons are clicked', async () => {
      const buttons = wrapper.findAll('button.filter-btn')
      
      // At start, filter = “all” by default
      expect(todoStore.filter).toBe('all')
      
      // Click on "Active"
      const activeButton = buttons.find(btn => btn.text() === 'Actives')
      await activeButton.trigger('click')
      expect(todoStore.filter).toBe('active')
      
      // Click on "Completed"
      const completedButton = buttons.find(btn => btn.text() === 'Terminées')
      await completedButton.trigger('click')
      expect(todoStore.filter).toBe('completed')
   })

   it('highlights active filter button', async () => {
      const buttons = wrapper.findAll('button.filter-btn')
      
      // By default, ‘All’ should be active
      const allButton = buttons.find(btn => btn.text() === 'Tous')
      expect(allButton.classes()).toContain('active')
      
      // Click on "Actives"
      const activeButton = buttons.find(btn => btn.text() === 'Actives')
      await activeButton.trigger('click')
      
      // Now ‘Actives’ should be active
      expect(activeButton.classes()).toContain('active')
      expect(allButton.classes()).not.toContain('active')
   })
})