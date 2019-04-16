
const rekursiveIdRemover = (data) => {
    for(let x in data){
        let d = data[x];
        if(Array.isArray(d)){
            d = rekursiveIdRemover(d);
        }else if(typeof d === "object"){
            d = rekursiveIdRemover(d);
        }else if(x === "_id"){
            delete data[x]
        }
        
    }

    return data;
}

const removeIds = (context) => {
    if(!context.result.data) return context;
    //TODO: find a solution for converting
    context.result.data = rekursiveIdRemover(JSON.parse(JSON.stringify(context.result.data)));

    return context;
}

const clean = (context) => {
    console.log('cofdntext');


    return context;
}

exports.before = {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []

}

exports.after = {
    all: [],
    find: [],
    get: [removeIds, clean],
    create: [],
    update: [],
    patch: [],
    remove: []

}

exports.error = {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
}