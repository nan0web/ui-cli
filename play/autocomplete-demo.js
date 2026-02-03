/**
 * Autocomplete demo – demonstrates searchable selection lists.
 *
 * @module play/autocomplete-demo
 */



const COUNTRIES = [
    'Ukraine', 'United States', 'United Kingdom', 'Germany', 'France',
    'Italy', 'Spain', 'Canada', 'Australia', 'Japan', 'China', 'Brazil',
    'Poland', 'Netherlands', 'Sweden', 'Norway', 'Finland', 'Denmark'
]

/**
 * Run the autocomplete demo.
 *
 * @param {import('@nan0web/log').default} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 * @param {Function} t - Translation function.
 */
export async function runAutocompleteDemo(console, adapter, t) {
    console.clear()
    console.success(t('Autocomplete Demo'))
    console.info(t('Tip: Type to filter the list of countries.'))

    const result = await adapter.requestAutocomplete({
        message: t('Search for a country:'),
        options: async (query) => {
            // Simulating async fetch with delay
            await new Promise(r => setTimeout(r, 100))
            const localizedCountries = COUNTRIES.map(c => t(c))
            return localizedCountries.filter(c => c.toLowerCase().includes(query.toLowerCase()))
        },
        limit: 5 // Show only 5 items at a time
    })

    if (!result || result.cancelled) {
        console.warn(t('Selection cancelled.'))
    } else {
        console.success(`${t('You selected:')} ${result.value}`)
    }
}
