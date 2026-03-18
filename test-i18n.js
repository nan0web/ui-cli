import DB from '@nan0web/db'
import DBFS from '@nan0web/db-fs'
import { I18nDb } from '@nan0web/i18n'

const db = new DB({ console: console })
db.mount('', new DBFS({ root: 'data', console: console }))

async function main() {
  await db.connect()
  const i18nDb = new I18nDb({ db, locale: 'uk', tPath: '_/t', dataDir: '' })
  const t = await i18nDb.createT('uk')
  
  console.log('Test:', t('Choose an action'))
  console.log('Vocab loaded?', Object.keys(i18nDb.vocab || {}).length)
}
main()
