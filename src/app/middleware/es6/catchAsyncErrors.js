const catchAsyncErrors = fn => (req, res, next, ...rest) => {
    const routePromise = fn(req, res, next, ...rest);
    if (routePromise.catch) {
        console.log("****************** WE ARE CALLING NEXT ******************");
        routePromise.catch(err => next(err));
    }
};

export default catchAsyncErrors;