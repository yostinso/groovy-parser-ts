import Statement from "./Statement";

export default class EmptyStatement extends Statement {
    constructor() {
        super(0, 0);
    }
    get notEmpty(): boolean { return false; }
}
