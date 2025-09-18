<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>Sorry, the page you requested does not exist.</p>
      <router-link to="/" class="home-link">
        <button>Return to Home</button>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  text-align: center;
  padding: 20px;
}

.not-found-content {
  max-width: 500px;
}

h1 {
  font-size: 80px;
  color: var(--primary-color);
  margin-bottom: 16px;
}

h2 {
  font-size: 32px;
  margin-bottom: 16px;
  color: var(--text-color);
}

p {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.home-link button {
  padding: 12px 24px;
  font-size: 16px;
}
</style>