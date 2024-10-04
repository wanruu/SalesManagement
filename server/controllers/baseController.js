class BaseController {
    handleError(res, error) {
        console.error(error)
        res.status(500).send({
            // name: error.name,
            // errors: error.errors
            error: error.name
        })
    }

    handleNotFound(res) {
        res.status(404).json({ error: 'Not found' })
    }

    handleCreated(res, data) {
        res.status(201).json(data)
    }

    handleDeleted(res) {
        res.status(204).end()
    }
}

module.exports = BaseController