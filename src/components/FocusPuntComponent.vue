<template>
    <div class="focus-container" :ref="el => focusContainer = el as HTMLDivElement" :style="{ scale }">
        <div class="water-container" :style="{ height: `${focusPunt.watervoorraad}%`, opacity: scale-1 }">
            <div class="water-circle"></div>
        </div>
        <div class="focus-circle">
            <div class="focus-circle-active" :style="{ opacity: scale - 1 }"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FocusPunt } from '../objects/focus-punt'

export default defineComponent({
    name: 'FocusPuntComponent',
    props: {
        focusPunt: {
            type: Object as () => {
                pos: { x: number; y: number; z: number };
                watervoorraad: number;
                inFocus: boolean;
                isFocussing: number;
                startFocussing: () => void;
                stopFocussing: () => void;
                vulWater: (hoeveelheid: number) => void;
                gebruikWater: (hoeveelheid: number) => boolean;
            },
            required: true
        }
    },
    data() {
        return {
            animationFrameId: null as number | null,
            mousePosition: { x: 0, y: 0 },
            focusContainer: null as HTMLDivElement | null,
        }
    },
    computed: {
        scale() {
            return 1 + 2 * this.focusPunt.isFocussing/100
        }
    },
    mounted() {
        this.startMouseTracking()
        window.addEventListener('mousemove', this.updateMousePosition)
    },
    unmounted() {
        this.stopMouseTracking()
        window.removeEventListener('mousemove', this.updateMousePosition)
    },
    methods: {
        updateMousePosition(event: MouseEvent) {
            if (!this.focusContainer) return
            
            const rect = this.focusContainer.getBoundingClientRect()
            this.mousePosition = {
                x: event.clientX - rect.left - rect.width / 2,
                y: event.clientY - rect.top - rect.height / 2
            }
        },
        startMouseTracking() {
            const checkMouseInRadius = () => {
                const radius = 200 // Radius in pixels
                const distance = Math.sqrt(
                    Math.pow(this.mousePosition.x, 2) + 
                    Math.pow(this.mousePosition.y, 2)
                )
                
                if (distance <= radius) {
                    let multiplier = 1 
                    if (distance <= radius/2) {
                        multiplier = 5
                    } else if (distance <= radius/4) {
                        multiplier = 10
                    }

                    console.log(this.focusPunt);
                    this.focusPunt.isFocussing += multiplier * (1 - distance/100)
                } else {
                    this.focusPunt.stopFocussing()
                }
                
                this.animationFrameId = requestAnimationFrame(checkMouseInRadius)
            }
            
            this.animationFrameId = requestAnimationFrame(checkMouseInRadius)
        },
        stopMouseTracking() {
            if (this.animationFrameId !== null) {
                cancelAnimationFrame(this.animationFrameId)
                this.animationFrameId = null
            }
        }
    }
})
</script>

<style lang="scss" scoped>
.focus-container {
    position: relative;
    width: 50px;
    height: 50px;
}

.focus-circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 100%;
    background: #bfbfbf;
    z-index: 1;
}

.focus-circle-active {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 100%;
    background: #e5f7f9;
    bottom: 0;
    left: 0;
}

.water-container {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 2;
    bottom: 0;
}

.water-circle {
    position: absolute;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 100%;
    background: #95d8f9;
    bottom: 0;
    left: 0;
}
</style> 