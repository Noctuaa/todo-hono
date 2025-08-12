<script setup lang="ts">
   import { ref } from 'vue'
   import { useAuthStore } from '@/stores/authStore';
   import { useRouter } from 'vue-router';
   import { registerSchema } from '@/validations/authValidation';

   const authStore = useAuthStore();
   const router = useRouter();

   const formData = ref({ email: '', username: '', password: '', confirmPassword: ''})
   const fieldErrors = ref({ email: '', username: '', password: '', confirmPassword: ''})

   const getInputClass = (fieldName) => {
      return fieldErrors.value[fieldName] ? 'form-input error' : 'form-input'
  }

   const handleRegister = async() => {

      try {
         registerSchema.parse(formData.value)
         const { confirmPassword, ...registerData } = formData.value
         const success = await authStore.register(registerData)
         if(success) router.push({name: 'login'})
      } catch (error) {
   console.log(error.issues)
         error.issues.forEach(issue => {
            fieldErrors.value[issue.path[0]] = issue.message
         })
      }
   }

</script>

<template>
   <form @submit.prevent="handleRegister" class="w-100">
      <div class="form-group">
         <input type="email" v-model="formData.email" name="email" id="email" :class="getInputClass('email')" placeholder="Email" autocomplete="email">
         <div v-if="fieldErrors.email" class="error-text"> {{ fieldErrors.email }}</div>
      </div>
      <div class="form-group">
         <input type="text" v-model="formData.username" name="username" id="username" :class="getInputClass('username')" placeholder="Nom d'utilisateur" autocomplete="name">
         <div v-if="fieldErrors.username" class="error-text"> {{ fieldErrors.username }}</div>
      </div>
      <div class="form-group">
         <input type="password" v-model="formData.password" name="password" id="password" :class="getInputClass('password')" placeholder="Mot de passe" autocomplete="current-password">
         <div v-if="fieldErrors.password" class="error-text"> {{ fieldErrors.password }}</div>
      </div>
      <div class="form-group">
         <input type="password" v-model="formData.confirmPassword" name="confirmPassword" id="confirmPassword" :class="getInputClass('confirmPassword')" placeholder="Confirmer le mot de passe" autocomplete="new-password">
         <div v-if="fieldErrors.confirmPassword" class="error-text"> {{ fieldErrors.confirmPassword }}</div>
      </div>
      <button type="submit" class="btn form-button w-100">
         <span>S'enregistrer</span>
      </button>
   </form>
</template>

<style>

</style>