import { ModelAsApp } from './src/domain/ModelAsApp.js'

class Level3Command extends ModelAsApp {
    static UI = { title: 'Level 3 Help' }
}

class StatusCommand extends ModelAsApp {
    static UI = { title: 'Status Command Help' }
    static action = { positional: true, type: [Level3Command] }
}

class TestApp extends ModelAsApp {
    static UI = { title: 'Root App Help' }
    static command = { positional: true, type: [StatusCommand] }
}

const app = new TestApp({ command: 'status', _positionals: ['level3'] })
// Wait, `new ModelAsApp` doesn't automatically consume `_positionals` from data.
// In ui-cli, args are resolved via InputAdapter -> IntentDispatcher -> ...
// But Model constructor maps data manually.
console.log(app.command) // Should be 'status'
