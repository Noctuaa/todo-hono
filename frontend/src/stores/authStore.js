import { ref, computed } from "vue";
import { defineStore } from "pinia";

/**
 * Authentication store - Manages user login and authentication state
 */
export const useAuthStore = defineStore("auth", () => {
   /*===State===*/
   const user = ref(null);
   const isLoading = ref(false);
   const error = ref(null);


   /*===Getters===*/
   const isAuthenticated = computed(() => !!user.value?.connected === true);
   /*===Actions===*/

   /**
   * Checks authentication status with the server
   * @returns {boolean} True if authenticated, false otherwise
   */
   const checkAuthStatus = async () => {    
      try {
         const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/status`, {
            method: "GET",
            credentials: "include"
         });

         if (response.ok) {
            const data = await response.json();
              user.value = data.user
            return true;
         }
      } catch (error) {
         console.error('Auth status check failed:', error);
         user.value = null;
         return false;
      }
   }

   /**
   * Logs in a user with email and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @throws {Error} Throws error if login fails
   */
   const login = async (credentials) => {
      isLoading.value = true;
      error.value = null;
      try {
         const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(credentials),
         });  

         if(!response.ok) {
            error.value = "Email ou mot de passe incorrect";
            const errorData = await response.json();
            throw new Error(errorData.message);
         }

         const data = await response.json();

         console.log(data);
         user.value = data.user
      } catch (err) {
         console.error(err);
      } finally {
         isLoading.value = false;
      }
   }

   const $reset = () => {
      user.value = null
      isLoading.value = false
      error.value = null
  }

   return { user, isLoading, error, isAuthenticated, checkAuthStatus, login, $reset};
})
