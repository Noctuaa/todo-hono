<script setup>
   import { useTodoStore } from '@/stores/todoStore';
   const todoStore = useTodoStore();

   /**
    * Filters for the todo items.
    * Each filter has a key and a label for display.
    */
   const filters = [
      { key: 'all', label: 'Tous' },
      { key: 'active', label: 'Actives' },
      { key: 'completed', label: 'Terminées' }
   ]

   /**
    * Handles the filter change.
    * Updates the todoStore's filter based on the selected filter key.
    * @param {string} filter - The key of the filter to apply.
    */
   const handleFilter = (filter) => {
      todoStore.setFilter(filter)
   }

</script>

<template>
   <footer class="todo-footer d-flex j-content-between a-items-center" v-if="todoStore.allTodos.length > 0">
      <span>  
         {{ todoStore.remainingCount === 0 ? 'Aucune tâche' :  todoStore.remainingCount === 1 ? '1 tâche' : `${todoStore.remainingCount} tâches` }}.
      </span>
      <nav class="todo-filters d-flex">
         <button v-for="filter in filters" :key="filter.key" @click="handleFilter(filter.key)" 
         class="filter-btn" :class="{ active: todoStore.filter === filter.key }">
            {{ filter.label }}
         </button>
      </nav>
   </footer>
</template>

<style>
   .todo-footer {
      border-top: 1px solid var(--border-color);
      padding: var(--spacing-3) var(--spacing-4);
   }

   .todo-filters{
      gap: var(--spacing-1);
      transition: all var(--duration-fast) ease-in;
   }

   .todo-filters .active{
      background-color: var(--primary);
      color: var(--text-secondary);
      border-radius: var(--radius-md);
   }

   .filter-btn{
      padding: var(--spacing-2);
      font-size: .9rem;
      background: none;
      border:none;
      cursor: pointer;
   }
</style>