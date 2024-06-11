
class General  {

   copy() {
       return Object.assign({}, this);
   }

   deepCopy() {
       return structuredClone(this);
   }

   static compare(object_1: any, object_2: any) {
    for (const key in object_1) {
        if (typeof object_1[key] === 'object') {
            this.compare(object_1[key], object_2[key]);
        }
        if (object_1[key] !== object_2[key]) {
            return false
        }
    }
    return true
   }

   serialize() {
       return JSON.stringify(this);
   }

    print() {
       console.dir(this);
    }

    checkType(some_type: any) {
       return this instanceof some_type
    }

    getType() {
       // В Typescript нельзя вернуть текущий тип, потому что типов нет в рантайме, все объекты имеют один тип object
    }
}