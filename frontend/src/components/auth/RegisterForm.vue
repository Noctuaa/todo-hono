<script setup lang="ts">
   import { ref } from 'vue'
   import { useAuthStore } from '@/stores/authStore';
   import router from '@/router';
   import { registerSchema } from '@/validations/authValidation';

   const authStore = useAuthStore();

   const formData = ref({ email: '', username: '', password: '', confirmPassword: ''})
   const fieldErrors = ref({ email: '', username: '', password: '', confirmPassword: ''})

	// Implement the corresponding class according to the validation.
	const getInputClass = (fieldName: string) => {
		if(fieldErrors.value[fieldName]) return 'error'
		if(formData.value[fieldName]) return 'valid'
  	}

   // Validates a single field in real time
   const validateField = (fieldName: string) => {
      try {
         const fieldSchema = registerSchema.shape[fieldName];
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

   const handleRegister = async() => {
      fieldErrors.value = { email: '', username: '', password: '', confirmPassword: ''}
      try {
         registerSchema.parse(formData.value)
         const { confirmPassword, ...registerData } = formData.value
         const success = await authStore.register(registerData)
         if(success) router.push({name: 'login'})
         else( Object.assign(fieldErrors.value, authStore.error))
      } catch (error) {
         // Zod client-side validation errors
         error.issues.forEach(issue => {
            fieldErrors.value[issue.path[0]] = issue.message
         })
      }
   }

</script>

<template>
   <form @submit.prevent="handleRegister" class="w-100">
      <div class="form-group">
         <input type="email" v-model="formData.email" @input="validateField('email')" name="email" id="email" class="form-input" :class="getInputClass('email')" placeholder="Email" autocomplete="email">
         <div v-if="fieldErrors.email" class="error-text"> {{ fieldErrors.email }}</div>
      </div>
      <div class="form-group">
         <input type="text" v-model="formData.username" @input="validateField('username')" name="username" id="username" class="form-input" :class="getInputClass('username')" placeholder="Nom d'utilisateur" autocomplete="name">
         <div v-if="fieldErrors.username" class="error-text"> {{ fieldErrors.username }}</div>
      </div>
      <div class="form-group">
         <input type="password" v-model="formData.password" @input="validateField('password')" name="password" id="password" class="form-input" :class="getInputClass('password')" placeholder="Mot de passe" autocomplete="current-password">
         <div v-if="fieldErrors.password" class="error-text"> {{ fieldErrors.password }}</div>
      </div>
      <div class="form-group">
         <input type="password" v-model="formData.confirmPassword" @input="validateField('confirmPassword')" name="confirmPassword" class="form-input" id="confirmPassword" :class="getInputClass('confirmPassword')" placeholder="Confirmer le mot de passe" autocomplete="new-password">
         <div v-if="fieldErrors.confirmPassword" class="error-text"> {{ fieldErrors.confirmPassword }}</div>
      </div>
      <button type="submit" class="btn form-button w-100">
         <span>S'enregistrer</span>
      </button>
   </form>
</template>

<style>

</style>