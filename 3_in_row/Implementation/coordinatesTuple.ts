import {Tuple} from "../ADT/tuple";
import {Coordinates} from "../ADT/types";

export class CoordinatesTuple implements Tuple<Coordinates> {
    private store: Coordinates[] = [];

    constructor(first: Coordinates, second: Coordinates) {
        this.store[0] = first;
        this.store[1] = second;
    }

    get first(): Coordinates {
        return this.store[0];
    }

    get second(): Coordinates {
        return this.store[1];
    }
}