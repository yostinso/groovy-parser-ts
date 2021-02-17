import ArgumentsStatement from "./ArgumentsStatement";
import IdentifierStatement from "./IdentifierStatement";

export default class MethodStatement extends IdentifierStatement {
    args: ArgumentsStatement;
    constructor(line: number, charInLine: number, name: string, args: ArgumentsStatement) {
        super(line, charInLine, name);
        this.args = args;
    }
    get text() {
        return `${this.name}(${this.args.text})`;
    }
}
