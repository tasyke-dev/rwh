const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const traverse = require('babel-traverse');
const graphviz = require('graphviz');

// Читаем исходный код из файла
const code = fs.readFileSync(path.resolve(__dirname, 'main.js'), 'utf8');

// Преобразуем код в AST с помощью Babel
const ast = babel.parseSync(code, {
  presets: ['@babel/preset-env']
});

// Функция для построения графа зависимости и последовательности исполнения
function buildControlFlowGraph(ast) {
  const graph = graphviz.digraph('G'); // Используем digraph для направленных графов

  // Инициализируем стартовую вершину
  graph.addNode('start', { shape: 'ellipse', label: 'start' });

  // Перебираем AST и строим граф
  traverse.default(ast, {
    enter(path) {
      const node = path.node;

      // Если это вызов функции, добавляем его как вершину
      if (node.type === 'CallExpression') {
        const nodeName = node.callee.name || 'anonymous_function';
        const nodeLabel = `${nodeName}(${node.arguments.map(arg => arg.name || 'value').join(', ')})`;
        graph.addNode(nodeLabel, { shape: 'box' });

        // Связываем с предыдущим узлом
        const parent = path.parent && path.parent.type === 'CallExpression' ? path.parent.callee.name : 'start';
        graph.addEdge(parent, nodeLabel);
      }
    },
  });

  return graph;
}

// Строим граф из AST
const controlFlowGraph = buildControlFlowGraph(ast);

// Сохраняем граф в формате .png
controlFlowGraph.output('png', path.resolve(__dirname, 'control_flow_graph.png'), (err) => {
  if (err) {
    console.error('Ошибка при сохранении графа:', err);
  } else {
    console.log('Граф зависимостей и последовательности исполнения сохранен как control_flow_graph.png');
  }
});
