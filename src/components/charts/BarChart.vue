<script setup>
import { onMounted, ref } from '@vue/runtime-core';

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

const options = ref({
    chart: {
        height: props.height,
        type: 'bar',
        background: 'transparent',
        stacked: true,
        toolbar: {
            show: false
        }
    },
    labels: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
    fill: {
        opacity: 0.7
    },
    plotOptions: {
        bar: {
            borderRadius: 5
        }
    },
    dataLabels: {
        enabled: false
    },
    theme: {
        mode: 'light'
    },
    colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'],
    xaxis: {
        tickAmount: 6
    },
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

onMounted(() => {
    options.value.theme.mode = document.body.classList.contains('body--dark') || localStorage.getItem('tema') == 1 ? 'dark' : 'light';
})
</script>

<template>
<div id="bar-chart-component">
    <apexchart
        :id="'chart-' + uid"
        type="bar"
        :options="options"
        :series="series"
        :height="height"
    />
</div>
</template>
