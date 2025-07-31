<script setup>
	import TodoForm from '@/components/TodoForm.vue';
	import TodoList from '@/components/TodoList.vue';
	import TodoFooter from '@/components/TodoFooter.vue';
</script>

<template>
	<main class="todo-app d-flex f-direction-column a-items-center w-100">
    	<header class="text-center">
      	<h1>Todo</h1>
    	</header>
   	<section class="todo-container">
			<TodoForm/>
			<div class="todolist p-relative">
				<TodoList/>
				<TodoFooter/>
			</div>
   	</section>
	</main>
</template>

<style>

	.todo-container{
		width: 100%;
	}

	@media (min-width: 450px){
		.todo-container{
			width: 450px;
		}
	}

	.todolist {
		background-color: #fff;
		z-index: 10;
		border-radius: var(--radius-md);
	}

	.todolist::after, .todolist::before {
		background: #fff;
		content: " ";
		display: block;
		height: 10px;
		position: absolute;
		border-radius: var(--radius-md)
	}

	.todolist::after {
		opacity: .3;
		width: 90%;
		left: 5%;
		bottom: -14px;
	}

	.todolist::before {
		opacity: .5;
		width: 95%;
		left: 2.5%;
		bottom: -7px;
	}

</style>
