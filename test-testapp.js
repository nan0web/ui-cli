import { ModelAsApp } from './src/domain/ModelAsApp.js'

class StatusCommand extends ModelAsApp {
    static UI = { title: 'Show status' }
}
class PullCommand extends ModelAsApp {
    static UI = { title: 'Pull changes' }
}

class TestApp extends ModelAsApp {
    static alias = 'testcli'
    static UI = {
        title: 'Test CLI App',
        description: 'This is a test CLI application.',
        usageTitle: 'Usage:',
        optionsTitle: 'Options:',
    }

    static command = {
        positional: true,
        help: 'Command to run (status or pull)',
        type: [StatusCommand, PullCommand],
    }

    static debug = { help: 'Enable debug mode [false]', alias: 'd', type: 'boolean', default: false }
    static verbose = { help: 'Enable verbose output [false]', type: 'boolean', default: false }
}

const app = new TestApp()
console.log(app.generateHelp())
