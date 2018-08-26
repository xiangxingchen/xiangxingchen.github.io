---
title: webpack代码分离的三种常用方法
date: 2018-07-06 19:23:00
tags: [webpack]
categories: 前端工程
---


> 代码分离是 webpack 中最引人注目的特性之一。此特性能够把代码分离到不同的 bundle 中，然后可以按需加载或并行加载这些文件。代码分离可以用于获取更小的 bundle，以及控制资源加载优先级，如果使用合理，会极大影响加载时间。

有三种常用的代码分离方法：

- **入口起点**：使用 entry 配置手动地分离代码。
- **防止重复**：使用 CommonsChunkPlugin 去重和分离 chunk。
- **动态导入**：通过模块的内联函数调用来分离代码。
<!-- more -->

# 入口起点
这是迄今为止最简单、最直观的分离代码的方式。不过，这种方式手动配置较多，并有一些陷阱，我们将会解决这些问题。先来看看如何从 main bundle 中分离另一个模块：

```js

// ./src/index.js
import _ from 'lodash';

console.log(
  _.join(['index', 'module', 'loaded!'], ' ')
);

// ./src/page.js
import _ from 'lodash';

console.log(
  _.join(['Another', 'module', 'loaded!'], ' ')
);

// webpack.config.js
const path = require('path');

module.exports = {
  entry: {
    index: './src/index.js',
    another: './src/page.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
```


这将生成如下构建结果：
```js
Hash: 36042176e77df9eaa36e
Version: webpack 4.15.1
Time: 2944ms
Built at: 2018-07-10 11:09:19
            Asset      Size  Chunks             Chunk Names
another.bundle.js  70.4 KiB       0  [emitted]  another
  index.bundle.js  70.4 KiB       1  [emitted]  index
[1] (webpack)/buildin/module.js 497 bytes {0} {1} [built]
[2] (webpack)/buildin/global.js 489 bytes {0} {1} [built]
[3] ./src/page.js 92 bytes {0} [built]
[4] ./src/index.js 90 bytes {1} [built]
    + 1 hidden module
```
正如前面提到的，这种方法存在一些问题:
- 如果入口 chunks 之间包含重复的模块，那些重复模块都会被引入到各个 bundle 中。
- 这种方法不够灵活，并且不能将核心应用程序逻辑进行动态拆分代码。

以上两点中，第一点对我们的示例来说无疑是个问题，因为之前我们在 `./src/index.js` 中也引入过 lodash，这样就在两个 bundle 中造成重复引用。接着，我们通过使用 CommonsChunkPlugin 来移除重复的模块。

