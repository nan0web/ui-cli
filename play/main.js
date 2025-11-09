#!/usr/bin/env node

import Logger from '@nan0web/log'
import { CLIInputAdapter } from '../src/index.js'
import { createUserForm } from './forms/userForm.js'
import { createAgeForm } from './forms/ageForm.js'
import { createAddressForm } from './forms/addressForm.js'
import { createProfileForm } from './forms/profileForm.js'
import createT, { localesMap } from "./vocabs/index.js"
import CLIMessage from '../src/CLIMessage.js'

console = new Logger()

const adapter = new CLIInputAdapter()

console.info(Logger.style(Logger.LOGO, { color: "magenta" }))
console.warn('=== @nan0web/ui CLI Playground ===\n')

// Language selection
const langResult = await adapter.requestSelect({
	title: "Language selection",
	prompt: "Choose language (1-2): ",
	options: localesMap,
	elementId: "language-select"
})

if (langResult.action === 'select-cancel') {
	console.warn('Language selection cancelled')
	process.exit(0)
}

const selectedLang = langResult.value.body
const t = createT(selectedLang)

console.success(`${t('Language selection')}: ${t(selectedLang)}`)
console.info()

// User registration form
const userForm = createUserForm(t)
const userResult = await adapter.requestForm(userForm, { silent: false })

if (userResult.action === 'form-submit') {
	console.success(t('Welcome to our platform!'))
	console.info('User data:', userResult.data)
	console.info()
} else {
	console.warn('User registration cancelled')
}

// Age confirmation form
const ageForm = createAgeForm(t)
const ageResult = await adapter.requestForm(ageForm, { silent: false })

if (ageResult.action === 'form-submit') {
	console.success(`Confirmed age: ${ageResult.data.age}`)
} else {
	console.warn('Age confirmation cancelled')
}

// Address information form
const addressForm = createAddressForm(t)
const addressResult = await adapter.requestForm(addressForm, { silent: false })

if (addressResult.action === 'form-submit') {
	console.success('Address information collected')
	console.info('Address data:', addressResult.data)
	console.info()
} else {
	console.warn('Address form cancelled')
}

// Profile update form
const profileForm = createProfileForm(t)
const profileResult = await adapter.requestForm(profileForm, { silent: false })

if (profileResult.action === 'form-submit') {
	console.success('Profile updated')
	console.info('Profile data:', profileResult.data)
	console.info()
} else {
	console.warn('Profile update cancelled')
}

// CLIMessage example usage
console.info('\n=== CLIMessage Example ===')
const cliMessageSchemas = [{
	name: 'config',
	help: 'Configuration commands',
	Children: [{
		name: 'set',
		help: 'Set configuration value',
		Schema: class {
			static key = ""
			static keyHelp = "Configuration key to set"

			static value = ""
			static valueHelp = "Value to set"
		}
	}, {
		name: 'get',
		help: 'Get configuration value',
		Schema: class {
			static key = ""
			static keyHelp = "Configuration key to get"
		}
	}]
}]

const cliMessage = new CLIMessage(cliMessageSchemas)
const parsedMessage = cliMessage.parse(['config', 'set', '--key', 'language', '--value', 'en'])
console.info('Parsed CLI message:', parsedMessage)

// Command example usage
console.info('\n=== Command Example ===')
import Command from '../src/Command.js'

const configSetCommand = new Command({
	name: 'set',
	help: 'Set configuration value',
	options: {
		key: [String, '', 'Configuration key to set'],
		value: [String, '', 'Value to set']
	},
	run: async function* (message) {
		yield `Setting ${message.opts.key} to ${message.opts.value}`
	}
})

const commandMessage = configSetCommand.parse(['--key', 'theme', '--value', 'dark'])
console.info('Command message:', commandMessage)
console.info('Help text:\n', configSetCommand.generateHelp())

for await (const result of configSetCommand.execute(commandMessage)) {
	console.info('Command execution result:', result)
}

// CommandMessage example usage
console.info('\n=== CommandMessage Example ===')
import CommandMessage from '../src/CommandMessage.js'

const simpleMessage = CommandMessage.parse(['user', 'create', '--name', 'John', '--email', 'john@example.com'])
console.info('Simple command message:', simpleMessage.toString())
console.info('Arguments:', simpleMessage.argv)
console.info('Options:', simpleMessage.opts)

const complexMessage = new CommandMessage({
	name: 'app',
	argv: ['start', '--port', '3000'],
	opts: { debug: true, config: '/path/to/config' }
})
console.info('Complex command message:', complexMessage.toString())
