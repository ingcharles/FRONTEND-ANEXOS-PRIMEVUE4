<script setup lang="ts">
// Contenedor de aplicación con barra superior y router-view
</script>

<template>
	<div class="min-h-screen flex flex-column">
		<header class="p-3 border-bottom ">
			<div class="flex align-items-center gap-3">
				<i class="pi pi-sitemap text-primary text-2xl" aria-hidden="true" />
				<h1 class="m-0 text-xl negrilla">Diseñador de Formularios</h1>
				<router-link class="ml-auto" to="/">Inicio</router-link>
				<!-- <router-link to="/disenador">Diseñador</router-link> -->
				<router-link to="/about">Acerca de</router-link>
			</div>
		</header>
		<main class="flex-1">
			<router-view />
		</main>
	</div>
	<PrimeToast />

</template>

<style scoped>
</style>

