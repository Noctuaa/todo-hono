import { ref, computed } from "vue";
import { defineStore } from "pinia";

/**
 * Authentication store - Manages user login and authentication state
 */
export const useAuthStore = defineStore("auth", () => {
   /*===State===*/
   const user = ref(null);
   const token = ref(null);  
   const isLoading = ref(false);
   const error = ref(null);


   /*===Getters===*/
   const isAuthenticated = computed(() => !!user.value);

   /*===Actions===*/

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
         
         const response = await fetch("http://localhost:3333/auth/login", {
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
         user.value = data.data;
      } catch (err) {
         console.error(err);
      } finally {
         isLoading.value = false;
      }
   }

   const $reset = () => {
      user.value = null
      token.value = null
      isLoading.value = false
      error.value = null
  }

   return { user, token, isLoading, error, isAuthenticated, login, $reset};
})
