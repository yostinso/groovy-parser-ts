import Statement from "./Statement";


export default class ArgumentStatement extends Statement {
    name: string | undefined;
    value: string;
    constructor(line: number, charInLine: number, name: string, value: string);
    constructor(line: number, charInLine: number, value: string);
    constructor(line: number, charInLine: number, name_or_value: string, value?: string) {
        super(line, charInLine);
        if (value) {
            this.name = name_or_value;
            this.value = value;
        } else {
            this.value = name_or_value;
        }
    }
    get text() {
        if (this.name) { return `${this.name}: ${this.value}`; }
        return this.value;
    }
}
