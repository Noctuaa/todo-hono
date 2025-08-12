<script setup lang="ts">
   import { ref } from 'vue'
   import { useAuthStore } from '@/stores/authStore';
   import { useRouter } from 'vue-router';

   const authStore = useAuthStore();
   const router = useRouter();

   const formData = ref({ email: '', username: '', password: '', confirmPassword: ''})

   const handleRegister = async() => {
      
      const { confirmPassword, ...registerData } = formData.value
      const success = await authStore.register(registerData)
      if(success) router.push({name: 'login'})
   }

</script>

<template>
   <form @submit.prevent="handleRegister" class="w-100">
      <div class="form-group">
         <input type="email" v-model="formData.email" name="email" id="email" class="form-input" placeholder="Email" autocomplete="email">
      </div>
      <div class="form-group">
         <input type="text" v-model="formData.username" name="username" id="username" class="form-input" placeholder="Nom d'utilisateur" autocomplete="name">
      </div>
      <div class="form-group">
         <input type="password" v-model="formData.password" name="password" id="password" class="form-input" placeholder="Mot de passe" autocomplete="current-password">
      </div>
      <div class="form-group">
         <input type="password" v-model="formData.confirmPassword" name="confirmPassword" id="confirmPassword" class="form-input" placeholder="Confirmer le mot de passe" autocomplete="new-password">
      </div>
      <button type="submit" class="btn form-button w-100">
         <span>S'enregistrer</span>
      </button>
   </form>
</template>