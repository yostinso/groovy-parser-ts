import { Lexer, ParserRuleContext, Token } from "antlr4ts";
import GroovyToken from "./syntax/Token";
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { BlockContext, BlockStatementContext, BlockStatementsContext, BlockStatementsOptContext, CommandExpressionContext, CompilationUnitContext, EnhancedStatementExpressionContext, ExpressionContext, ExpressionInParContext, FormalParameterContext, FormalParameterListContext, FormalParametersContext, GroovyParser, IdentifierContext, LambdaBodyContext, LocalVariableDeclarationContext, ParExpressionContext, StandardLambdaExpressionContext, StandardLambdaParametersContext, ThisFormalParameterContext, TypeContext, VariableDeclarationContext, VariableDeclaratorContext, VariableDeclaratorIdContext, VariableDeclaratorsContext, VariableInitializerContext, VariableModifiersOptContext } from "../parsers/GroovyParser";
import { GroovyParserVisitor } from "../parsers/GroovyParserVisitor";
import Types from "./syntax/Types";
import BinaryExpression from "./expr/BinaryExpression";
import Expression from "./expr/Expression";
import NodeMetaDataHandler from "./NodeMetaDataHandler";
import { stat } from "fs";
import ExpressionStatement from "./stmt/ExpressionStatement";
import { GroovyLangLexer } from "../GroovyLangLexer";
import { Interval } from "antlr4ts/misc/Interval";
import LambdaExpression from "./expr/LambdaExpression";
import Parameter from "./Parameter";
import VariableExpression from "./expr/VariableExpression";
import Statement from "./stmt/Statement";
import BlockStatement from "./stmt/BlockStatement";
import CodeVisitor from "./CodeVisitor";
import DeclarationExpression from "./expr/DeclarationExpression";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import ClassNode from "./ClassNode";
import EmptyExpression from "./expr/EmptyExpression";


function notNull<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

class DeclarationListStatement extends Statement {
    public declarationStatements: ExpressionStatement[] = [];
    constructor(declarations: DeclarationExpression[]) {
        super();
        this.declarationStatements = declarations.map((e) => new ExpressionStatement(e));
    }

    visit(visitor: CodeVisitor) {
        throw new Error("Tried to visit DeclarationListStatement");
    }
}

/**
 * Builds the AST from the parse tree generated by Antlr4.
 */
export default class AstBuilder extends AbstractParseTreeVisitor<any> implements GroovyParserVisitor<any> {
    lexer: GroovyLangLexer;
    constructor(lexer: GroovyLangLexer) {
        super();
        this.lexer = lexer;
    }

    protected defaultResult() {
        return null;
    }
    visit(tree: ParseTree) {
        if (!tree) { return null; }
        return super.visit(tree);
    }
    visitCommandExpression(ctx: CommandExpressionContext): any {
        const hasArgumentList = !!ctx.enhancedArgumentListInPar();
        const hasCommandArgument = !!ctx.commandArgument();

        // TODO: https://github.com/apache/groovy/blob/f63ebdc9f2d6e5cfee95ba69ec32d32724dd8b53/src/main/java/org/apache/groovy/parser/antlr4/AstBuilder.java
        const baseExpr = this.visit(ctx.expression());
        if (hasArgumentList || hasCommandArgument) {
            if (baseExpr instanceof BinaryExpression) {
                if (!("[" == baseExpr.getOperation().getText()) && !this.isInsideParentheses(baseExpr)) {
                    throw Error("Unexpected input: '" + this.getOriginalText(ctx.expression()) + "'");
                }
            }
        }
    }

