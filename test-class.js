class ModelAsApp { generateHelp() {} }
class SubCmd extends ModelAsApp {}
console.log(!!SubCmd.prototype.generateHelp)
try {
console.log(SubCmd.prototype instanceof ModelAsApp)
} catch (e) {}
