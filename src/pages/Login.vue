<script setup>
import { useQuasar } from 'quasar';
import { db } from 'boot/firebase';
import { ref } from '@vue/reactivity';

const $q = useQuasar()

let name = ref(null);
let users = ref([]);

let getUsers = async () => {
    await db.collection('Users').get()
        .then(response => {
            response.forEach(doc => {
                users.value.push({
                    name: doc.data().Name,
                    userID: doc.id,
                    total: 0
                })
            });
        });
};

let onSubmit = () => {
    let userID = users.value.find(user => user.name == name.value)?.userID ?? null;

    if(!userID) {
        $q.notify({
            type: 'negative',
            message: 'Hemos detectado que eres un enemigo, por lo que no te dejaremos entrar.'
        });
        return;
    }

    localStorage.setItem('UserID', userID);
    location.replace('/index');
};

getUsers();

</script>

<template>
<q-page class="flex flex-center">
    <div class="container" style="width: 90vw;">
        <h5 class="text-bold text-primary">¿Amigo o enemigo?</h5>

        <div class="linea bg-primary q-mt-sm" style="height: 3px;width: 25%;"></div>

        <form @submit.prevent="onSubmit">
            <q-input
                filled
                v-model="name"
                label="Nombre de usuario"
                class="q-my-md"
            />

            <q-btn label="acceder" color="primary" class="full-width q-py-sm" type="submit"/>
        </form>
    </div>
</q-page>
</template>

<style lang="scss" scoped>
.container {
    padding: 2rem 1rem;
}

</style>
