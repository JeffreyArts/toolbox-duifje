<template>
    <div class="options-overview">
        <header class="title">
            <h1>Weersysteem</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1" :class="[
                options.weerType === 'regen' ? '__isRegen' : '',
                options.weerType === 'zon' ? '__isZon' : '',
            ]">
            </div>
            <WaterpuntComponent class="waterpunt" :waterpunt="waterpunt" :static="true" />

            <div class="countdown">
                {{ countDown }}
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Weersysteem">
                    <div class="option">
                        <label for="weerType">Weertype</label>
                        <select id="weerType" v-model="options.weerType">
                            <option value="regen">Regen</option>
                            <option value="normaal">Normaal</option>
                            <option value="zon">Zon</option>
                        </select>
                    </div>
                    <div class="option">
                        <label for="interval">Auto change (seconden)</label>
                        <input type="number" id="interval" step="0.1" v-model="options.wisselInterval" />
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>

<script lang="ts">
import { defineComponent, CSSProperties } from "vue"
import _ from "lodash"
import { Waterpunt } from "../objects/waterpunt"
import WaterpuntComponent from "../components/waterpunt-component.vue"

interface Options {
    wisselInterval: number;
    weerType: "normaal" | "regen" | "zon";
}

export default defineComponent({ 
    components: {
        WaterpuntComponent
    },
    data() {
        return {
            options: {
                weerType: "normaal" as "normaal" | "regen" | "zon",
                wisselInterval: 30,
            } as Partial<Options>,
            countDown: 0,
            autoUpdateWeerInterval: null as number | null,
            countDownInterval: null as number | null,
            ignoreOptionsUpdate: true,
            waterpunt: new Waterpunt({pos:{ x: 0, y: 0, z: 0 }, watervoorraad: Math.floor(Math.random() * 50) + 75}),
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
        "options.wisselInterval": {
            handler() {
                if (!this.options.wisselInterval) {
                    return
                }
                this.autoUpdateWeer()   
            }
        }
    },
    mounted() {
        this.loadOptions()
        setInterval(() => {
            this.updateWeer()
        }, 1000)

        if (!this.options.wisselInterval) {
            this.options.wisselInterval = 30
        }

        this.autoUpdateWeer()
        
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
        autoUpdateWeer() {

            if (this.autoUpdateWeerInterval) {
                clearInterval(this.autoUpdateWeerInterval)
            }
            if (this.countDownInterval) {
                clearInterval(this.countDownInterval)
            }

            this.countDown = this.options.wisselInterval || 30
            this.countDownInterval = setInterval(() => {
                this.countDown = Math.round((this.countDown - 0.1) * 10) / 10
            }, 100) as unknown as number



            this.autoUpdateWeerInterval = setInterval(() => {
                console.log("autoUpdateWeer")
                const chance = Math.round(Math.random() + 0.25)
                console.log(chance)
                if (chance) {
                    const changeWeertype = Math.round(Math.random())
                    
                    if (this.options.weerType === "normaal") {
                        if (changeWeertype) {
                            this.options.weerType = "zon"
                        } else {
                            this.options.weerType = "regen"
                        }
                    } else if (this.options.weerType === "regen") {
                        this.options.weerType = "normaal"
                    } else if (this.options.weerType === "zon") {
                        this.options.weerType = "normaal"
                    }
                }
                this.autoUpdateWeer()
            }, this.countDown * 1000) as unknown as number
        },
        updateWeer() {
            if (this.options.weerType === "normaal") {
                this.waterpunt.gebruikWater(.5)
            } else if (this.options.weerType === "regen") {
                this.waterpunt.vulWater(2)
            } else if (this.options.weerType === "zon") {
                this.waterpunt.gebruikWater(2)
            }
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
        transition: all 2s ease;

        &.__isRegen {
            filter: blur(1px)  grayscale(50%);
        }

        &.__isZon {
            filter: saturate(4) hue-rotate(8deg);
        }
    }

    .waterpunt {
        position: absolute;
        top: calc(50%);
        left: calc(50% - 32px);
    }
}

.option {
    margin-bottom: 1rem;
    
    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }
    
    select,
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
.countdown {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 8px;
    font-family: Fixedsys;
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

.focus-punt-wrapper {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    
    .focus-punt-label {
        background: var(--accent-color);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-weight: bold;
        font-size: 0.875rem;
    }
}

.focus-punt-option {
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: #f5f5f5;
    }
    
    .focus-punt-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        
        .focus-punt-label {
            font-weight: bold;
            font-size: 1.1rem;
        }
        
        .focus-status {
            font-size: 0.875rem;
            padding: 0.25rem 0.5rem;
            // border-radius: 4px;
            background-color: transparent;
            
            &.in-focus {
                background-color: var(--accent-color);
                color: #fff;
            }
        }
    }
    
    .focus-punt-details {
        font-size: 0.875rem;
        
        .detail {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.25rem;
            
            label {
                color: #666;
            }
        }
    }
}
</style> 