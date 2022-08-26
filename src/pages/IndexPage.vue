<script setup>
import { db } from 'boot/firebase';
import { useRouter } from 'vue-router';
import AddCharge from 'components/AddCharge.vue';
import PieChart from 'components/charts/PieChart.vue';
import BarChart from 'components/charts/BarChart.vue';
import { useChargeStore } from 'stores/charge-store.js';
import { useCategorieStore } from 'stores/categorie-store.js';
import { nextTick, onMounted, reactive } from '@vue/runtime-core';

const router = useRouter();
const chargesStore = useChargeStore();
const categoriesStore = useCategorieStore();

const state = reactive({
    categories: [],
    charges: [],
    pieSeries:[],
    pieLabels:[],
    barSeries: [],
    totalSpent: 0,
    renderCharts: true,
    noData: true
});

function formatter(number) {
    return '€' + Number(parseFloat(number).toFixed(2)).toLocaleString("es-MX", {
        minimumFractionDigits: 2
    }) + ' EUR';
}

async function forceRerender() {
    state.renderCharts = false;
    await nextTick();
    state.renderCharts = true;
};

function toggleTheme() {
    document.body.classList.toggle('body--dark');
    forceRerender();
};

function logOut() {
    localStorage.clear();
    chargesStore.$reset();
    categoriesStore.$reset();
    router.push('/');
};

async function getCategories() {
    state.categories = categoriesStore.categories;

    if(state.categories.length != 0)
        return;

    await db.collection('Categories').get()
        .then(response => {
            response.forEach(doc => {
                state.categories.push({
                    description: doc.data().Description,
                    categoryID: doc.id,
                    total: 0
                })
            });

            categoriesStore.set(state.categories);
        });
}

function getPieSeries(){
    state.categories.forEach(category => category.total = 0);

    state.charges.forEach(charge => {
        let today = new Date();
        let chargeDate = new Date(charge.date);

        if(today.getMonth() == chargeDate.getMonth())
            state.categories.find(category => charge.categoryID == category.categoryID).total += charge.amount;
    });

    state.pieSeries = state.categories.flatMap(category => category.total);
}

function getBarSeries(){
    state.barSeries = [];

    let byCategory = state.charges.reduce((acc, charge) => {
        if(!acc[charge.categoryID])
            acc[charge.categoryID] = [];
        acc[charge.categoryID].push(charge);

        return acc;
    }, {});

    let byDate = Object.keys(byCategory).map(key => {
        let charges = byCategory[key]
            .reduce((acc, charge) => {
                let month = new Date(charge.date).getMonth();

                if(!acc[month])
                    acc[month] = 0;
                acc[month] += charge.amount;

                return acc;
            }, {});

        for(let i = 0; i < 12; i++)
            if(!charges[i]) charges[i] = 0;

        return {
            key,
            charges
        }
    });

    state.barSeries = state.categories.map(c => {
        return {
            name: c.description,
            data: Object.values(byDate.find(b => b.key == c.categoryID)?.charges ?? {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0})
        }
    });
}

async function getCharges() {

    if(chargesStore.charges.length == 0)
        await db.collection('Charges').get()
            .then(response => {
                response.forEach(doc => {
                    state.charges.push({
                        chargeID: doc.id,
                        userID: doc.data().UserID,
                        amount: doc.data().Amount,
                        categoryID: doc.data().CategoryID,
                        date: doc.data().Date.seconds * 1000,
                    });

                    state.charges = state.charges.filter(charge => charge.userID == localStorage.getItem('UserID'));
                });

                chargesStore.set(state.charges);
            });
    else
        state.charges = chargesStore.charges;

    state.totalSpent = state.charges.reduce((acc, cur) => acc + cur.amount, 0);
    state.noData = state.totalSpent == 0;

    getPieSeries();
    getBarSeries();
}

let addToTotal = payload => {
    state.noData = false;
    payload.amount = parseFloat(payload.amount);

    let category = state.categories.find(category => payload.categoryID == category.categoryID);
    category.total += payload.amount;

    state.totalSpent += payload.amount;
    state.pieSeries = state.categories.flatMap(category => category.total);
    state.barSeries.find(col => col.name == category.description).data[new Date().getMonth()] += payload.amount;
};

onMounted(() => {
    getCategories();
    getCharges();
});
</script>

<template>
<q-page class="q-ma-sm q-my-md q-gutter-y-sm">
    <div class="forms container">
        <AddCharge @add="addToTotal"/>
    </div>

    <div class="indicador container">
        <div class="title text-primary prevent-selection">Gasto total</div>
        <div class="cantidad">{{ formatter(state.totalSpent) }}</div>
    </div>

    <div class="chart container prevent-selection" v-if="!state.noData">
        <h5 class="text-primary text-bold">Mes actual</h5>
        <PieChart uid="pie" :series="state.pieSeries" :formatter="formatter" v-if="state.renderCharts" />
    </div>

    <div class="chart container prevent-selection" v-if="!state.noData">
        <h5 class="text-primary text-bold">Desglose mensual</h5>
        <BarChart uid="bar" :series="state.barSeries" :formatter="formatter" v-if="state.renderCharts" />
    </div>

    <div class="no-data container flex flex-center column q-gutter-y-sm prevent-selection" v-if="state.noData">
        <q-icon name="sentiment_dissatisfied" size="4rem" color="primary"/>
        <h5 class="text-primary q-pb-md">No has registrado ningun gasto</h5>
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-fab color="primary" icon="keyboard_arrow_up" direction="up">
            <q-fab-action color="grey" to="/records" icon="manage_search" />
            <q-fab-action color="grey" @click="toggleTheme" icon="dark_mode" />
            <q-fab-action color="grey" @click="logOut" icon="logout" />
        </q-fab>
    </q-page-sticky>
</q-page>
</template>

<style lang="scss" scoped>
.indicador {
    display: flex;
    justify-content: space-between;
    font-size: 1.2rem;

    .title {
        font-weight: bold;
    }
}

.prevent-selection {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}
</style>
