export class CancelError extends Error {
	constructor(message = "Operation cancelled by user") {
		super(message)
		this.name = "CancelError"
	}
}
