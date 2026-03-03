import prompts from 'prompts';
prompts({type: 'autocomplete', name: 'v', message: 'Test', choices: [{title: 'Apple', value: 'a'}, {title: 'Banana', value: 'b'}]}).then(console.log);
