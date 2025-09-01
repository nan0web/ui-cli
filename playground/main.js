#!/usr/bin/env node

import Logger from '@nan0web/log'
import { CLIInputAdapter } from '../src/index.js'
import { createUserForm } from './forms/userForm.js'
import { createAgeForm } from './forms/ageForm.js'
import { createAddressForm } from './forms/addressForm.js'
import { createProfileForm } from './forms/profileForm.js'
import createT, { localesMap } from "./vocabs/index.js"

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

const selectedLang = langResult.value
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