    visitParExpression(ctx: ParExpressionContext) {
        const expression = this.visitExpressionInPar(ctx.expressionInPar());
    }
    visitExpressionInPar(ctx: ExpressionInParContext) {
        return this.visitEnhancedStatementExpression(ctx.enhancedStatementExpression());
    }
    visitEnhancedStatementExpression(ctx: EnhancedStatementExpressionContext): Expression {
        let expression: Expression;
        const statement = ctx.statementExpression();
        const standardLambda = ctx.standardLambdaExpression();
        if (statement) {
            expression = (this.visit(statement) as ExpressionStatement)?.expression || statement;
        } else if (standardLambda) {
            expression = this.visitStandardLambdaExpression(standardLambda);
        } else {
            throw new Error("Invalid enhanced statement");
        }
        return expression;
    }
    visitStandardLambdaExpression(ctx: StandardLambdaExpressionContext): LambdaExpression {
        let lambdaParams = ctx.standardLambdaParameters();
        if (lambdaParams) {
            return this.createLambda(lambdaParams, ctx.lambdaBody());
        } else {
            throw new Error("Invalid enhanced statement");
        }
    }
    createLambda(standardLambdaParametersContext: StandardLambdaParametersContext, lambdaBodyContext: LambdaBodyContext): LambdaExpression {
        return new LambdaExpression(
            this.visitStandardLambdaParameters(standardLambdaParametersContext),
            this.visitLambdaBody(lambdaBodyContext)
        );
    }
    visitStandardLambdaParameters(ctx: StandardLambdaParametersContext): Parameter[]|null {
        let declaratorId = ctx.variableDeclaratorId();
        if (declaratorId) {
            let variable: VariableExpression = this.visitVariableDeclaratorId(declaratorId);
            let parameter: Parameter = new Parameter("Object", variable.name);
            return [parameter];
        }

        let parameters: Parameter[] = this.visitFormalParameters(ctx.formalParameters());
        return parameters.length > 0 ? parameters : null;
    }

    visitFormalParameters(ctx: FormalParametersContext|undefined): Parameter[] {
        if (!ctx) { return []; }
        return this.visitFormalParameterList(ctx.formalParameterList());
    }

    visitFormalParameterList(ctx: FormalParameterListContext|undefined): Parameter[] {
        if (!ctx) { return []; }
        let parameterList: Parameter[] = [];
        let thisFormalParam = ctx.thisFormalParameter();
        if (thisFormalParam) {
            parameterList.push(this.visitThisFormalParameter(thisFormalParam));
        }
        let formalParamList = ctx.formalParameter();
        if (formalParamList) {
            //validateVarArgParameter(formalParamList);
            let formalParamCtxList = formalParamList.map((fp) => this.visitFormalParameter(fp));
            parameterList.push(...formalParamCtxList);
        }
        //validateParameterList(parameterList);
        return parameterList;
    }

    visitThisFormalParameter(ctx: ThisFormalParameterContext) {
        return new Parameter(this.visitType(ctx.type()), "this");
    }

    visitFormalParameter(ctx: FormalParameterContext): Parameter {
        return this.processFormalParameter(ctx, ctx.variableModifiersOpt(), ctx.type(), ctx.ELLIPSIS(), ctx.variableDeclaratorId(), ctx.expression());
    }

    processFormalParameter(ctx: FormalParameterContext, variableModifiersOptContext: VariableModifiersOptContext, typeContext: TypeContext|undefined, ellipsis: TerminalNode|undefined, variableDeclaratorIdContext: VariableDeclaratorIdContext, expressionContext: ExpressionContext|undefined): Parameter {
        let classNode: ClassNode = this.visitType(typeContext);
        if (ellipsis) { classNode = classNode + "[]"; }
        let parameter: Parameter = new Parameter(
            classNode, this.visitVariableDeclaratorId(variableDeclaratorIdContext).name
        );
        if (expressionContext) {
            parameter.initialExpression = this.visit(expressionContext);
        }
        return parameter;
    }

    visitType(ctx: TypeContext|undefined): ClassNode {
        if (!ctx) { return "Object"; }

        return ctx.text; // We are not picky about types
        /*
        let classNode: ClassNode|null = null;
        let classOrInterfaceType = ctx.classOrInterfaceType();
        let primitiveType = ctx.primitiveType();
        if (classOrInterfaceType) {
            classNode = this.visitClassOrInterfaceType(classOrInterfaceType);
        } else if (primitiveType) {
            classNode = this.visitPrimitiveType(primitiveType);
        }
        if (!classNode) {
            throw new Error("Unknown type");
        }
        return classNode;
        */
    }

    visitVariableDeclaratorId(ctx: VariableDeclaratorIdContext): VariableExpression {
        return new VariableExpression(this.visitIdentifier(ctx.identifier()));
    }

    visitIdentifier(ctx: IdentifierContext) {
        return ctx.text;
    }

    visitLambdaBody(ctx: LambdaBodyContext): Statement {
        let statement = ctx.statementExpression();
        let block = ctx.block();
        if (statement) {
            return this.visit(statement);
        }
        if (block) {
            return this.visitBlock(block);
        }
        throw new Error("Unsupported lambda body");
    }

