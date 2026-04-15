import { LogicInspector } from '../ui/src/testing/index.js'
import { InputModel } from './src/domain/prompt/InputModel.js'
import { verifySnapshot } from '../ui/src/testing/verifySnapshot.js'

async function run() {
    console.log("Starting mockModel...");
    async function* mockModel() {
        yield {
            type: 'ask',
            field: 'name',
            schema: new InputModel({ UI: 'Enter name', help: 'User name' }),
        }
        return { data: { name: 'test-user' } }
    }

    console.log("Calling LogicInspector.capture...");
    const intents = await LogicInspector.capture(mockModel(), { inputs: ['test-user'] })
    console.log("Intents captured:", intents);

    console.log("Calling verifySnapshot...");
    const testName = 'test-logic-snapshot.jsonl'
    await verifySnapshot({ name: testName, data: intents })
    console.log("verifySnapshot done.");
}

run().catch(console.error)