# 防止重复(CommonsChunkPlugin)
[CommonsChunkPlugin](https://webpack.docschina.org/plugins/commons-chunk-plugin) 插件可以将公共的依赖模块提取到已有的入口 chunk 中，或者提取到一个新生成的 chunk。让我们使用这个插件，将之前的示例中重复的 lodash 模块去除：

```js
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
      index: './src/index.js',
      another: './src/page.js'
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common' // 指定公共 bundle 的名称。
      })
    ],
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    }
};
```

```js
Hash: 39c6f28cf331e187e2ee
Version: webpack 3.12.0
Time: 353ms
            Asset       Size  Chunks                    Chunk Names
another.bundle.js  541 bytes       0  [emitted]         another
  index.bundle.js  545 bytes       1  [emitted]         index
 common.bundle.js     545 kB       2  [emitted]  [big]  common
   [1] ./src/index.js 90 bytes {1} [built]
   [2] (webpack)/buildin/global.js 509 bytes {2} [built]
   [3] (webpack)/buildin/module.js 517 bytes {2} [built]
   [4] ./src/page.js 92 bytes {0} [built]
    + 1 hidden module
```
# 动态导入(dynamic imports)

当涉及到动态代码拆分时，`webpack` 提供了两个类似的技术。对于动态导入，第一种，也是优先选择的方式是，使用符合 [ECMAScript](https://github.com/tc39/proposal-dynamic-import) 提案 的 [import()](https://webpack.docschina.org/api/module-methods#import-) 语法。第二种，则是使用 webpack 特定的 [require.ensure](https://webpack.docschina.org/api/module-methods#require-ensure)。让我们先尝试使用第一种……

```js
// src/index.js
function getComponent() {
    return import ( /* webpackChunkName: "lodash" */ 'lodash').then(_ => {
        var element = document.createElement('div');
        element.innerHTML = _.join(['Hello', 'webpack'], ' ');
        return element;
    }).catch(error => 'An error occurred while loading the component');
}

getComponent().then(component => {
    document.body.appendChild(component);
})
```

```js
// webpack.config.js
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        index: './src/index.js',
    },
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};
```
> import() 调用会在内部用到 promises。如果在旧有版本浏览器中使用 import()，记得使用 一个 polyfill 库（例如 es6-promise 或 promise-polyfill），来 shim Promise。

```js
Hash: 35f38da1baf5b177d685
Version: webpack 3.12.0
Time: 327ms
           Asset     Size  Chunks                    Chunk Names
lodash.bundle.js   541 kB       0  [emitted]  [big]  lodash
 index.bundle.js  6.24 kB       1  [emitted]         index
   [0] ./src/index.js 407 bytes {1} [built]
   [2] (webpack)/buildin/global.js 509 bytes {0} [built]
   [3] (webpack)/buildin/module.js 517 bytes {0} [built]
    + 1 hidden module
```
由于 import() 会返回一个 promise，因此它可以和 async 函数一起使用。但是，需要使用像 Babel 这样的预处理器和[Syntax Dynamic Import Babel Plugin](https://babeljs.io/docs/en/babel-plugin-syntax-dynamic-import/#installation)。下面是如何通过 async 函数简化代码：



> 注意，这里使用了 chunkFilename，它决定非入口 chunk 的名称。想了解 chunkFilename 更多信息，请查看 [output 相关文档](https://webpack.docschina.org/configuration/output/#output-chunkfilename)。接着，更新我们的项目，移除掉那些现在不会用到的文件:

```js
async function getComponent() {
    var element = document.createElement('div');
    const _ = await import ( /* webpackChunkName: "lodash" */ 'lodash');
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');
    return element;
}

getComponent().then(component => {
    document.body.appendChild(component);
})
```




# 动态导入集合react-router
首先我们要看一看一个加载函数
```js
require.ensure(dependencies, callback, chunkName)
```
这个方法可以实现js的按需加载，分开打包，webpack 管包叫 chunk，为了打包能正常输出，我们先给webpack配置文件配置一下chunk文件输出路径
```js
// webpack.config.js
module.exports = {
  ...
  output: {
    ...
    chunkFilename: '[name].[chunkhash:5].chunk.js',
    publicPath: '/dist/'
  }
  ...
}
```
每个chunk 都会有一个ID，会在webpack内部生成，当然我们也可以给chunk指定一个名字，就是 require.ensure 的第三个参数

配置文件中

- [name] 默认是 ID，如果指定了chunkName则为指定的名字。
- [chunkhash] 是对当前chunk 经过hash后得到的值，可以保证在chunk没有变化的时候hash不变，文件不需要更新，chunk变了后，可保证hash唯一，由于hash太长，这里我截取了hash的5个字符足矣
## 根路由
跟路由有点特殊，它一定要先加载一个组件才能渲染，也就是说，在跟路由不能使用按需加载方式，不过这个没关系，根路由用于基础路径，在所有模块都必须加载，所以他的 "需" 其实作用不大。

# jsx 定义按需加载路由

虽然官方推荐使用对象去定义，但是jsx语法看上去更清晰点，所以还是使用jsx演示，方法很简单，就是把 组件的 props.component 换成 props.getComponent ，函数还是上述例子的函数（记得根路由不要使用getComponent）。

```js
<Router history={history}>
  <Route path="/" component={App}>
    <Route path="home" getComponent={(location, callback) => {
      require.ensure([], require => {
        callback(null, require('modules/home'))
      }, 'home')  
    }}></Route>
    <Route path="blog" getComponent={(location, callback) => {
      require.ensure([], require => {
        callback(null, require('modules/blog'))
      }, 'blog')  
    }}></Route>
  </Route>
</Router>

```

看上去很乱有木有，在jsx中写那么多 js 感觉真难看，把 js 独立出来就是：

```js
const home = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('modules/home'))
  }, 'home')  
}

const blog = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('modules/blog'))
  }, 'blog')  
}

<Router history={history}>
  <Route path="/" component={App}>
    <Route path="home" getComponent={home}></Route>
    <Route path="blog" getComponent={blog}></Route>
  </Route>
</Router>
```
这样整理一下，就好看多了

--------------------------------------
**注意**: 或许有人会想，上面重复代码超级多，能不能用一个函数生成器去生成这些重复的函数呢？代码更进一步优化，比如:
```js
const ensureModule = (name, entry) => (location, callback) => {
  require.ensure([], require => {
    callback(null, require(entry))
  }, name)
}

<Router history={history}>
  <Route path="/" component={App}>
    <Route path="home" getComponent={ensureModule('home', 'modules/home')}></Route>
    <Route path="blog" getComponent={ensureModule('blog', 'modules/blog')}></Route>
  </Route>
</Router>
```
答案是：不能。这样看起来代码没有任何问题，好像更优雅的样子，但是经过亲自实践后，不行！！因为 require函数太特别了，他是webpack底层用于加载模块，所以必须明确的声明模块名，**require函数在这里只能接受字符串，不能接受变量** 。所以还是忍忍算了

## 参考
[webpack官网](https://webpack.docschina.org/guides/code-splitting/)
