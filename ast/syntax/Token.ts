import CSTNode from "./CSTNode";
import Types from "./Types";

export default class Token extends CSTNode {
    public static readonly NULL: Token = new Token();
    public static readonly EOF: Token = new Token(Types.EOF, "", -1, -1);

    private text: string = "";
    private type: number = Types.UNKNOWN;
    private meaning: number = Types.UNKNOWN;
    public startLine: number = -1;
    public startColumn: number = -1;

    /*
     * Create NULL token
     */
    constructor();

    /*
     * Initialize a token
     */
    constructor(type: number, text: string, startLine: number, startColumn: number);
    constructor(type?: number, text?: string, startLine?: number, startColumn?: number) {
        super();
        if (type !== undefined && text !== undefined && startLine !== undefined && startColumn !== undefined) {
            this.type = type;
            this.meaning = type;
            this.text = text;
            this.startLine = startLine
            this.startColumn = startColumn;
        }
    }
    dup() {
        const token = new Token(this.type, this.text, this.startLine, this.startColumn);
        token.setMeaning(this.meaning);
        return token;
    }
    getMeaning(): number {
        return this.meaning;
    }
    setMeaning(meaning: number): CSTNode {
        this.meaning = meaning;
        return this;
    }
    getType(): number {
        return this.type;
    }
    size(): number {
        return 1;
    }
    get(index: number) {
        if (index > 0) {
            throw new Error("This is the root node");
        }
        return this;
    }
    getRoot(safe?: boolean): Token {
        if (safe === undefined) {
            return this;
        }
        return super.getRootSuper(safe);
    }
    getText(): string {
        return this.text;
    }
}