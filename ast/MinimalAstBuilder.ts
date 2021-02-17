import { ParserRuleContext } from "antlr4ts";
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { GroovyParserVisitor } from "..";
import { GroovyLangLexer } from "../GroovyLangLexer";
import { ArgumentsContext, ClosureOrLambdaExpressionContext, CommandExpressionContext, EnhancedArgumentListElementContext, EnhancedArgumentListInParContext, ExpressionContext, IdentifierContext, IdentifierPrmrAltContext, MethodBodyContext, NamePartContext, PathElementContext, PathExpressionContext, PostfixExpressionContext } from "../parsers/GroovyParser";

interface GroovyParserContext extends ParserRuleContext {
    getMetaDataMap(): Map<any, any> | null;
    setMetaDataMap(metaDataMap: Map<any, any>): void;
}

interface CodeStats {
    methods: MethodDefinition[],
    [key: string]: any
}

class MethodDefinition {
    name: string;
    arguments: string[] = [];
    constructor(name: string) {
        this.name = name;
    }
}

function notEmpty<T>(e: T | undefined): e is T {
    return e !== undefined;
}

function putMetaData(ctx: ParserRuleContext, key: string, value: any): void {
    let ctxAsMeta = (ctx as GroovyParserContext);
    let metaMap = ctxAsMeta.getMetaDataMap();
    if (!metaMap) {
        metaMap = new Map<string, any>();
        ctxAsMeta.setMetaDataMap(metaMap);
    }
    metaMap.set(key, value);
}
function getMetaData(ctx: ParserRuleContext, key: string): any {
    let ctxAsMeta = (ctx as GroovyParserContext);
    return ctxAsMeta.getMetaDataMap()?.get(key);
}

export default class MinimalAstBuilder extends AbstractParseTreeVisitor<Statement|undefined> implements GroovyParserVisitor<any> {
    private inClosure: ClosureContentsStatement[] = [];
    lexer: GroovyLangLexer;
    methods: {
        name: string,
        [key: string]: any
    }[] = [];
    private currentMethod: number = -1;

    constructor(lexer: GroovyLangLexer) {
        super();
        this.lexer = lexer;
    }

    protected defaultResult(): Statement|undefined {
        return new EmptyStatement();
    }

    aggregateResult(agg: ListOfStatements, next: Statement): ListOfStatements {
        if (next) { agg.push(next); }
        return agg;
    }

    visit(tree: ParseTree|undefined): Statement | undefined {
        if (!tree) { return undefined; }
        return super.visit(tree);
    }

    // ROOT ENTRYPOINT COMMANDEXPR
    visitCommandExpression(ctx: CommandExpressionContext): Statement | undefined {
        const hasArgumentList = ctx.enhancedArgumentListInPar();
        const hasCommandArgument = ctx.commandArgument().length > 0;
        const baseExpr = this.visit(ctx.expression());
        if (baseExpr) {
            if (this.inClosure.length > 0) {
                this.inClosure[this.inClosure.length-1].push(baseExpr);
            }
            console.log(`Got ${baseExpr?.text}`);
        }
        return baseExpr;
    }

    visitPostfixExpression(ctx: PostfixExpressionContext): Statement | undefined {
        let ret = this.visitPathExpression(ctx.pathExpression());
        return ret;
    }
    visitPathExpression(ctx: PathExpressionContext): Statement | undefined {
        let staticTerminal = ctx.STATIC();
        let primary: string|undefined;
        if (staticTerminal) {
            primary = staticTerminal.text;
        } else {
            primary = this.visit(ctx.primary())?.text;
        }
        primary ||= ctx.primary()?.text;

        if (!primary) { return undefined; }
        let elementName: string = primary;

        let ret: Statement | undefined;

        putMetaData(ctx, "baseExprName", elementName);
        ctx.pathElement().forEach((e) => {
            putMetaData(e, "baseExpr", ctx);
            let stmt = this.createPathElement(e);
            if (stmt instanceof ClosureContentsStatement) {
                elementName = getMetaData(ctx, "baseExprName");
                ret = new ClosureStatement(elementName, stmt);
            } else if (stmt instanceof ArgumentsStatement) {
                elementName = getMetaData(ctx, "baseExprName");
                ret = new MethodStatement(elementName, stmt);
            }
        });

        return ret;
    }

    createPathElement(ctx: PathElementContext): ArgumentsStatement | ClosureContentsStatement | undefined {
        let args = ctx.arguments();
        let lambdaExpr = ctx.closureOrLambdaExpression();
        let dotExpr = ctx.DOT();
        let safeDotExpr = ctx.SAFE_DOT();
        let safeChainDotExpr = ctx.SAFE_CHAIN_DOT();

        let baseExpr = getMetaData(ctx, "baseExpr");
        let baseExprName = baseExpr ? getMetaData(baseExpr, "baseExprName") : "";
        let namePart = this.visitNamePart(ctx.namePart());
        let newName;
        
        if (args) {
            return this.visitArguments(args);
        } else if (lambdaExpr) {
            return this.visitClosureOrLambdaExpression(lambdaExpr);
        } else if (dotExpr) {
            newName = `${baseExprName}.${namePart}`;
            putMetaData(baseExpr, "baseExprName", newName);
        } else if (safeDotExpr) {
            newName = `${baseExprName}?.${namePart}`;
            putMetaData(baseExpr, "baseExprName", newName);
        } else if (safeChainDotExpr) {
            newName = `${baseExprName}!?.${namePart}`;
            putMetaData(baseExpr, "baseExprName", newName);
        } else {
            console.warn("Unknown path element");
        }
    }

