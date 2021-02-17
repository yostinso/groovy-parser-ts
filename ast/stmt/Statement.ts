
export default abstract class Statement {
    line: number;
    charInLine: number;
    constructor(line: number, charInLine: number) {
        this.line = line;
        this.charInLine = charInLine;
    }
    get text() { return ""; }
    get notEmpty(): boolean { return true; }
    toString(): string {
        return `${this.line}:${this.charInLine} ${this.constructor.name}<${this.text}>`;
    }
}
