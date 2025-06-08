import { gsap } from 'gsap';

interface Position {
    x: number;
    y: number;
    z: number;
}

// Type definitie voor de constructor opties
export interface FocusPuntOptions {
    pos?: Position;
    watervoorraad?: number;
}

// Type definitie voor een FocusPunt object
export interface IFocusPunt {
    pos: Position;
    watervoorraad: number;
    inFocus: boolean;
    isFocussing: number;
    stopFocussing(): void;
    vulWater(hoeveelheid: number): void;
    gebruikWater(hoeveelheid: number): boolean;
}

export class FocusPunt implements IFocusPunt {
    private _pos: Position;
    private _watervoorraad: number;
    private _inFocus: boolean;
    private _isFocussing: number;
    private _focussingTween?: gsap.core.Tween;
    private _waterTween?: gsap.core.Tween;

    constructor(options: {pos?: Position, watervoorraad?: number}) {
        this._pos = options.pos || { x: 0, y: 0, z: 0 };
        this._watervoorraad = options.watervoorraad || 100;
        this._inFocus = false;
        this._isFocussing = 0;

        // Zorg dat de watervoorraad niet boven 100 komt
        if (this._watervoorraad > 100) {
            this._watervoorraad = 100;
        }
    }

    // Getters
    get pos(): Position { return this._pos; }
    get watervoorraad(): number { return this._watervoorraad; }
    get inFocus(): boolean { return this._inFocus; }
    get isFocussing(): number { return this._isFocussing; }

    // Setters
    set pos(pos: Position) {
        this._pos = pos;
    }

    set watervoorraad(waarde: number) {
        this._watervoorraad = Math.max(0, Math.min(waarde, 100));
    }

    set inFocus(status: boolean) {
        this._inFocus = status;
        if (!status) {
            this.stopFocussing();
        }
    }

    set isFocussing(waarde: number) {
        this._isFocussing = Math.max(0, Math.min(waarde, 100));

        if (this._isFocussing === 100) {
            this._inFocus = true;
        }
    }
    
    /**
     * Stop het focussing proces
     * Dit zal de isFocussing waarde snel terug laten lopen naar 0
     */
    public stopFocussing(): void {
        if (this._focussingTween) {
            this._focussingTween.kill();
        }

        // Bereken de duur op basis van de huidige waarde
        // Hoe hoger de waarde, hoe sneller het terugloopt
        const duration = 0.5 * (this._isFocussing / 100);

        this._focussingTween = gsap.to(this, {
            _isFocussing: 0,
            duration: duration,
            ease: "power2.out",
            onUpdate: () => {
                this.isFocussing = this._isFocussing;
            },
            onComplete: () => {
                this._inFocus = false;
            }
        });
    }

    /**
     * Vul de watervoorraad aan
     * @param hoeveelheid Hoeveelheid water om toe te voegen (0-100)
     */
    public vulWater(hoeveelheid: number): void {
        // Stop eventuele bestaande water animatie
        if (this._waterTween) {
            this._waterTween.kill();
        }

        const nieuweWaarde = Math.min(100, this._watervoorraad + hoeveelheid);
        
        this._waterTween = gsap.to(this, {
            _watervoorraad: nieuweWaarde,
            duration: 1.28,
            ease: "power1.inOut",
            onUpdate: () => {
                this.watervoorraad = this._watervoorraad;
            }
        });
    }

    /**
     * Gebruik water uit de voorraad
     * @param hoeveelheid Hoeveelheid water om te gebruiken (0-100)
     * @returns boolean of het gebruik succesvol was
     */
    public gebruikWater(hoeveelheid: number): boolean {
        if (this._watervoorraad < hoeveelheid) {
            return false;
        }

        // Stop eventuele bestaande water animatie
        if (this._waterTween) {
            this._waterTween.kill();
        }

        const nieuweWaarde = Math.max(0, this._watervoorraad - hoeveelheid);
        
        this._waterTween = gsap.to(this, {
            _watervoorraad: nieuweWaarde,
            duration: 1.28,
            ease: "power1.inOut",
            onUpdate: () => {
                this.watervoorraad = this._watervoorraad;
            },
            onComplete: () => {
                this.watervoorraad = nieuweWaarde;
            }
        });

        return true;
    }
} 