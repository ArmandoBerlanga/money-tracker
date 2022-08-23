<template>
<div id="bar-chart-component">
    <apexchart
        :id="'chart-' + uid"
        :class="state.carga ? '' : 'hide'"
        type="bar"
        :options="state.options"
        :series="series"
        :height="height"
    >
    </apexchart>

    <q-spinner-dots :class="state.carga ? 'spinner-off' : 'spinner-absolute'" color="primary" size="10em" />
</div>
</template>

<script>
import { reactive, onMounted } from '@vue/runtime-core';

export default {
    name: 'Barras',
    props: {
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
    },
    setup(props) {
        const options = {
            chart: {
                height: props.height,
                type: 'bar',
                background: 'transparent',
                stacked: true,
                toolbar: {
                    show: false
                },
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
                enabled: false,
            },
            theme: {
                mode: 'light',
            },
            colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'],
            xaxis: {
                tickAmount: 6,
            },
            yaxis: {
                labels: {
                    formatter: val => "€" + val.toFixed(0),
                }
            },
            tooltip: {
                y: {
                    formatter: props.formatter
                }
            },
        };

        const state = reactive({
            carga: true,
            options
        });

        onMounted(() => {
            state.options.theme.mode = document.body.classList.contains('dark-theme') || localStorage.getItem('tema') == 1 ? 'dark' : 'light';
        })

        return {
            state
        }
    }
}
</script>

<style lang="scss" scoped>
.hide{
    opacity: 0.3;
}

.spinner{
    &-off{
        display: none;
    }

    &-absolute{
        opacity: 1;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>
