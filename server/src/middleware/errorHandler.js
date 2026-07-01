// טיפול מרכזי בשגיאות שרת
export default (err, req, res, next) => {
    console.error(`[ERROR] ${err.stack || err.message}`)
    const status = err.status || 500
    res.status(status).json({
        error: err.message || 'Internal Server Error',
    })
}
