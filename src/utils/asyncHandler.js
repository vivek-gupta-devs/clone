
/** HANDLER IN TRY CATCH...
const asyncHandler = (fn) = async(req,res,next) => {
    try {
        await fn(req,res,next);

    } catch (error) {
        res.status(error.code || 500).json({
            message: error.message,
            status: false
        })
    }
}
 */
const asyncHandler = (handler) => {
    (req,res,next) => {
        Promise.resolve(handler(req,res,next))
        .catch((err) => next(err))
    }
}

export { asyncHandler }