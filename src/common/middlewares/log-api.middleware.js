export const logApi = (req, res, next) => {
    const method = req.method
    const url = req.originalUrl
    const ip = req.ip
    
    const messLogApi = `${new Date().toLocaleString()} ${method} \t ${url} \t ${ip}`;
    console.log(messLogApi)
    next()
}