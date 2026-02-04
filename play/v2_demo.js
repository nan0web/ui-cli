import { render } from '../src/core/render.js';
import { Alert } from '../src/components/view/Alert.js';
import { Select } from '../src/components/prompt/Select.js';

async function main() {
    console.log("--- V1: Static View Demo ---");
    // Should print immediately via JS engine's toString() call
    console.log(Alert({
        title: 'System Initialized',
        children: 'The View Component is working via toString()!',
        variant: 'success'
    }));

    console.log("--- V2: Interactive Prompt Demo ---");
    console.log("Rendering Select...");

    // Should run interactive prompt
    const result = await render(
        Select({
            message: 'Choose your destiny:',
            options: ['Red Pill', 'Blue Pill']
        })
    );

    console.log(Alert({
        title: 'Decision Made',
        children: `You chose: ${result.value}`,
        variant: 'info'
    }));
}

main().catch(err => console.error(err));
