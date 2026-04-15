import { ModelAsApp } from './src/domain/ModelAsApp.js'
class StatusCommand extends ModelAsApp {}
		class PullCommand extends ModelAsApp {}

		class TestApp extends ModelAsApp {
			static alias = 'testcli'
			static UI = {
				title: 'Test CLI App',
				description: 'This is a test CLI application.',
				usageTitle: 'Usage:',
				usageExamples: [
					'{cmd} status           — show status',
					'{cmd} pull             — pull changes',
				],
				optionsTitle: 'Options:',
			}

			static command = {
				description: 'Command to run',
				options: [StatusCommand, PullCommand],
				positional: true,
				required: true,
			}
		}

		console.log(new TestApp().generateHelp())
