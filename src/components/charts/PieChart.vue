<template>
<div id="pie-chart-component">
    <apexchart
        :id="'chart-' + uid"
        :class="state.carga ? '' : 'hide'"
        type="polarArea"
        :options="state.options"
        :series="series"
        :height="height">
    </apexchart>

    <q-spinner-dots :class="state.carga ? 'spinner-off' : 'spinner-absolute'" color="primary" size="10em" />
</div>
</template>

<script>
import { db } from 'boot/firebase';
import { reactive, onMounted } from '@vue/runtime-core';
import { useCategorieStore } from 'stores/categorie-store.js';

export default {
    name: 'PieChart',
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
                    formatter: val => "€" + val
                }
            },
            tooltip: {
                y: {
                    formatter: props.formatter
                }
            },
        };

        const categoriesStore = useCategorieStore();

        const state = reactive({
            carga: true,
            options
        });

        onMounted(async () => {
            state.options.theme.mode = document.body.classList.contains('dark-theme') || localStorage.getItem('tema') == 1 ? 'dark' : 'light';

            if(categoriesStore.categories.length != 0)
                state.options.labels = categoriesStore.getDescriptions;
            else {
                const response = await db.collection('Categories').get();
                response.forEach(doc => state.options.labels.push(doc.data().Description));
            }
        })

        return {
            state
        }
    }
}
</script>

<style lang="scss" scoped>
.hide {
    opacity: 0.3;
}

.spinner {
    &-off {
        display: none;
    }

    &-absolute {
        opacity: 1;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>
