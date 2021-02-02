import { CharStream, Lexer } from "antlr4ts";
import { ATN } from "antlr4ts/atn/ATN";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { GroovyLexer } from "./parsers/GroovyLexer";

class GroovyLexerATNSimulator extends LexerATNSimulator {
    resetAcceptPosition(input: CharStream, index: number, line: number, charPos: number) {
        input.seek(index);
        this.line = line;
        this.charPositionInLine = charPos;
        this.consume(input);
    }
}

export class GroovyLangLexer extends GroovyLexer {
    constructor(input: CharStream) {
        super(input);
        this.interpreter = new GroovyLexerATNSimulator(GroovyLexer._ATN, this);
    }
    rollbackOneChar() {
        (this.interpreter as GroovyLexerATNSimulator).resetAcceptPosition(
            this.inputStream,
            this._tokenStartCharIndex - 1,
            this._tokenStartLine,
            this._tokenStartCharPositionInLine - 1
        );
    }
}