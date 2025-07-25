"use strict";

/**
 * AnimationEngine - Handles window animations and effects with GPU acceleration
 */
class AnimationEngine {
    constructor() {
        this.animationDuration = 300;
        this.closeDuration = 200;
        this.focusDuration = 150;
        this.activeAnimations = new Map();
        
        // Initialize CSS keyframes
        this.initializeKeyframes();
    }

    /**
     * Initialize CSS keyframes for GPU-accelerated animations
     */
    initializeKeyframes() {
        if (!document.getElementById('animation-keyframes')) {
            const style = document.createElement('style');
            style.id = 'animation-keyframes';
            style.textContent = this.generateKeyframes();
            document.head.appendChild(style);
        }
    }

    /**
     * Generate CSS keyframes for all animation types
     */
    generateKeyframes() {
        return `
            @keyframes windowSlideIn {
                0% {
                    opacity: 0;
                    transform: scale(0.8) translateY(20px) translateZ(0);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) translateY(0) translateZ(0);
                }
            }

            @keyframes windowSlideOut {
                0% {
                    opacity: 1;
                    transform: scale(1) translateY(0) translateZ(0);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.8) translateY(-20px) translateZ(0);
                }
            }

            @keyframes windowFocusIn {
                0% {
                    transform: scale(1) translateZ(0);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
                    border-color: rgba(23, 147, 209, 0.3);
                }
                100% {
                    transform: scale(1.02) translateZ(0);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(23, 147, 209, 0.3);
                    border-color: rgba(23, 147, 209, 0.6);
                }
            }

            @keyframes windowFocusOut {
                0% {
                    transform: scale(1.02) translateZ(0);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(23, 147, 209, 0.3);
                    border-color: rgba(23, 147, 209, 0.6);
                }
                100% {
                    transform: scale(1) translateZ(0);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
                    border-color: rgba(23, 147, 209, 0.3);
                }
            }

            @keyframes windowMinimize {
                0% {
                    opacity: 1;
                    transform: scale(1) translateZ(0);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.1) translateZ(0);
                }
            }

            @keyframes windowRestore {
                0% {
                    opacity: 0;
                    transform: scale(0.1) translateZ(0);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) translateZ(0);
                }
            }

            /* GPU acceleration classes */
            .gpu-accelerated {
                will-change: transform, opacity, box-shadow;
                backface-visibility: hidden;
                perspective: 1000px;
                transform-style: preserve-3d;
            }
        `;
    }

