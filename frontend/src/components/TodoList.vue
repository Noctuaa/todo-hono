<script setup>
    import { ref, computed, nextTick, useTemplateRef } from 'vue';
    import { useTodoStore } from '@/stores/todoStore';

    const todoStore = useTodoStore();
    const todoHeight = 55; // Height of each todo item in pixels
    const editingId = ref(null);
    const editingTitle = ref('');
    const editInput = useTemplateRef('editInput');

    /** 
     * Starts editing a todo item.
     * Sets the editingId to the todo's id and initializes editingTitle with the todo's title.
     * After the next DOM update, focuses the input field for editing.
     * @param {Object} todo - The todo item to edit.
     * @returns {Promise<void>}
     * @async
     */
    const startEdit = async (todo) => {
        editingId.value = todo.id
        editingTitle.value = todo.title
        
        await nextTick()
        
        if (editInput.value && editInput.value[0]) {
            editInput.value[0].focus()
            editInput.value[0].select()
        }
    }

    /**
     * Saves the edited todo item.
     * Updates the todo with the current editingId and editingTitle.
     * Resets editingId and editingTitle to their initial states.
     */
    const saveEdit = () => {
        todoStore.updateTodo(editingId.value, editingTitle.value);
        editingId.value = null
        editingTitle.value = '';
    }

    /**
     * Cancels the editing of a todo item.
     * Resets editingId and editingTitle to their initial states.
     */
    const cancelEdit = () => {
        editingId.value = null
        editingTitle.value = ''
    }

    /**
     * Toggles the completion status of a todo item.
     * Calls the toggleTodo method from the todoStore with the todo's id.
     * @param {number} todoId - The id of the todo item to toggle.
     */
    const handleToggle = (todoId) => {
        todoStore.toggleTodo(todoId)
    }

    /**
     * Deletes a todo item.
     * Calls the deleteTodo method from the todoStore with the todo's id.
     * @param {number} todoId - The id of the todo item to delete.
     */
    const handleDelete = (todoId) => {
        todoStore.deleteTodo(todoId)
    }


    // Calculates the dynamic height for fluid transitions
    const tasksHeight = computed(() => {
        return todoStore.filteredTodos.length * todoHeight
    })

</script>

<template>
    <ul name="todo" tag="ul" class="tasks" v-if="todoStore.allTodos.length > 0" :style="{ height: tasksHeight + 'px' }">
        <li :class="['task', 'd-flex', 'a-items-center', 'p-relative', { 'editing': editingId === todo.id }]" v-for="todo in todoStore.filteredTodos" :key="todo.id">
            <div class="edit-container w-100 h-100 d-flex a-items-center" v-if="editingId === todo.id">
                <div class="toggle-placeholder"></div>
                <input ref="editInput" type="text" class="edit-input w-100" v-model="editingTitle" @keyup.escape="cancelEdit" @keyup.enter="saveEdit" @blur="saveEdit" aria-label="Modifier la tâche" />
            </div>
            <template v-else>
                <input :id="`todo-${todo.id}`" :name="`todo-${todo.id}`" class="toggle-task btn-action" type="checkbox" :checked="todo.completed" @change="handleToggle(todo.id)" aria-label="Marquer la tâche comme terminée">
                <label class="task-label w-100" @dblclick="startEdit(todo)">{{ todo.title }}</label>
                <button class="destroy btn-action" aria-label="Supprimer la tâche" @click="handleDelete(todo.id)"></button>
            </template>
        </li>
    </ul>
</template>

<style>

/* Task styles */
.tasks{
    padding: 0;
    margin-top: var(--spacing-5);
    transition: height var(--duration-fast) ease-in-out;
    overflow: hidden;
}

.task{
    list-style: none;
    padding: var(--spacing-4) var(--spacing-5);
    height: 55px;
    border-bottom: 1px solid var(--border-color);
}

.task:last-child{
    border-bottom: none;
}

.task.editing, .task-label {
    padding: var(--spacing-1);
}

.edit-container {
    border: 2px solid var(--primary);
    border-radius: var(--radius-md);
    background: transparent;
}

.edit-input {
    background: transparent;
    border: none; 
    outline: none;
    padding: 0 var(--spacing-5);
    font-size: inherit;
    font-family: inherit;
}

.task-label{
    cursor: text;
    border-radius: 3px;
}

.task-label:hover{
    opacity:  .7;
}

.btn-action{
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}


/*===== BUTTON COMPLETED ====*/

.toggle-task, .toggle-placeholder{
    width: 30px;
    height: 25px;
    margin-right: 1em;
}

.toggle-task{
    cursor: pointer;
    appearance: none;
    border-radius:50%;
    border: 1px solid var(--border-color);
    transition: var(--transition-fast);
}

.toggle-task:checked{
    background-color: var(--primary);
    border: 1px solid var(--primary);
    border: none;
}


.toggle-task::after{
    content: "";
    position: absolute;
}


.toggle-task::after{
    width: 15px;
    height: 8px;
    border-left: 3px solid #fff;
    border-bottom: 3px solid #fff;
    transform: rotate(-45deg);
    opacity: 0;
}

.toggle-task:checked::after{
    opacity: 1;
}

.toggle-task:checked+label{
    text-decoration: line-through;
    color: #ccc;
    transition-duration: .3s ;
}

/*===== BUTTON DESTROY ====*/

.destroy {
    background: var(--warning);
    border: none;
    border-radius: 100%;
    cursor: pointer;
    opacity: 0;
    padding: 0;
    transition: var(--transition-fast);
    width: 30px;
    height: 25px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

.destroy:after, .destroy:before {
    content: " ";
    display: block;
    position: absolute;
    width: 15px;
    opacity: 1;
    border-top: 3px solid #fff;
}

.destroy:before {
    transform: rotate(-45deg);
}

.destroy:after {
    transform: rotate(45deg);
}

.task:hover .destroy{
    opacity: 1;   
}
</style>