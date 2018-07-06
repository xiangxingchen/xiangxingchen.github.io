---
title: webpack按需加载
date: 2018-07-06 19:23:00
tags: [webpack]
---

# 使用 webpack 的按需加载
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

[深入理解 webpack 文件打包机制](https://github.com/happylindz/blog/issues/6)
