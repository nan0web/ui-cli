import DBFS from '@nan0web/db-fs';
const db = new DBFS({ root: 'play/data' });
const doc = await db.fetch('uk/index');
console.log(!!doc);
