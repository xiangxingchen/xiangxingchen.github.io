---
title: webpack 文件打包机制
date: 2018-07-10 15:23:00
tags: [webpack]
categories: 前端工程
---


```js
// dist/index.xxxx.js
(function(modules) {
  // 已经加载过的模块
  var installedModules = {};

  // 模块加载函数
  function __webpack_require__(moduleId) {
    if(installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    module.l = true;
    return module.exports;
  }
  return __webpack_require__(__webpack_require__.s = 3);
})([
/* 0 */
(function(module, exports, __webpack_require__) {
  var util = __webpack_require__(1);
  console.log(util);
  module.exports = "index 2";
}),
/* 1 */
(function(module, exports) {
  module.exports = "Hello World";
}),
/* 2 */
(function(module, exports, __webpack_require__) {
  var index2 = __webpack_require__(0);
  index2 = __webpack_require__(0);
  var util = __webpack_require__(1);
  console.log(index2);
  console.log(util);
}),
/* 3 */
(function(module, exports, __webpack_require__) {
  module.exports = __webpack_require__(2);
})]);
```

将相对无关的代码剔除掉后，剩下主要的代码：

- 首先 webpack 将所有模块(可以简单理解成文件)包裹于一个函数中，并传入默认参数，这里有三个文件再加上一个入口模块一共四个模块，将它们放入一个数组中，取名为 modules，并通过数组的下标来作为 moduleId。
- 将 modules 传入一个自执行函数中，自执行函数中包含一个 `installedModules` 已经加载过的模块和一个模块加载函数，最后加载入口模块并返回。
- `__webpack_require__` 模块加载，先判断 `installedModules` 是否已加载，加载过了就直接返回 `exports` 数据，没有加载过该模块就通过 `modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)` 执行模块并且将 `module.exports` 给返回。

很简单是不是，有些点需要注意的是：
- 每个模块 webpack 只会加载一次,所以重复加载的模块只会执行一次，加载过的模块会放到 `installedModules`，下次需要需要该模块的值就直接从里面拿了。
- 模块的 id 直接通过数组下标去一一对应的，这样能保证简单且唯一，通过其它方式比如文件名或文件路径的方式就比较麻烦，因为文件名可能出现重名，不唯一，文件路径则会增大文件体积，并且将路径暴露给前端，不够安全。
- `modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)` 保证了模块加载时 this 的指向 `module.exports` 并且传入默认参数，很简单，不过多解释。

[深入理解 webpack 文件打包机制](https://github.com/happylindz/blog/issues/6)
