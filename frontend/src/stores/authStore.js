import { ref, computed } from "vue";
import { defineStore } from "pinia";

/**
 * Authentication store - Manages user authentication state and operations
 * Handles login, registration, logout, and session validation
 * Uses JWT cookies and CSRF tokens for secure authentication
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
    * Checks authentication status with the server and updates user state
    * Validates JWT token and retrieves current session info
    * @returns {Promise<boolean>} True if authenticated, false otherwise
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
    * Authenticates user with email/password and establishes session
    * Sets authentication cookies and retrieves CSRF token
    * @param {Object} credentials - User login credentials
    * @param {string} credentials.email - User email address
    * @param {string} credentials.password - User password
    * @param {boolean} [credentials.rememberMe=false] - Extended session duration
    * @returns {Promise<boolean>} True if login successful, false otherwise
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
         console.error('Login error:', err);
         return false;
      } finally {
         isLoading.value = false;
      }
   }

   /**
    * Creates a new user account with validation
    * @param {Object} credentials - User registration data
    * @param {string} credentials.email - User email address
    * @param {string} credentials.username - Chosen username
    * @param {string} credentials.password - User password
    * @returns {Promise<boolean>} True if registration successful, false otherwise
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
      } catch (err) {
         console.error('Registration error:', err);
         return false
      } finally {
         isLoading.value = false;
      }
   }

   /**
    * Resets the authentication store to initial state
    * Clears user data, loading state, and errors
    */
   const $reset = () => {
      user.value = null;
      isLoading.value = false;
      error.value = null;
   }

   return { user, isLoading, error, isAuthenticated, checkAuthStatus, login, register, $reset};
})
