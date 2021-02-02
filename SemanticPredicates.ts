import { CharStream } from "antlr4ts/CharStream";
import { IntStream, Token, TokenStream } from "antlr4ts";
import GroovyCharacter from "./GroovyCharacter";
import { GroovyLexer } from "./parsers/GroovyLexer";
import { BinTree } from "bintrees";
import { MODIFIER_OPCODE_MAP } from "./Opcodes";
import { ExpressionContext, PostfixExprAltContext, PathExpressionContext, PostfixExpressionContext } from "./parsers/GroovyParser";
import { ParseTree } from "antlr4ts/tree/ParseTree";

const NONSPACES_PATTERN = /\S+?/;
const LETTER_AND_LEFTCURLY_PATTERN = /[a-zA-Z_\{]/;
const NONSURROGATE_PATTERN = /[^\u0000-\u007F\uD800-\uDBFF]/;
const SURROGATE_PAIR1_PATTERN = /[\uD800-\uDBFF]/;
const SURROGATE_PAIR2_PATTERN = /[\uDC00-\uDFFF]/;

const MODIFIER_ARRAY: BinTree<number> = (() => {
    let tree = new BinTree<number>((a: number, b: number) => a - b);
    for (let k of MODIFIER_OPCODE_MAP.keys()) {
        tree.insert(k);
    }
    return tree;
})();

export default class SemanticPredicates {
    public static isFollowedBy = (cs: CharStream, ...chars: string[]): boolean => {
        let c1: number = cs.LA(1);
        let s = String.fromCharCode(c1);
        return chars.join("").includes(s);
    };

	public static isFollowedByWhiteSpaces = (cs: CharStream): boolean => {
		for (
			let index = 1, c = cs.LA(index);
			!('\r'.charCodeAt(0) === c || '\n'.charCodeAt(0) === c || IntStream.EOF === c); index++, c = cs.LA(index)) {
				if (String.fromCharCode(c).match(NONSPACES_PATTERN)) {
					return false;
				}
		}
		return true;
	};

    public static isFollowedByJavaLetterInGString = (cs: CharStream) => {
        let c1 = cs.LA(1);
        if ('$'.charCodeAt(0) === c1) { // single $ is not a valid identifier
            return false;
        }
        let str1 = String.fromCharCode(c1);
        if (str1.match(LETTER_AND_LEFTCURLY_PATTERN)) { return true; }
        if (str1.match(NONSURROGATE_PATTERN) && GroovyCharacter.isJavaIdentifierPart(c1)) {
            return true;
        }
        let c2 = cs.LA(2);
        let str2 = String.fromCharCode(c2);
        if (
            str1.match(SURROGATE_PAIR1_PATTERN) &&
            str2.match(SURROGATE_PAIR2_PATTERN) &&
            GroovyCharacter.isJavaIdentifierPart(c1, c2)
            ) {
                return true;
        }
        return false;
    };

    /**
     * Distinguish between method declaration and method call/constructor declaration
     */
    static isInvalidMethodDeclaration = (ts: TokenStream): boolean => {
        let tokenType: number = ts.LT(1).type;

        return (GroovyLexer.Identifier === tokenType || GroovyLexer.CapitalizedIdentifier === tokenType || GroovyLexer.StringLiteral === tokenType)
                && GroovyLexer.LPAREN === (ts.LT(2).type);
    };

    /**
     * Distinguish between local variable declaration and method call, e.g. `a b`
     */
    static isInvalidLocalVariableDeclaration = (ts: TokenStream): boolean => {
        let index: number = 2,
            token: Token,
            tokenType: number,
            tokenType2: number = ts.LT(index).type,
            tokenType3: number;

        if (GroovyLexer.DOT === tokenType2) {
            let tokeTypeN: number = tokenType2;

            do {
                index = index + 2;
                tokeTypeN = ts.LT(index).type;
            } while (GroovyLexer.DOT === tokeTypeN);

            if (GroovyLexer.LT === tokeTypeN || GroovyLexer.LBRACK === tokeTypeN) {
                return false;
            }

            index = index - 1;
            tokenType2 = ts.LT(index + 1).type;
        } else {
            index = 1;
        }

        token = ts.LT(index);
        tokenType = token.type;
        tokenType3 = ts.LT(index + 2).type;

        return ( // VOID == tokenType ||
            !(GroovyLexer.BuiltInPrimitiveType === tokenType || MODIFIER_ARRAY.find(tokenType))
            && GroovyCharacter.isLowercase(token.text?.charCodeAt(0) || 0)
            && !(GroovyLexer.ASSIGN === tokenType3 || (GroovyLexer.LT === tokenType2 || GroovyLexer.LBRACK === tokenType2))
        );

    };

    /**
     * Check whether following a method name of command expression.
     * Method name should not end with "2: arguments" and "3: closure"
     *
     * @param context the preceding expression
     */
    static isFollowingArgumentsOrClosure = (context: ExpressionContext): boolean => {
        if (context instanceof PostfixExprAltContext) {
            let peacChildren: ParseTree[] = context.children || [];

            try {
                let peacChild: ParseTree = peacChildren[0];
                let pecChild: ParseTree = (peacChild as PostfixExpressionContext).getChild(0);
                
                let pec = pecChild as PathExpressionContext;
                let t: number = pec.t;
                return (2 === t || 3 === t);
            } catch (e) {
                throw new Error("Unexpected structure of expression context: " + context + e.toString());
            }
        }

        return false;
    };


}