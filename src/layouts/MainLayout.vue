<template>
<q-layout view="lHh Lpr lFf">
    <q-header elevated>
        <q-toolbar>
            <q-toolbar-title class="flex flex-center">
                <img src="~assets/icon.png" alt="main-icon" style="width:50px;">
                <div id="title" class="text-bold text-italic">Money Tracker</div>
            </q-toolbar-title>
        </q-toolbar>
    </q-header>

    <q-page-container>
        <router-view />
    </q-page-container>
</q-layout>
</template>