    visitBlock(ctx: BlockContext) {
        if (!ctx) {
            return this.createBlockStatement();
        }
        return this.visitBlockStatementsOpt(ctx.blockStatementsOpt());
    }
    visitBlockStatementsOpt(ctx: BlockStatementsOptContext): BlockStatement {
        let blockS = ctx.blockStatements();
        if (blockS) {
            return this.visitBlockStatements(blockS);
        }
        return this.createBlockStatement();
    }

    visitBlockStatements(ctx: BlockStatementsContext): BlockStatement {
        let stmts: Statement[] = ctx.blockStatement().map((bs) => this.visitBlockStatement(bs)).filter(notNull);
        return this.createBlockStatement(...stmts);
    }

    visitBlockStatement(ctx: BlockStatementContext): Statement | null {
        let localVar = ctx.localVariableDeclaration();
        if (localVar) {
            return this.visitLocalVariableDeclaration(localVar);
        }
        let stmt = ctx.statement();
        if (stmt) {
            let node = this.visit(stmt);
            if (!node) { return null; }
            if (node instanceof Statement) {
                return node;
            } else {
                throw new Error(`${node} is not a valid Statement`);
            }
        }
        throw new Error(`Blank block Statement`);
    }

    visitLocalVariableDeclaration(ctx: LocalVariableDeclarationContext): DeclarationListStatement {
        return this.visitVariableDeclaration(ctx.variableDeclaration());
    }

    visitVariableDeclaration(ctx: VariableDeclarationContext): DeclarationListStatement {
        let declarationExpressionList: DeclarationExpression[] = this.visitVariableDeclarators(ctx.variableDeclarators());
        let size = declarationExpressionList.length;
        // Missing a bunch here
        return new DeclarationListStatement(declarationExpressionList);
    }

    visitVariableDeclarators(ctx: VariableDeclaratorsContext|undefined): DeclarationExpression[] {
        if (!ctx) { return []; }
        return ctx.variableDeclarator().map((vd) => this.visitVariableDeclarator(vd));
    }

    visitVariableDeclarator(ctx: VariableDeclaratorContext): DeclarationExpression {
        let left = new VariableExpression(this.visitVariableDeclaratorId(ctx.variableDeclaratorId()).name, "some type");
        let token: GroovyToken = new GroovyToken(0, "=", ctx.start.line, 1);
        let right = this.visitVariableInitializer(ctx.variableInitializer());
        return new DeclarationExpression(
            left, token, right
        )
    }

    visitVariableInitializer(ctx: VariableInitializerContext|undefined): Expression {
        if (!ctx) { return EmptyExpression.INSTANCE; }
        return this.visitEnhancedStatementExpression(ctx.enhancedStatementExpression());
    }

    createBlockStatement(...statements: Statement[]): BlockStatement {
        return this.appendStatementsToBlockStatement(new BlockStatement(), statements);
    }

    appendStatementsToBlockStatement(bs: BlockStatement, statements: Statement[]): BlockStatement {
        statements.forEach((s) => {
            if (s instanceof DeclarationListStatement) {
                s.declarationStatements.forEach((ds) => bs.statements.push(ds));
            } else {
                bs.statements.push(s);
            }
        });
        return bs;
    }

    getOriginalText(ctx: ParserRuleContext): string {
        return this.lexer.inputStream.getText(Interval.of(ctx.start.startIndex, ctx.stop?.stopIndex || ctx.start.startIndex));
    }


    createBinaryExpression(left: ExpressionContext, op: Token, right: ExpressionContext): BinaryExpression {
        return new BinaryExpression((this.visit(left) as Expression), this.createGroovyToken(op), this.visit(right) as Expression);
    }
    createGroovyToken(token: Token): GroovyToken;
    createGroovyToken(token: Token, cardinality: number): GroovyToken;

    createGroovyToken(token: Token, cardinality?: number): GroovyToken {
        if (cardinality === undefined) {
            return this.createGroovyToken(token, 1);
        }
        let text: string = token.text?.repeat(cardinality) || "";
        return new GroovyToken(
            ("..<" === token.text || ".." === token.text) ? Types.RANGE_OPERATOR : Types.lookup(text, Types.ANY),
            text,
            token.line,
            token.charPositionInLine + 1
        )
    }
    private isInsideParentheses(nodeMetaDataHandler: NodeMetaDataHandler): boolean {
        const insideParenLevel = nodeMetaDataHandler.parenthesisLevel;
        return insideParenLevel > 0;
    }
}