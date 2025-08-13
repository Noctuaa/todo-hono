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

         const data = await response.json();

         if(!response.ok) {
            error.value = data.errors
            return false
         }

         user.value = data.user
         return true

      } catch (err) {
         console.error(err);
      } finally {
         isLoading.value = false;
      }
   }

   /**
    * Register a new user account
    * @param {Object} credentials - User credentials
    * @param {string} credentials.email - User email
    * @param {string} credentials.username - Username
    * @param {string} credentials.password - User password
    * @throws {Error} Throw error if registration fails
    */
   const register = async (credentials) => {
      isLoading.value = true;
      error.value = null;

      try {
         const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(credentials)
         })

         const data = await response.json();

         if(!response.ok){
            error.value = data.errors
            return false
         }

         console.log('Registration successful:', data)
         user.value = null
         return true;
      } catch (error) {
         console.error('Registration error:', error)
         return false
      } finally {
         isLoading.value = false;
      }
   }

   const $reset = () => {
      user.value = null
      isLoading.value = false
      error.value = null
  }

   return { user, isLoading, error, isAuthenticated, checkAuthStatus, login, register, $reset};
})
