<template>
    <div class="options-overview">
        <header class="title">
            <h1>Focus punten</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1">
                <div class="focus-punten-container">
                    <div v-for="(punt, index) in focusPunten" 
                         :key="index"
                         class="focus-punt-wrapper"
                         :style="getPuntStyle(index)">
                        <div class="focus-punt-label">{{ getPuntLabel(index) }}</div>
                        <FocusPuntComponent 
                            :focus-punt="punt"
                        />
                    </div>
                </div>
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Focus punten overzicht">
                    <div v-for="(punt, index) in focusPunten" 
                         :key="index"
                         class="focus-punt-option"
                         @click="actiefFocusPuntIndex = index">
                        <div class="focus-punt-header">
                            <span class="focus-punt-label">{{ getPuntLabel(index) }}</span>
                            <span class="focus-status" :class="{ 'in-focus': punt.inFocus }">
                                {{ punt.inFocus ? 'In focus' : 'Niet in focus' }}
                            </span>
                        </div>
                        <div class="focus-punt-details">
                            <div class="detail">
                                <label>Focussing:</label>
                                <span>{{ punt.isFocussing }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>

<script lang="ts">
import { defineComponent, CSSProperties } from "vue"
import _ from "lodash"
import { FocusPunt } from "../objects/focus-punt"
import FocusPuntComponent from "../components/focus-punt-component.vue"

interface Options {
    test: string
}

export default defineComponent({ 
    components: {
        FocusPuntComponent
    },
    data() {
        // Maak 3 focus punten in een cirkel
        const focusPunten = [
            new FocusPunt({pos:{ x: 0, y: 0, z: 0 }, watervoorraad: Math.floor(Math.random() * 50) + 75}),
            new FocusPunt({pos:{ x: 0, y: 0, z: 0 }, watervoorraad: Math.floor(Math.random() * 25) + 50}),
            new FocusPunt({pos:{ x: 0, y: 0, z: 0 }, watervoorraad: Math.floor(Math.random() * 50) + 50})
        ]
        return {
            options: {
                test: "",
            } as Partial<Options>,
            ignoreOptionsUpdate: true,
            focusPunten,
            actiefFocusPuntIndex: 0,
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
        getActiefPunt() {
            return this.focusPunten[this.actiefFocusPuntIndex]
        },
        getPuntStyle(index: number): CSSProperties {
            // Bereken positie in een cirkel
            const radius = 150 // pixels vanaf het midden
            const angle = (index * (2 * Math.PI / 3)) - (Math.PI / 2) // Start vanaf boven
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            
            return {
                position: 'absolute' as const,
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)'
            }
        },
        getPuntLabel(index: number) {
            return String.fromCharCode(65 + index) // A, B, C
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

.focus-punten-container {
    position: relative;
    width: 100%;
    height: 100%;
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