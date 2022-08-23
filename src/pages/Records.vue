<script setup>
import { db } from 'boot/firebase';
import { ref } from '@vue/reactivity';
import { useChargeStore } from 'stores/charge-store.js';
import { useCategorieStore } from 'stores/categorie-store.js';

const chargesStore = useChargeStore();
const categoriesStore = useCategorieStore();

const charges = ref([]);
const categories = ref([]);

let getCategories = async () => {

    if(categoriesStore.categories.length != 0){
        categories.value = categoriesStore.categories;
        return;
    }

    await db.collection('Categories').get()
        .then(response => {
            response.forEach(doc => {
                categories.value.push({
                    description: doc.data().Description,
                    categoryID: doc.id
                })
            });

            categoriesStore.set(categories.value);
        })
}

let getCharges = async () => {

    if (chargesStore.charges.length == 0)
        await db.collection('Charges').get()
            .then(response => {
                response.forEach(doc => {
                    charges.value.push({
                        chargeID: doc.id,
                        amount: doc.data().Amount,
                        categoryID: doc.data().CategoryID,
                        date: doc.data().Date.seconds * 1000,
                    })
                });

                chargesStore.set(charges.value);
            });
    else
        charges.value = chargesStore.charges;

    charges.value = charges.value.sort((a, b) => {
        return b.date - a.date;
    });
}

let toggleTheme = () => document.body.classList.toggle('body--dark');
let formatter = date => new Date(date).toLocaleString('es-MX', { hour12: false }).replace(',', '').substring(0, 14);
let findCategory = id => categories.value.find(category => category.categoryID == id).description;

getCategories();
getCharges();

</script>

<template>
<q-page class="q-ma-sm q-my-md q-gutter-y-sm">

    <div class="title container">
        <h5 class="text-primary text-bold">Historial de cargos</h5>
    </div>

    <div class="remove-charge container">
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Categoria</th>
                    <th>Monto</th>
                    <th>Editar</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(charge, index) in charges" :key="index">
                    <td>{{ formatter(charge.date) }}</td>
                    <td>{{ findCategory(charge.categoryID) }}</td>
                    <td>€{{ charge.amount }}</td>
                    <td>
                        <q-btn
                            round
                            dense
                            flat
                            icon="edit"
                            size="md"
                            color="warning" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-fab color="primary" icon="keyboard_arrow_up" direction="up">
            <q-fab-action color="grey" to="/" icon="home" />
            <q-fab-action color="grey" @click="toggleTheme" icon="dark_mode" />
        </q-fab>
    </q-page-sticky>
</q-page>
</template>

<style lang="scss" scoped>
table {
    width: 100%;
    height: 10px;
    text-align: center;
    border-collapse: collapse;
    overflow: hidden;
    border-radius: 5px;

    thead {
        background-color: #4A7C59;
        color: #fff;
    }

    tbody {
        background-color: rgba(255, 255, 255, 0.587);

        tr {
            &:hover {
                background-color: #4a7c591c;
                cursor: pointer;
            }

            &:nth-of-type(2n) {
                background-color: #c2c6c31a;
                cursor: pointer;

                &:hover {
                    background-color: #4a7c591c;
                }
            }

            &:last-of-type {
                border-bottom: 2px solid #4A7C59;
            }
        }
    }

    th,
    td {
        padding: 0.2rem;
        width: 27.5%;
        &:last-child {
            width: 17.5%;
        }
    }

}
</style>