    /**
     * Animate window opening with GPU acceleration
     */
    animateWindowOpen(windowElement, options = {}) {
        return new Promise((resolve) => {
            const animationId = `open-${Date.now()}`;
            
            // Cancel any existing animation on this element
            this.cancelAnimation(windowElement);
            
            // Apply GPU acceleration
            windowElement.classList.add('gpu-accelerated');
            
            // Set initial state
            windowElement.style.animation = `windowSlideIn ${this.animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            
            // Store animation reference
            this.activeAnimations.set(windowElement, animationId);
            
            const handleAnimationEnd = () => {
                windowElement.style.animation = '';
                windowElement.removeEventListener('animationend', handleAnimationEnd);
                this.activeAnimations.delete(windowElement);
                resolve();
            };
            
            windowElement.addEventListener('animationend', handleAnimationEnd);
            
            // Fallback timeout
            setTimeout(() => {
                if (this.activeAnimations.get(windowElement) === animationId) {
                    handleAnimationEnd();
                }
            }, this.animationDuration + 50);
        });
    }

    /**
     * Animate window closing with GPU acceleration
     */
    animateWindowClose(windowElement, callback) {
        return new Promise((resolve) => {
            const animationId = `close-${Date.now()}`;
            
            // Cancel any existing animation on this element
            this.cancelAnimation(windowElement);
            
            // Apply GPU acceleration
            windowElement.classList.add('gpu-accelerated');
            
            // Set animation
            windowElement.style.animation = `windowSlideOut ${this.closeDuration}ms cubic-bezier(0.55, 0.055, 0.675, 0.19)`;
            
            // Store animation reference
            this.activeAnimations.set(windowElement, animationId);
            
            const handleAnimationEnd = () => {
                windowElement.style.animation = '';
                windowElement.classList.remove('gpu-accelerated');
                windowElement.removeEventListener('animationend', handleAnimationEnd);
                this.activeAnimations.delete(windowElement);
                
                if (callback) callback();
                resolve();
            };
            
            windowElement.addEventListener('animationend', handleAnimationEnd);
            
            // Fallback timeout
            setTimeout(() => {
                if (this.activeAnimations.get(windowElement) === animationId) {
                    handleAnimationEnd();
                }
            }, this.closeDuration + 50);
        });
    }

    /**
     * Animate window focus with subtle scale and glow effect
     */
    animateWindowFocus(windowElement) {
        return new Promise((resolve) => {
            const animationId = `focus-${Date.now()}`;
            
            // Cancel any existing animation on this element
            this.cancelAnimation(windowElement);
            
            // Apply GPU acceleration
            windowElement.classList.add('gpu-accelerated');
            
            // Set animation
            windowElement.style.animation = `windowFocusIn ${this.focusDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
            
            // Store animation reference
            this.activeAnimations.set(windowElement, animationId);
            
            const handleAnimationEnd = () => {
                windowElement.removeEventListener('animationend', handleAnimationEnd);
                this.activeAnimations.delete(windowElement);
                resolve();
            };
            
            windowElement.addEventListener('animationend', handleAnimationEnd);
            
            // Fallback timeout
            setTimeout(() => {
                if (this.activeAnimations.get(windowElement) === animationId) {
                    handleAnimationEnd();
                }
            }, this.focusDuration + 50);
        });
    }

    /**
     * Animate window blur (unfocus) effect
     */
    animateWindowBlur(windowElement) {
        return new Promise((resolve) => {
            const animationId = `blur-${Date.now()}`;
            
            // Cancel any existing animation on this element
            this.cancelAnimation(windowElement);
            
            // Apply GPU acceleration
            windowElement.classList.add('gpu-accelerated');
            
            // Set animation
            windowElement.style.animation = `windowFocusOut ${this.focusDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
            
            // Store animation reference
            this.activeAnimations.set(windowElement, animationId);
            
            const handleAnimationEnd = () => {
                windowElement.style.animation = '';
                windowElement.removeEventListener('animationend', handleAnimationEnd);
                this.activeAnimations.delete(windowElement);
                resolve();
            };
            
            windowElement.addEventListener('animationend', handleAnimationEnd);
            
            // Fallback timeout
            setTimeout(() => {
                if (this.activeAnimations.get(windowElement) === animationId) {
                    handleAnimationEnd();
                }
            }, this.focusDuration + 50);
        });
    }

    /**
     * Animate window minimize with scale down effect
     */
    animateWindowMinimize(windowElement, callback) {
        return new Promise((resolve) => {
            const animationId = `minimize-${Date.now()}`;
            
            // Cancel any existing animation on this element
            this.cancelAnimation(windowElement);
            
            // Apply GPU acceleration
            windowElement.classList.add('gpu-accelerated');
            
            // Set animation
            windowElement.style.animation = `windowMinimize ${this.animationDuration}ms cubic-bezier(0.55, 0.055, 0.675, 0.19)`;
            
            // Store animation reference
            this.activeAnimations.set(windowElement, animationId);
            
            const handleAnimationEnd = () => {
                windowElement.style.display = 'none';
                windowElement.style.animation = '';
                windowElement.classList.remove('gpu-accelerated');
                windowElement.removeEventListener('animationend', handleAnimationEnd);
                this.activeAnimations.delete(windowElement);
                
                if (callback) callback();
                resolve();
            };
            
            windowElement.addEventListener('animationend', handleAnimationEnd);
            
            // Fallback timeout
            setTimeout(() => {
                if (this.activeAnimations.get(windowElement) === animationId) {
                    handleAnimationEnd();
                }
            }, this.animationDuration + 50);
        });
    }

    /**
     * Animate window restore from minimized state
     */
    animateWindowRestore(windowElement) {
        return new Promise((resolve) => {
            const animationId = `restore-${Date.now()}`;
            
            // Cancel any existing animation on this element
            this.cancelAnimation(windowElement);
            
            // Show window and apply GPU acceleration
            windowElement.style.display = 'flex';
            windowElement.classList.add('gpu-accelerated');
            
            // Set animation
            windowElement.style.animation = `windowRestore ${this.animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            
            // Store animation reference
            this.activeAnimations.set(windowElement, animationId);
            
            const handleAnimationEnd = () => {
                windowElement.style.animation = '';
                windowElement.removeEventListener('animationend', handleAnimationEnd);
                this.activeAnimations.delete(windowElement);
                resolve();
            };
            
            windowElement.addEventListener('animationend', handleAnimationEnd);
            
            // Fallback timeout
            setTimeout(() => {
                if (this.activeAnimations.get(windowElement) === animationId) {
                    handleAnimationEnd();
                }
            }, this.animationDuration + 50);
        });
    }

    /**
     * Cancel any active animation on an element
     */
    cancelAnimation(windowElement) {
        if (this.activeAnimations.has(windowElement)) {
            windowElement.style.animation = '';
            windowElement.classList.remove('gpu-accelerated');
            this.activeAnimations.delete(windowElement);
        }
    }

    /**
     * Create custom keyframes for specific animation types
     */
    createKeyframes(type, options = {}) {
        const keyframes = {
            slideIn: {
                from: {
                    opacity: 0,
                    transform: `scale(${options.fromScale || 0.8}) translateY(${options.fromY || 20}px) translateZ(0)`
                },
                to: {
                    opacity: 1,
                    transform: 'scale(1) translateY(0) translateZ(0)'
                }
            },
            slideOut: {
                from: {
                    opacity: 1,
                    transform: 'scale(1) translateY(0) translateZ(0)'
                },
                to: {
                    opacity: 0,
                    transform: `scale(${options.toScale || 0.8}) translateY(${options.toY || -20}px) translateZ(0)`
                }
            },
            focus: {
                from: {
                    transform: 'scale(1) translateZ(0)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                    borderColor: 'rgba(23, 147, 209, 0.3)'
                },
                to: {
                    transform: `scale(${options.focusScale || 1.02}) translateZ(0)`,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(23, 147, 209, 0.3)',
                    borderColor: 'rgba(23, 147, 209, 0.6)'
                }
            },
            blur: {
                from: {
                    transform: `scale(${options.focusScale || 1.02}) translateZ(0)`,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(23, 147, 209, 0.3)',
                    borderColor: 'rgba(23, 147, 209, 0.6)'
                },
                to: {
                    transform: 'scale(1) translateZ(0)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                    borderColor: 'rgba(23, 147, 209, 0.3)'
                }
            }
        };

        return keyframes[type] || keyframes.slideIn;
    }

    /**
     * Get performance metrics for animations
     */
    getPerformanceMetrics() {
        return {
            activeAnimations: this.activeAnimations.size,
            animationDuration: this.animationDuration,
            closeDuration: this.closeDuration,
            focusDuration: this.focusDuration,
            gpuAcceleration: true
        };
    }

    /**
     * Cleanup all animations and resources
     */
    cleanup() {
        // Cancel all active animations
        for (const [element] of this.activeAnimations) {
            this.cancelAnimation(element);
        }
        
        // Remove keyframes style element
        const keyframesStyle = document.getElementById('animation-keyframes');
        if (keyframesStyle) {
            keyframesStyle.remove();
        }
    }
}