    visitNamePart(ctx: NamePartContext|undefined): string {
        if (!ctx) { return ""; }
        return ctx.text;
    }

    visitClosureOrLambdaExpression(ctx: ClosureOrLambdaExpressionContext): ClosureContentsStatement | undefined {
        let closure = ctx.closure();
        if (!closure) { return undefined; }

        let code = closure.blockStatementsOpt().text;
        let stmt = new ClosureContentsStatement(code);
        this.inClosure.push(stmt);
        this.visit(closure.blockStatementsOpt().blockStatements());
        this.inClosure.pop();
        
        return stmt;
    }

    visitArguments(ctx: ArgumentsContext): ArgumentsStatement {
        let argsInPar = ctx.enhancedArgumentListInPar();
        if (!argsInPar) { return new ArgumentsStatement(); }
        let args = this.visitEnhancedArgumentListInPar(ctx.enhancedArgumentListInPar());
        return new ArgumentsStatement(args);
    }
    visitEnhancedArgumentListInPar(ctx: EnhancedArgumentListInParContext|undefined): ArgumentStatement[] {
        if (!ctx) { return []; }
        let args: ArgumentStatement[] = [];
        args = ctx.enhancedArgumentListElement().map((e) => this.visitEnhancedArgumentListElement(e)).filter(notEmpty);
        return args;
    }

    visitEnhancedArgumentListElement(ctx: EnhancedArgumentListElementContext): ArgumentStatement | undefined {
        let expressionElement = ctx.expressionListElement();
        let mapEntry = ctx.mapEntry();
        let name: string | undefined;
        let valueExpr: ExpressionContext;
        if (expressionElement) {
            valueExpr = expressionElement;
        } else if (mapEntry) {
            name = mapEntry.mapEntryLabel()?.text;
            valueExpr = mapEntry.expression();
        } else {
            return undefined;
        }

        let value = this.visit(valueExpr)?.text || valueExpr.text || "?";

        if (name) {
            return new ArgumentStatement(name, value);
        } else {
            return new ArgumentStatement(value);
        }
    }

    visitIdentifierPrmrAlt(ctx: IdentifierPrmrAltContext): IdentifierStatement {
        return this.visitIdentifier(ctx.identifier());
    }
    visitIdentifier(ctx: IdentifierContext): IdentifierStatement {
        return new IdentifierStatement(ctx.text);
    }
}

abstract class Statement {
    get text() { return ""; }
}

class IdentifierStatement extends Statement {
    name: string;
    constructor(name: string) {
        super();
        this.name = name;
    }
    get text() { return this.name; }
}

class ArgumentStatement extends Statement {
    name: string|undefined;
    value: string;
    constructor(name: string, value: string);
    constructor(value: string);
    constructor(name_or_value: string, value?: string) {
        super();
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

class ArgumentsStatement extends Statement {
    args: ArgumentStatement[];
    constructor();
    constructor(args: ArgumentStatement[]);
    constructor(args?: ArgumentStatement[]) {
        super();
        this.args = args || [];
    }
    get text() {
        return this.args.map((a) => a.text).join(", ");
    }
    push(...args: ArgumentStatement[]) {
        this.args.push(...args)
    }
}

class MethodStatement extends IdentifierStatement {
    args: ArgumentsStatement;
    constructor(name: string, args: ArgumentsStatement) {
        super(name);
        this.args = args;
    }
    get text() {
        return `${this.name}(${this.args.text})`;
    }
}

class ClosureContentsStatement extends Statement {
    contents: Statement[] = [];
    code: string;
    constructor(code: string);
    constructor(code: string, contents: Statement[]);
    constructor(code: string, contents?: Statement[]) {
        super();
        this.code = code;
        if (contents) {
            this.contents = contents;
        }
    }
    push(statement: Statement) {
        this.contents.push(statement);
    }
    get text() {
        return `{ ${this.contents.map((c) => c.text).join("; ") || this.code } }`;
    }
}

class ClosureStatement extends IdentifierStatement {
    _contents: ClosureContentsStatement;
    constructor(name: string, contents: ClosureContentsStatement) {
        super(name);
        this._contents = contents;
    }
    get contents() { return this._contents.contents; }
    get code() { return this._contents.code; }
    get text() { return `${this.name} ${this._contents.text}`}
}

class ListOfStatements extends Statement {
    statements: Statement[] = [];
    push(...statements: Statement[]) {
        this.statements.push(...statements);
    }
}

class EmptyStatement extends Statement {
    
}