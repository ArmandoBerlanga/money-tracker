<script setup>
import { db } from 'boot/firebase';
import AddSpent from 'components/AddSpent.vue';
import PieChart from 'components/charts/PieChart.vue';
import BarChart from 'components/charts/BarChart.vue';
import { nextTick, reactive } from '@vue/runtime-core';
import { useChargeStore } from 'stores/charge-store.js';
import { useCategorieStore } from 'stores/categorie-store.js';

const chargesStore = useChargeStore();
const categoriesStore = useCategorieStore();

const state = reactive({
    categories: [],
    charges: [],
    pieSeries:[],
    barSeries: [],
    totalSpent: 0,
    renderCharts: true
});

let formatter = number => '€' + Number(parseFloat(number).toFixed(2)).toLocaleString("es-MX", {
    minimumFractionDigits: 2
}) + ' EUR';

const forceRerender = async () => {
    state.renderCharts = false;
    await nextTick();
    state.renderCharts = true;
};

let toggleTheme = () => {
    document.body.classList.toggle('dark-theme')
    forceRerender();
};

let getCategories = async () => {

    if(categoriesStore.categories.length != 0){
        state.categories = categoriesStore.categories;
        return;
    }

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
        })
}

let getCharges = async () =>{

    if(chargesStore.charges.length == 0)
        await db.collection('Charges').get()
            .then(response => {
                response.forEach(doc => {
                    state.charges.push({
                        chargeID: doc.id,
                        amount: doc.data().Amount,
                        categoryID: doc.data().CategoryID,
                        date: doc.data().Date.seconds * 1000,
                    })
                });

                chargesStore.set(state.charges);
            });
    else
        state.charges = chargesStore.charges;

    state.totalSpent = state.charges.reduce((acc, cur) => acc + cur.amount, 0);

    // Manipulación de datos para el gráfico de PIE
    state.charges.forEach(charge => {
        let today = new Date();
        let chargeDate = new Date(charge.date);

        if(today.getMonth() == chargeDate.getMonth())
            state.categories.find(category => charge.categoryID == category.categoryID).total += charge.amount;
    });

    state.pieSeries = state.categories.flatMap(category => category.total);

    // Manipulación de datos para el gráfico de BARRAS
    let byCategory = state.charges.reduce((acc, charge) => {
        if(!acc[charge.categoryID])
            acc[charge.categoryID] = [];
        acc[charge.categoryID].push(charge);

        return acc;
    }, {});

    Object.keys(byCategory).forEach(key => {
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

        state.barSeries.push({
            name: state.categories.find(category => category.categoryID == key).description,
            data: Object.values(charges)
        });
    });
}

let addToTotal = payload => {
    payload.amount = parseFloat(payload.amount);
    state.totalSpent += payload.amount;

    let category = state.categories.find(category => payload.categoryID == category.categoryID);
    category.total += payload.amount;

    state.pieSeries = state.categories.flatMap(category => category.total);
    let col = state.barSeries.find(col => col.name == category.description);
    if(col)
        col.data[new Date().getMonth()] += payload.amount;
    else{
        let series = [];
        series[new Date().getMonth()] = payload.amount;

        for(let i = 0; i < 12; i++)
            if(!series[i]) series[i] = 0;

        state.barSeries.push({
            name: category.description,
            data: series
        });
    }
};

// --

getCategories();
getCharges();
</script>

<template>
<q-page class="q-ma-sm q-my-md q-gutter-y-sm">
    <div class="forms container">
        <AddSpent @add="addToTotal"/>
    </div>

    <div class="indicador container" v-if="true">
        <div class="title text-primary">Gasto total</div>
        <div class="cantidad">{{ formatter(state.totalSpent) }}</div>
    </div>

    <div class="chart container prevent-selection">
        <h5 class="text-primary text-bold">Mes actual</h5>
        <PieChart uid="pie" :series="state.pieSeries" :formatter="formatter" v-if="state.renderCharts" />
    </div>

    <div class="chart container prevent-selection">
        <h5 class="text-primary text-bold">Desglose mensual</h5>
        <BarChart uid="bar" :series="state.barSeries" :formatter="formatter" v-if="state.renderCharts" />
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-fab color="primary" icon="keyboard_arrow_up" direction="up">
            <q-fab-action color="grey" icon="settings" />
            <q-fab-action color="grey" @click="toggleTheme" icon="dark_mode" />
        </q-fab>
    </q-page-sticky>
</q-page>
</template>

<style lang="scss" scoped>
h5 {
    margin: 0;
    padding: 0;
    font-size: 1.2rem;
}

.container {
    background-color: #f4f4f9;
    border-radius: 0.5rem;
    padding: 0.7rem;
}

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
