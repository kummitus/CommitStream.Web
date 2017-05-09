let count = 0;

const catchAsyncErrors = fn => (req, res, next, ...rest) => {
    const routePromise = fn(req, res, next, ...rest);
    if (routePromise.catch) {
        console.error(`catchAsyncErrors:calling routePromise.catch #${++count}`);
        routePromise.catch(err => next(err));
    }
};

export default catchAsyncErrors;
