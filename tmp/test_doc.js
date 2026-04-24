import { App } from '../src/domain/App.js';
import DBFS from '@nan0web/db-fs';

const db = new DBFS({ root: 'play/data' });
async function test() {
  let doc = await db.fetch('index');
  console.log(!!doc.langs);
}
test()
