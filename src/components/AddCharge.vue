<script setup>
import { VMoney } from 'v-money';
import { db } from 'boot/firebase';
import { useQuasar } from 'quasar';
import { ref } from '@vue/runtime-core';
import { useChargeStore } from 'stores/charge-store.js';

const $q = useQuasar();
const chargesStore = useChargeStore();

const emit = defineEmits(['add'])

let price = ref(null);
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

    price.value = parseFloat(price.value.replace('€', '').replace(' EUR', '').replace('.', '').replace(',', '.'));

    if(price.value == null || price.value == 0) {
        $q.notify({
            message: 'El precio debe ser mayor que 0',
            color: 'negative',
            icon: 'warning'
        });
        return;
    }

    const response = await db.collection('Charges').add({
        UserID: localStorage.getItem('UserID'),
        Amount: price.value,
        CategoryID: parseInt(category.value),
        Date: new Date()
    });

    emit('add', {
        amount: price.value,
        categoryID: category.value,
    });

    chargesStore.addOne({
        chargeID: response.id,
        amount: price.value,
        categoryID: category.value,
        date: new Date().getTime()
    });

    price.value = null;
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


        <q-field
            filled
            dense
            v-model="price"
            label="Monto"
        >
            <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                <input :id="id" class="q-field__input text-right" :value="modelValue" @change="e => emitValue(e.target.value)" v-money="vmoneyDirective" v-show="floatingLabel">
            </template>
        </q-field>

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
