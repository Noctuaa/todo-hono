<script setup lang="ts">
	import { ref } from 'vue';
	import { useAuthStore } from '@/stores/authStore';	
	import router from '@/router';
	import { loginSchema } from '@/validations/authValidation';
	
	const authStore = useAuthStore();

	const formData = ref({ email: '', password: '', rememberMe: false})
	const fieldErrors= ref({ email: '', password: '', overall: ''});

	// Implement the corresponding class according to the validation.
	const getInputClass = (fieldName: string) => {
		if(fieldErrors.value[fieldName] || fieldErrors.value['overall']) return 'error'
		if(formData.value[fieldName]) return 'valid'
  	}

	// Validates a single field in real time
	const validateField = (fieldName: string) => {
		try {
			const fieldSchema = loginSchema.shape[fieldName];
			if (fieldSchema) {
				fieldSchema.parse(formData.value[fieldName]);
				fieldErrors.value[fieldName] = '';
			}
		} catch (error: any) {
			if (error.issues && error.issues[0]) {
				fieldErrors.value[fieldName] = error.issues[0].message;
			}
		}
	}

	const handleSubmit = async() => {
		fieldErrors.value = { email: '', password: '', overall: ''}

		try {
			loginSchema.parse(formData.value);
			const success = await authStore.login(formData.value);
			if(success) { router.push({ name: 'todos'})}
			else { Object.assign(fieldErrors.value, authStore.error)}
		} catch (error) {
			// Zod client-side validation errors
         error.issues.forEach(issue => {
            fieldErrors.value[issue.path[0]] = issue.message
         })
		}
	}
</script>

<template>
	<form @submit.prevent="handleSubmit" class="w-100">
		<div class="form-group">
			<input type="email" v-model="formData.email" @input="validateField('email')" name="email" id="email" class="form-input" :class="getInputClass('email')" placeholder="Email" autocomplete="email" required>
			<div v-if="fieldErrors.email || fieldErrors.overall" class="error-text"> {{ fieldErrors.email || fieldErrors.overall }}</div>
		</div>
		<div class="form-group">
			<input type="password" v-model="formData.password" @input="validateField('password')" name="password" id="password" class="form-input" :class="getInputClass('password')" placeholder="Mot de passe" autocomplete="current-password" required>
			<div v-if="fieldErrors.password || fieldErrors.overall" class="error-text"> {{ fieldErrors.password || fieldErrors.overall }}</div>
		</div>
		<div class="form-check">
			<input class="form-check-input" v-model="formData.rememberMe" type="checkbox" name="rememberMe" id="rememberMe">
			<label class="form-check-label" for="rememberMe">Se souvenir de moi</label>
		</div>
		<button type="submit" class="btn form-button w-100">
			<span>Se connecter</span>
		</button>
	</form>
</template>

