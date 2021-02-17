import IdentifierStatement from "./IdentifierStatement";
import ClosureContentsStatement from "./ClosureContentsStatement";

export default class ClosureStatement extends IdentifierStatement {
    _contents: ClosureContentsStatement;
    constructor(line: number, charInLine: number, name: string, contents: ClosureContentsStatement) {
        super(line, charInLine, name);
        this._contents = contents;
    }
    get contents() { return this._contents.contents; }
    get code() { return this._contents.code; }
    get text() { return `${this.name} ${this._contents.text}`; }
}
