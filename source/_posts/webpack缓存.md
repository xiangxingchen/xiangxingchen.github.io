---
title: webpack 缓存
date: 2018-07-10 15:23:00
tags: [webpack, 缓存]
categories: 前端工程
---
# webpack 缓存
webpack 中进行持久化缓存的呢，我们需要做到以下两点：
- 保证 hash 值的**唯一性**，即为每个打包后的资源生成一个独一无二的 hash 值，只要打包内容不一致，那么 hash 值就不一致。
- 保证 hash 值的**稳定性**，我们需要做到修改某个模块的时候，只有受影响的打包后文件 hash 值改变，与该模块无关的打包文件 hash 值不变。

hash 文件名是实现持久化缓存的第一步，目前 webpack 有两种计算 hash 的方式([hash] 和 [chunkhash])
- hash 代表每次 webpack 在编译的过程中会生成唯一的 hash 值，在项目中任何一个文件改动后就会被重新创建，然后 webpack 计算新的 hash 值。
- chunkhash 是根据模块计算出来的 hash 值，所以某个文件的改动只会影响它本身的 hash 值，不会影响其他文件。

所以如果你只是单纯地将所有内容打包成同一个文件，那么 hash 就能够满足你了，如果你的项目涉及到拆包，分模块进行加载等等，那么你需要用 chunkhash，来保证每次更新之后只有相关的文件 hash 值发生改变。
<!-- more -->
所以我们在一份具有持久化缓存的 webpack 配置应该长这样：
```js
// 通过 config/webpack.config.js 打包
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        index: './src/index.js',
    },
    output: {
        filename: '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, 'dist')
    }
};
```

上面代码的含义就是：以 index.js 为入口，将所有的代码全部打包成一个文件取名为 index.xxxx.js 并放到 dist 目录下，现在我们可以在每次更新项目的时候做到生成新命名的文件了。

如果是应付简单的场景，这样做就够了，但是在大型多页面应用中，我们往往需要对页面进行性能优化：

- 分离业务代码和第三方的代码：之所以将业务代码和第三方代码分离出来，是因为业务代码更新频率高，而第三方代码更新迭代速度慢，所以我们将第三方代码(库，框架)进行抽离，这样可以充分利用浏览器的缓存来加载第三方库。
- 按需加载：比如在使用 React-Router 的时候，当用户需要访问到某个路由的时候再去加载对应的组件，那么用户没有必要在一开始的时候就将所有的路由组件下载到本地。
- 在多页面应用中，我们往往可以将公共模块进行抽离，比如 header, footer 等等，这样页面在进行跳转的时候这些公共模块因为存在于缓存里，就可以直接进行加载了，而不是再进行网络请求了。

那么如何进行拆包，分模块进行加载，这就需要 webpack 内置插件：CommonsChunkPlugin，下面我将通过一个例子，来诠释 webpack 该如何进行配置。

```js
// src/pageA.js
import componentA from './common/componentA';

// 使用到 jquery 第三方库，需要抽离，避免业务打包文件过大
import $ from 'jquery';

// 加载 css 文件，一部分为公共样式，一部分为独有样式，需要抽离
import './css/common.css'
import './css/pageA.css';

console.log(componentA);
console.log($.trim('    do something   '));

// src/pageB.js
// 页面 A 和 B 都用到了公共模块 componentA，需要抽离，避免重复加载
import componentA from './common/componentA';
import componentB from './common/componentB';
import './css/common.css'
import './css/pageB.css';

console.log(componentA);
console.log(componentB);

// 用到异步加载模块 asyncComponent，需要抽离，加载首屏速度
document.getElementById('xxxxx').addEventListener('click', () => {
  import( /* webpackChunkName: "async" */
    './common/asyncComponent.js').then((async) => {
      async();
  })
})

// 公共模块基本长这样
export default "component X";
```
上面的页面内容基本简单涉及到了我们拆分模块的三种模式：拆分公共库，按需加载和拆分公共模块。那么接下来要来配置 webpack：

```js
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
  entry: {
    pageA: [path.resolve(__dirname, './src/pageA.js')],
    pageB: path.resolve(__dirname, './src/pageB.js'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'js/[name].[chunkhash:8].js',
    chunkFilename: 'js/[name].[chunkhash:8].js'
  },
  module: {
    rules: [
      {
        // 用正则去匹配要用该 loader 转换的 CSS 文件
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader"]
        })  
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      minChunks: 2,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: ({ resource }) => (
        resource && resource.indexOf('node_modules') >= 0 && resource.match(/\.js$/)
      )
    }),
    new ExtractTextPlugin({
      filename: `css/[name].[chunkhash:8].css`,
    }),
  ]
}
```

第一个 CommonsChunkPlugin 用于抽离公共模块，相当于是说 webpack 大佬，如果你看到某个模块被加载两次即以上，那么请你帮我移到 common chunk 里面，这里 minChunks 为 2，粒度拆解最细，你可以根据自己的实际情况，看选择是用多少次模块才将它们抽离。

