import Token from "./Token";
import Types from "./Types";

export default abstract class CSTNode {
    getMeaning(): number {
        return this.getRoot(true).getMeaning();
    }
    setMeaning(meaning: number): CSTNode {
        this.getRoot().setMeaning(meaning);
        return this;
    }
    canMean(type: number): boolean {
        return Types.canMean(this.getMeaning(), type);
    }
    isA(type: number): boolean {
        return Types.ofType(this.getMeaning(), type);
    }
    isOneOf(types: number[]): boolean {
        const meaning = this.getMeaning();
        return !!types.find((type) => Types.ofType(meaning, type));
    }
    isAllOf(types: number[]): boolean {
        const meaning = this.getMeaning();
        return !!types.every((type) => Types.ofType(meaning, type));
    }
    abstract getRoot(): Token;
    abstract getRoot(safe: boolean): Token;

    getRootSuper(safe: boolean): Token {
        let root = this.getRoot();
        if (root === null && safe) {
            root = Token.NULL;
        }
        return root;
    }
}