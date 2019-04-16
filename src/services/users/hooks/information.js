
const clean = (context) => {
    console.log('cofdntext');


    return context;
}

exports.before = {
    all: [],
    fing: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []

}

exports.after = {
    all: [clean],
    fing: [],
    get: [clean],
    create: [],
    update: [],
    patch: [],
    remove: []

}

exports.error = {
    all: [],
    fing: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
}