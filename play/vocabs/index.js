import i18n, { createT } from "@nan0web/i18n"
import en from "./en.js"
import uk from "./uk.js"

const getVocab = i18n({ en, uk })

export const localesMap = new Map([
	["en", "English"],
	["uk", "Українська"],
])

export default (locale) => createT(getVocab(locale))
