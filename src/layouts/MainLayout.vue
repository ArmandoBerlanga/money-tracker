<script setup>
import { onMounted } from '@vue/runtime-core';

onMounted(() => {
    let hr = new Date().getHours();
    if (hr >= 8 && hr <= 17)
        document.body.classList.remove('body--dark');
    else
        document.body.classList.add('body--dark');
});
</script>

<template>
<q-layout view="lHh Lpr lFf">
    <q-header elevated>
        <q-toolbar class="flex flex-center">
            <router-link to="/index" class="no-link">
                <q-toolbar-title class="flex flex-center home">
                    <img src="~assets/icon.png" alt="main-icon" style="width:50px;">
                    <div id="title" class="text-bold text-italic">Money Tracker</div>
                </q-toolbar-title>
            </router-link>
        </q-toolbar>
    </q-header>

    <q-page-container>
        <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" appear :duration="3000">
            <router-view />
        </transition>
    </q-page-container>
</q-layout>
</template>

<style lang="scss" scoped>
.home:active {
    transition: all 0.3s ease-in-out;
    transform: scale(1.1);
}

.no-link{
    text-decoration: none;
    color: inherit;
}
</style>
