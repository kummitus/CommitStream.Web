const catchAsyncErrors = fn => (req, res, next, ...rest) => {
    const routePromise = fn(req, res, next, ...rest);
    if (routePromise.catch) {
        console.error(`catchAsyncErrors:calling routePromise.catch`);
        routePromise.catch(err => {
        	console.log("Caught an error and forwarding to next handler...");
            next(err)
        });
    }
};

export default catchAsyncErrors;
