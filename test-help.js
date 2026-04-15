import { ModelAsApp } from './src/domain/ModelAsApp.js'

class StatusCommand extends ModelAsApp {
    static UI = { title: 'Show status' }
    static debug = { help: 'Some debug flag for status' }
}
class TestApp extends ModelAsApp {
    static command = { positional: true, type: [StatusCommand] }
    static help = { type: 'boolean', default: false }
}
const app = new TestApp({ command: 'status', help: true })
console.log(app.command)
