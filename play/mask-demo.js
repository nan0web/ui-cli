
import CLiInputAdapter from '../src/InputAdapter.js'

export async function runMaskDemo(console, adapter, t) {
    // console.info(t('Mask Demo'))
    await adapter.requestMask({
        message: t('Contact Phone:'),
        mask: '+38 (###) ###-##-##',
        placeholder: '0000000000'
    })
}
