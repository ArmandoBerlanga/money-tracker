<script setup>
let toggleTheme = () => document.body.classList.toggle('body--dark');
</script>

<template>
<q-page class="q-ma-sm q-my-md q-gutter-y-sm">

    <div class="title container">
        <h5 class="text-primary text-bold">Configuración</h5>
    </div>

    <div class="container">

    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-fab color="primary" icon="keyboard_arrow_up" direction="up">
            <q-fab-action color="grey" to="/" icon="home" />
            <q-fab-action color="grey" @click="toggleTheme" icon="dark_mode" />
        </q-fab>
    </q-page-sticky>
</q-page>
</template>
