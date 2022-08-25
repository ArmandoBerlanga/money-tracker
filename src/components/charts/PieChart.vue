<script setup>
import { db } from 'boot/firebase';
import { onMounted, ref } from '@vue/runtime-core';
import { useCategorieStore } from 'stores/categorie-store.js';

const props = defineProps({
    uid: {
        type: String,
        required: true
    },
    series: {
        type: Array,
        required: true
    },
    height: {
        type: String,
        default: 'auto'
    },
    formatter: {
        type: Function,
        default: val => val
    }
});

const categoriesStore = useCategorieStore();

const options = ref({
    chart: {
        height: props.height,
        type: 'polarArea',
        background: 'transparent',
        toolbar: {
            show: false
        }
    },
    labels: [],
    fill: {
        opacity: 0.7
    },
    legend: {
        position: 'bottom'
    },
    theme: {
        mode: 'light',
    },
    colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'],
    yaxis: {
        labels: {
            formatter: val => "€" + val.toFixed(0)
        }
    },
    tooltip: {
        y: {
            formatter: props.formatter
        }
    },
});

onMounted(async () => {
    options.value.theme.mode = document.body.classList.contains('body--dark') || localStorage.getItem('tema') == 1 ? 'dark' : 'light';

    if(categoriesStore.categories.length != 0)
        options.value.labels = categoriesStore.getDescriptions;
    else
        await db.collection('Categories').get()
            .then(response => response.forEach(doc => options.value.labels.push(doc.data().Description)));
})
</script>

<template>
<div id="pie-chart-component">
    <apexchart
        :id="'chart-' + uid"
        type="polarArea"
        :options="options"
        :series="series"
        :height="height"
    />
</div>
</template>
