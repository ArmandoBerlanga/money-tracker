<template>
<q-layout view="lHh Lpr lFf">
    <q-header elevated>
        <q-toolbar>
            <q-toolbar-title class="flex flex-center home" @click="this.$router.push('/')">
                <img src="~assets/icon.png" alt="main-icon" style="width:50px;">
                <div id="title" class="text-bold text-italic">Money Tracker</div>
            </q-toolbar-title>
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
.home:active{
    transition: all 0.3s ease-in-out;
    transform: scale(1.1);
}
</style>
