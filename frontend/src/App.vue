<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/">
          <i class="bi bi-play-circle"></i> Newman AT
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link class="nav-link" to="/" exact-active-class="active">
                <i class="bi bi-house"></i> Home
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/runner" exact-active-class="active">
                <i class="bi bi-play-fill"></i> Runner
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/collections" exact-active-class="active">
                <i class="bi bi-collection"></i> Collections
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/environments" exact-active-class="active">
                <i class="bi bi-globe"></i> Environments
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/results" exact-active-class="active">
                <i class="bi bi-file-earmark-bar-graph"></i> Results
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="container-fluid mt-4">
      <router-view />
    </main>

    <footer class="footer mt-5 py-3 bg-light">
      <div class="container text-center">
        <span class="text-muted">Newman AT - Advanced Testing Tool</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
// App component setup
</script>

<style>
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#app {
  flex: 1;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.navbar-brand {
  font-weight: bold;
}

.footer {
  margin-top: auto;
}
</style>