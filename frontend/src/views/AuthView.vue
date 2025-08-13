<script setup lang="ts">
   import LoginForm from '@/components/auth/LoginForm.vue';
   import RegisterForm from '@/components/auth/RegisterForm.vue';
   import { computed } from 'vue';
   import { useRoute } from 'vue-router';

   const route = useRoute();
   const isLogin = computed(() => route.path === '/login');

</script>

<template>
   <div class="auth-container a-content-center w-100">
      <div class="auth-card p-relative w-100" :style="{ height: isLogin ? '478px' : '590px' }">
         <div class="auth-header">
            <h1 class="auth-title">{{ isLogin ? 'Connexion' : 'Inscription'  }}</h1>
            <p class="auth-subtitle">{{ isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}}</p>
         </div>
         <div class="auth-content">
            <Transition name="slide-fade" mode="out-in">
               <div v-if="isLogin" key="login">
                  <LoginForm/>
                  <div class="auth-footer">
                     <p class="text-center">
                        Pas encore de compte ?
                        <router-link to="/register" class="auth-link">Inscrivez-vous</router-link>
                     </p>
                  </div>
               </div>
               <div v-else key="register">
                  <RegisterForm/>
                  <div class="auth-footer">
                     <p class="text-center">
                        Déjà inscrit ?
                        <router-link to="/login" class="auth-link">Se connecter</router-link>
                     </p>
                  </div>
               </div>
            </Transition>
         </div>
      </div>
   </div>
</template>

<style>
   .auth-container {
      padding: var(--spacing-5);
      max-width: 450px;
   }
   
   .auth-card {
      background: white;
      padding: 0 ;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.15);
      overflow: hidden;
      transition: all var(--duration-fast) ease;
   }
   
   .auth-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
      color: white;
   }
   
   .auth-title {
      font-size: 1.8rem!important;
      margin-bottom: 8px!important;
      font-weight: 600!important;
   }
   
   .auth-subtitle {
      opacity: 0.9;
      font-size: 0.9rem;
   }

   .auth-content {
      padding: var(--spacing-8);
   }
   
   .auth-footer{
      padding-top:var(--spacing-8);
   }

   .auth-footer p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-primary);
   }

   .auth-link {
      margin-left: 5px;
   }

   /*=== ANIMATION ===*/
   .slide-fade-enter-active,
   .slide-fade-leave-active {
      transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
   }

   .slide-fade-enter-from {
      opacity: 0;
      transform: translateY(20px);
   }

   .slide-fade-leave-to {
      opacity: 0;
      transform: translateY(-20px);
   }

</style>