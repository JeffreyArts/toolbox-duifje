<template>
    <div class="focus-container" :ref="el => focusContainer = el as HTMLDivElement" :style="{ scale }">
        <div class="water-container" :style="{ height: `${waterpunt.watervoorraad}%`, opacity: scale-1 }">
            <div class="water-circle"></div>
        </div>
        <div class="focus-circle">
            <div class="focus-circle-active" :style="{ opacity: scale - 1 }"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IWaterpunt } from '../objects/waterpunt'

export default defineComponent({
    name: 'WaterpuntComponent',
    props: {
        waterpunt: {
            type: Object as PropType<IWaterpunt>,
            required: true
        },
        static: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data() {
        return {
            animationFrameId: null as number | null,
            mousePosition: { x: 200, y: 200 },
            focusContainer: null as HTMLDivElement | null,
        }
    },
    watch: {
        static: {
            handler() {
                if (this.static) {
                    this.stopMouseTracking()
                    window.removeEventListener('mousemove', this.updateMousePosition)
                    this.waterpunt.isFocussing = 100
                } else {
                    this.startMouseTracking()
                    window.addEventListener('mousemove', this.updateMousePosition)
                }
            },
            immediate: true
        }
    },
    computed: {
        scale() {
            return 1 + 2 * this.waterpunt.isFocussing/100
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
                if (!this.static) {
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

                        this.waterpunt.isFocussing += multiplier * (1 - distance/100)
                    } else {
                        this.waterpunt.stopFocussing()
                    }
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
            this.waterpunt.stopFocussing()
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