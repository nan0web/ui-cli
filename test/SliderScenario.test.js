import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Slider } from '../src/index.js' // Public component

describe('Slider Component Logic (High-End Unit Test)', () => {
    
    it('should correctly increment/decrement in Fine (±1) and Coarse (±10%) modes', async () => {
        // We can't easily test direct UI in JSDOM-less env, but we can test the Prompt class if exported.
        // Since we want to ensure the USER sees it working, let's verify the Slider utility parameters.
        
        const { slider } = await import('../src/ui/slider.js');
        // We will mock process.stdin.isTTY if needed, but here we just test methods on instance.
        
        // Actually, let's look at the class SliderPrompt
        const { SliderPrompt } = await import('../src/ui/slider.js');
        
        const p = new SliderPrompt({ 
            message: 'Test', 
            initial: 50, 
            min: 0, 
            max: 100, 
            jump: 10 
        });
        
        // 1. Check Initial
        assert.equal(p.value, 50, 'Initially should be 50');

        // 2. Fine steps (Left/Right)
        p.right(); // +1
        assert.equal(p.value, 51, 'Right should increment by 1');
        p.left(); // -1
        assert.equal(p.value, 50, 'Left should decrement by 1');

        // 3. Coarse jumps (Up/Down)
        p.up(); // +10
        assert.equal(p.value, 60, 'Up should increment by jump (10)');
        p.down(); // -10
        assert.equal(p.value, 50, 'Down should decrement by jump (10)');

        // 4. Boundaries
        p.value = 95;
        p.up(); // 95 + 10 = 105 -> capped at 100
        assert.equal(p.value, 100, 'Should respect max boundary');
        
        p.value = 5;
        p.down(); // 5 - 10 = -5 -> capped at 0
        assert.equal(p.value, 0, 'Should respect min boundary');
    })

    it('should have a relaxed typing timeout (3s)', async () => {
        const { SliderPrompt } = await import('../src/ui/slider.js');
        const p = new SliderPrompt({ message: 'T', initial: 10 });
        
        const now = Date.now();
        p.lastHit = now - 2000; // 2 seconds ago
        p.typed = '7';
        
        // Key '3' arrives
        p._('3', { name: '3' });
        
        assert.equal(p.value, 73, 'Should combine 7 and 3 within 3s timeout');

        p.lastHit = now - 4000; // 4 seconds ago -> timeout!
        p._('5', { name: '5' });
        assert.equal(p.value, 5, 'Should reset typed buffer after 3s timeout');
    })
})
