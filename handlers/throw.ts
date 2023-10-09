function tError(error: string) {
    throw new TypeError(`[ERROR]: ${error}`);
}

function rError(error: string) {
    throw new RangeError(`[ERROR]: ${error}`);
}

function sError(error: string) {
    throw new SyntaxError(`[ERROR]: ${error}`);
}

function rfError(error: string) {
    throw new ReferenceError(`[ERROR]: ${error}`);
}

function eError(error: string) {
    throw new Error(`[ERROR]: ${error}`);
}


export { eError, tError, rError, sError, rfError };