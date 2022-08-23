<script setup>
import { VMoney } from 'v-money';
import { db } from 'boot/firebase';
import { useQuasar } from 'quasar';
import { ref } from '@vue/runtime-core';

const $q = useQuasar();

const emit = defineEmits(['add'])

let price = ref(0);
let category = ref(null);
let categories = ref([]);

let vmoneyDirective = {
    decimal: ',',
    thousands: '.',
    prefix: '€',
    suffix: ' EUR',
    precision: 2,
    masked: false,
    min: 0.00
};

let getCategories = async () => {
    const response = await db.collection('Categories').get()
    response.forEach(doc => {
        categories.value.push({
            label: doc.data().Description,
            value: doc.id
        })
    })
}

let addSpent = async () => {
    if(category.value == null) {
        $q.notify({
            message: 'Selecciona una categoría',
            color: 'negative',
            icon: 'warning'
        });
        return;
    }

    if(price.value <= 0) {
        $q.notify({
            message: 'El precio debe ser mayor que 0',
            color: 'negative',
            icon: 'warning'
        });
        return;
    }

    const response = await db.collection('Charges').add({
        Amount: parseFloat(price.value),
        CategoryID: parseInt(category.value),
        Date: new Date()
    });

    emit('add', {
        amount: price.value,
        categoryID: category.value,
    });

    price.value = 0;
    category.value = null;

    $q.notify({
        message: 'Gasto agregado',
        color: 'positive',
        icon: 'check'
    });
}

getCategories();
</script>

<template>
<div id="add-spent">
    <form class="add-spent-form" @submit.prevent="">

        <q-select
            filled
            dense
            emit-value
            map-options
            v-model="category"
            :options="categories"
            label="Categoría" />

        <q-input
            filled
            dense
            v-model="price"
            v-money="vmoneyDirective"
            label="Gasto"
            mask="#.##"
            fill-mask="0"
            reverse-fill-mask
            input-class="text-right" />


        <q-btn
            color="primary"
            class="add"
            label="Agregar"
            style="grid-column: span 2;"
            @click="addSpent" />

    </form>
</div>
</template>

<style lang="scss" scoped>
.add-spent-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 0.35rem;
}
</style>
