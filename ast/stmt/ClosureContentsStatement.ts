import Statement from "./Statement";


export default class ClosureContentsStatement extends Statement {
    contents: Statement[] = [];
    code: string;
    constructor(line: number, charInLine: number, code: string);
    constructor(line: number, charInLine: number, code: string, contents: Statement[]);
    constructor(line: number, charInLine: number, code: string, contents?: Statement[]) {
        super(line, charInLine);
        this.code = code;
        if (contents) {
            this.contents = contents;
        }
    }
    push(statement: Statement) {
        this.contents.push(statement);
    }
    get text() {
        return `{ ${this.contents.map((c) => c.text).join("; ") || this.code} }`;
    }
}
