const fs = require('fs');
const babelParser = require('@babel/parser');
const babelTraverse = require('@babel/traverse').default;

const mainJs = fs.readFileSync('./main.js', 'utf-8');

// Парсим исходный код в AST-дерево
const ast = babelParser.parse(mainJs, {
  sourceType: 'module',
});

// Функция для извлечения полезной нагрузки
function extractPayload(ast) {
  let payload = {
    stringLiterals: [],
    variables: [],
    functionNames: new Set(),  // Используем Set для уникальных значений
  };

  babelTraverse(ast, {
    // Находим все строковые литералы
    StringLiteral(path) {
      payload.stringLiterals.push(path.node.value);
    },
    // Находим все объявления переменных
    VariableDeclarator(path) {
      payload.variables.push(path.node.id.name);
    },
    // Находим все имена функций
    FunctionDeclaration(path) {
      payload.functionNames.add(path.node.id.name);
    },
    ArrowFunctionExpression(path) {
      if (path.node.id) {
        payload.functionNames.add(path.node.id.name);
      }
    },
  });

  // Преобразуем Set обратно в массив
  payload.functionNames = [...payload.functionNames];

  return payload;
}

// Извлекаем полезную нагрузку из AST
const payload = extractPayload(ast);

// Выводим результат
console.log('Полезная нагрузка:', JSON.stringify(payload, null, 2));
