import Statement from "./Statement";
import ArgumentStatement from "./ArgumentStatement";

export default class ArgumentsStatement extends Statement {
    args: ArgumentStatement[];
    constructor();
    constructor(args: ArgumentStatement[]);
    constructor(args?: ArgumentStatement[]) {
        super(0, 0);
        this.args = args || [];
    }
    get text() {
        return this.args.map((a) => a.text).join(", ");
    }
    push(...args: ArgumentStatement[]) {
        this.args.push(...args);
    }
}
