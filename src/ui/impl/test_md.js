import MarkdownParser from '@nan0web/markdown/Markdown.js'
const md = new MarkdownParser()
const ast = md.parse(`
# Cards • Industrialbank

## Welcome to Industrialbank Cards

[Check the documentation](/en/docs.html).  
We are happy to help.

If you have any questions, please contact our support team.
`)
console.log(ast.map(n => n.constructor.name))
