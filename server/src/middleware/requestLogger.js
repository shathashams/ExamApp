// מציג כל בקשה שמגיעה לשרת
export default (req, res, next) => {
    console.log(
        `[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`
    )
    next()
}
