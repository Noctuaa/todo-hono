<script setup lang="ts">

</script>

<template>
   <form action="" class="w-100">
      <div class="form-group">
         <input type="email" name="email" id="email" class="form-input" placeholder="Email" autocomplete="email" required>
      </div>
      <div class="form-group">
         <input type="text" name="username" id="username" class="form-input" placeholder="Nom d'utilisateur" autocomplete="name" required>
      </div>
      <div class="form-group">
         <input type="password" name="password" id="password" class="form-input" placeholder="Mot de passe" autocomplete="current-password" required>
      </div>
      <div class="form-group">
         <input type="password" name="confirmPassword" id="confirmPassword" class="form-input" placeholder="Confirmer le mot de passe" autocomplete="new-password" required>
      </div>
      <button type="submit" class="btn form-button w-100">
         <span>S'enregistrer</span>
      </button>
   </form>
</template>