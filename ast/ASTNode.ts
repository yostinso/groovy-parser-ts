import NodeMetaDataHandler from "./NodeMetaDataHandler";

export default class ASTNode implements NodeMetaDataHandler {
    private lineNumber: number = -1;
    private columnNumber: number = -1;
    private lastLineNumber: number = -1;
    private lastColumnNumber: number = -1;
    public parenthesisLevel: number = 0;

    public metaDataMap: Map<any, any> = new Map<any, any>();

    getText(): string {
        return `<not implemented yet for class ${this.constructor.name}>`;
    }
    incParenthesesLevel() {
        this.parenthesisLevel++;
    }
}