第二个 CommonsChunkPlugin 用来提取第三方代码，将它们进行抽离，判断资源是否来自 node_modules，如果是，则说明是第三方模块，那就将它们抽离。相当于是告诉 webpack 大佬，如果你看见某些模块是来自 node_modules 目录的，并且名字是 .js 结尾的话，麻烦把他们都移到 vendor chunk 里去，如果 vendor chunk 不存在的话，就创建一个新的。

这样配置有什么好处，随着业务的增长，我们依赖的第三方库代码很可能会越来越多，如果我们专门配置一个入口来存放第三方代码，这时候我们的 webpack.config.js 就会变成：

```js
// 不利于拓展
module.exports = {
  entry: {
    app: './src/main.js',
    vendor: [
      'vue',
      'axio',
      'vue-router',
      'vuex',
      // more
    ],
  },
}
```
第三个 ExtractTextPlugin 插件用于将 css 从打包好的 js 文件中抽离，生成独立的 css 文件，想象一下，当你只是修改了下样式，并没有修改页面的功能逻辑，你肯定不希望你的 js 文件 hash 值变化，你肯定是希望 css 和 js 能够相互分开，且互不影响。

运行 webpack 后可以看到打包之后的效果:

```
├── css
│   ├── common.2beb7387.css
│   ├── pageA.d178426d.css
│   └── pageB.33931188.css
└── js
    ├── async.03f28faf.js
    ├── common.2beb7387.js
    ├── pageA.d178426d.js
    ├── pageB.33931188.js
    └── vendor.22a1d956.js
```
可以看出 css 和 js 已经分离，并且我们对模块进行了拆分，保证了模块 chunk 的唯一性，当你每次更新代码的时候，会生成不一样的 hash 值。

唯一性有了，那么我们需要保证 hash 值的稳定性，试想下这样的场景，你肯定不希望你修改某部分的代码(模块，css)导致了文件的 hash 值全变了，那么显然是不明智的，那么我们去做到 hash 值变化最小化呢？

换句话说，我们就要找出 webpack 编译中会导致缓存失效的因素，想办法去解决或优化它？影响 chunkhash 值变化主要由以下四个部分引起的：
- 包含模块的源代码
- webpack 用于启动运行的 runtime 代码
- webpack 生成的模块 moduleid(包括包含模块 id 和被引用的依赖模块 id)
- chunkID

这四部分只要有任意部分发生变化，生成的分块文件就不一样了，缓存也就会失效，下面就从四个部分一一介绍：
## 一、源代码变化：
显然不用多说，缓存必须要刷新，不然就有问题了
## 二、webpack 启动运行的 runtime 代码：


```js
module.exports = {
  // ...
  plugins: [
    // ...
    // 放到其他的 CommonsChunkPlugin 后面
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime',
      minChunks: Infinity,
    }),
  ]
}
```


## 三、webpack 生成的模块 moduleid

```js
module.exports = {
  plugins: [
    new webpack.HashedModuleIdsPlugin(),
    // 放在最前面
    // ...
  ]
}
```
## 四、chunkID
实际情况中分块的个数的顺序在多次编译之间大多都是固定的, 不太容易发生变化。

这里涉及的只是比较基础的模块拆分，还有一些其它情况没有考虑到，比如异步加载组件中包含公共模块，可以再次将公共模块进行抽离。形成异步公共 chunk 模块。有想深入学习的可以看这篇文章：[Webpack 大法之 Code Splitting](https://zhuanlan.zhihu.com/p/26710831)

# webpack 做缓存的一些注意点
- CSS 文件 hash 值失效的问题
- 不建议线上发布使用 DllPlugin 插件

## CSS 文件 hash 值失效的问题：
ExtractTextPlugin 有个比较严重的问题，那就是它生成文件名所用的[chunkhash]是直接取自于引用该 css 代码段的 js chunk ；换句话说，如果我只是修改 css 代码段，而不动 js 代码，那么最后生成出来的 css 文件名依然没有变化。

所以我们需要将 ExtractTextPlugin 中的 chunkhash 改为 contenthash，顾名思义，contenthash 代表的是文本文件内容的 hash 值，也就是只有 style 文件的 hash 值。这样编译出来的 js 和 css 文件就有独立的 hash 值了。


```js
module.exports = {
  plugins: [
    // ...
    new ExtractTextPlugin({
      filename: `css/[name].[contenthash:8].css`,
    }),
  ]
}
```

## 不建议线上发布使用 DllPlugin 插件
我认为的正确的姿势是：

像 React、Vue 这样整体性偏强的库，可以生成 vendor 第三方库来去做缓存，因为你一般技术体系是固定的，一个站点里面基本上都会用到统一技术体系，所以生成 vendor 库用于缓存。
像 antd、lodash 这种功能性组件库，可以通过 tree shaking 来进行消除，只保留有用的代码，千万不要直接打到 vendor 第三方库里，不然你将大量执行无用的代码。

# 参考：
[webpack 持久化缓存实践](https://github.com/happylindz/blog/issues/7)