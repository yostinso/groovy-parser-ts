import Statement from "./Statement";


export default class IdentifierStatement extends Statement {
    name: string;
    constructor(line: number, charInLine: number, name: string) {
        super(line, charInLine);
        this.name = name;
    }
    get text() { return this.name; }
}
