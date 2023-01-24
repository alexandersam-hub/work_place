class ErrorDto{

    whereError
    description
    date

    constructor(whereError, description) {
        this.whereError = whereError
        this.description = description
        this.date = new Date()
    }
}

module.exports = ErrorDto