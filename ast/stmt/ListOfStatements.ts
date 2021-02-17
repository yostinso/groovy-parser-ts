import Statement from "./Statement";

export default class ListOfStatements extends Statement {
    statements: Statement[] = [];
    constructor() {
        super(0, 0);
    }
    push(...statements: Statement[]) {
        statements.forEach((s) => {
            if (s instanceof ListOfStatements) {
                //console.log("Push1 ", s.statements);
                this.push(...s.statements);
            } else {
                //console.log("Push2 ", statements);
                this.statements.push(s);
            }
        });
    }
    get text(): string {
        return `${this.statements.map((s) => s.text).join(", ")}`;
    }
    get notEmpty(): boolean {
        return this.statements.length > 0;
    }
}
