const { declare } = require("@babel/helper-plugin-utils");
const { codeFrameColumns } = require("@babel/code-frame");
const t = require("@babel/types");
const eqLintPlugin = declare((api, options, dirname) => {
  api.assertVersion(7);
  let code = options.code;
  return {
    pre(file) {
      file.set("errors", []);
    },
    visitor: {
      BinaryExpression(path, state) {
        const errors = state.file.get("errors");
        if (["==", "!="].includes(path.node.operator)) {
          const left = path.node.left;
          const right = path.node.right;
          if (
            !(
              t.isLiteral(left) &&
              t.isLiteral(right) &&
              typeof left.value === typeof right.value
            )
          ) {
            errors.push(
              codeFrameColumns(
                code,
                {
                  start: {
                    line: path.node.loc.start.line,
                    column: path.node.loc.start.column,
                  },
                  end: {
                    line: path.node.loc.end.line,
                    column: path.node.loc.end.column,
                  },
                },
                {
                  message: `errors[${errors.length}]:plz replace the ${path.node.operator} with ${path.node.operator}=`,
                }
              )
            );

            if (state.opts.fix) {
              path.node.operator = path.node.operator + "=";
            }
          }
        }
      },
    },
    post(file) {
      console.log(file.get("errors"));
    },
  };
});

module.exports = eqLintPlugin;
