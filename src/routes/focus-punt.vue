<template>
    <div class="options-overview">
        <header class="title">
            <h1>Focus punt</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1">
                <WaterpuntComponent :waterpunt="waterpunt" />
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Waterpunt status">
                    <div class="option">
                        <label for="watervoorraad">Watervoorraad</label>
                        <input type="number" id="watervoorraad" v-model="waterpunt.watervoorraad" disabled />
                    </div>
                    <div class="option">
                        <p>In focus: {{ waterpunt.inFocus ? 'Ja' : 'Nee' }}</p>
                    </div>
                    <div class="option">
                        <label for="is-focussing">Focussing</label>
                        <input type="number" id="is-focussing" v-model="waterpunt.isFocussing" disabled />
                    </div>
                </div>

                <div class="option-group" name="Water beheer">
                    <div class="option water-control">
                        <label for="water-amount">Water hoeveelheid</label>
                        <div class="input-group">
                            <input type="number" id="water-amount" v-model="waterAmount" min="0" max="100" />
                            <button class="button" @click="vulWater">Vul water</button>
                        </div>
                    </div>
                    <div class="option water-control">
                        <label for="water-usage">Water gebruik</label>
                        <div class="input-group">
                            <input type="number" id="water-usage" v-model="waterUsage" min="0" max="100" />
                            <button class="button" @click="gebruikWater">Gebruik water</button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import _ from "lodash"
import { Waterpunt } from "../objects/waterpunt"
import WaterpuntComponent from "../components/waterpunt-component.vue"

interface Options {
    test: string
}

export default defineComponent({ 
    components: {
        WaterpuntComponent
    },
    props: [],
    data() {
        const waterpunt = new Waterpunt({pos:{ x: 0, y: 0, z: 0 }, watervoorraad: Math.floor(Math.random() * 50) + 75})
        return {
            options: {
                test: "",
            } as Partial<Options>,
            ignoreOptionsUpdate: true,
            waterpunt,
            waterAmount: 25,
            waterUsage: 25,
        }
    },
    watch: {
        "options": {
            handler(){
                if (this.ignoreOptionsUpdate) {
                    return
                }
                
                let newOptions = {} as any
                const localStorageOptions = localStorage.getItem("options")
                if (localStorageOptions) {
                    newOptions = _.cloneDeep(JSON.parse(localStorageOptions))
                }
                _.forOwn(this.options, (value, key) => {
                    if (_.isArray(value)) {
                        newOptions[key] = [...value]
                    } else if (_.isObject(value)) {
                        if (!_.isObject(newOptions[key])) {
                            newOptions[key] = {}
                        }
                        _.forOwn(value, (v, k) => {
                            newOptions[key][k] = v
                        })
                    } else {
                        newOptions[key] = value
                    }
                })
                localStorage.setItem("options", JSON.stringify(newOptions))
            },
            deep: true
        },
    },
    mounted() {
        this.loadOptions()
    },
    methods: {
        loadOptions() {
            this.ignoreOptionsUpdate = true
            const optionsString = localStorage.getItem("options")
            if (optionsString) {
                const localOptions = JSON.parse(optionsString)
                _.forOwn(this.options, (value,key) => {
                    const typedKey = key as keyof Options
                    if (localOptions[typedKey]) {
                        this.options[typedKey] = localOptions[key]
                    }
                })
            }
            setTimeout(() => {
                this.ignoreOptionsUpdate = false
            })
        },
        resetOptions(e:Event) {
            e.preventDefault()
            this.options = {
                test: "",
            }
        },
        vulWater() {
            this.waterpunt.vulWater(this.waterAmount);
        },
        gebruikWater() {
            const success = this.waterpunt.gebruikWater(this.waterUsage);
        }
    }
})
</script>

<style lang="scss" scoped>
.viewport {
    position: relative;
    
    .viewport-content {
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: url('/birdview.jpg');
        background-size: cover;
        background-position: center;
    }
}

.water-control {
    .input-group {
        display: flex;
        gap: 0.5rem;
        
        input {
            flex: 1;
        }
        
        .button {
            white-space: nowrap;
        }
    }
}

.option {
    margin-bottom: 1rem;
    
    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }
    
    input[type="number"],
    input[type="text"] {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        
        &:disabled {
            background-color: #f5f5f5;
            cursor: not-allowed;
        }
    }
    
    input[type="checkbox"] {
        margin-right: 0.5rem;
    }
}

.button {
    padding: 0.5rem 1rem;
    background-color: var(--accent-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: color-mix(in srgb, var(--accent-color) 95%, black);
    }
    
    &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
}
</style>