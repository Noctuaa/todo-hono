<script setup>
	import { ref } from 'vue';
	import router from '@/router';
	import { useAuthStore } from '@/stores/authStore';

	const email = ref('');
	const password = ref('');

	const authStore = useAuthStore();



	const handleSubmit = async() => {
		await authStore.login({ email: email.value, password: password.value});
		router.push({name: 'todos'});
	}
</script>

<template>
	<form @submit.prevent="handleSubmit" class="w-100">
		<div class="form-group">
			<input type="email" v-model="email" name="email" id="email" class="form-input" placeholder="Email" autocomplete="email" required>
		</div>
		<div class="form-group">
			<input type="password" v-model="password" name="password" id="password" class="form-input" placeholder="Mot de passe" autocomplete="current-password" required>
		</div>
		<div class="form-check">
			<input class="form-check-input" type="checkbox" name="rememberMe" id="rememberMe">
			<label class="form-check-label" for="rememberMe">Se souvenir de moi</label>
		</div>
		<div class="error-message">

		</div>
		<button type="submit" class="btn form-button w-100">
			<span>Se connecter</span>
		</button>
	</form>
</template>
