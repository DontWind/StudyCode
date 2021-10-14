function Promise(executor) {
  // 添加属性
  this.PromiseStates = 'pending';
  this.PromiseResult = null;
  // 回调函数数组
  this.callbacks = [];
  // 保存实例对象的this值
  const self = this;

  // 成功函数
  function resolve(data) {
    // 判断状态是否为 pending
    if (self.PromiseStates !== 'pending') return;
    // 修改对象状态为成功
    self.PromiseStates = 'fulfilled';
    // 设置对象结果值
    self.PromiseResult = data;
    // 循环执行回调函数
    setTimeout(() => {
      while (self.callbacks.length) {
        const { onResolved } = self.callbacks.shift();
        onResolved(data);
      }
    });
  }

  // 失败函数
  function reject(data) {
    // 判断状态是否为 pending
    if (self.PromiseStates !== 'pending') return;

    // 修改对象状态为失败
    self.PromiseStates = 'rejected';
    // 设置对象结果值
    self.PromiseResult = data;

    // 循环执行回调函数
    setTimeout(() => {
      while (self.callbacks.length) {
        const { onRejected } = self.callbacks.shift();
        onRejected(data);
      }
    });
  }

  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

Promise.prototype.then = function (onResolved, onRejected) {
  const self = this;
  if (typeof onRejected !== 'function') {
    onRejected = reason => {
      throw reason;
    };
  }
  if (typeof onResolved !== 'function') {
    onResolved = value => value;
  }
  return new Promise((resolve, reject) => {
    // 封装函数
    function callback(type) {
      try {
        let result = type(self.PromiseResult);
        if (result instanceof Promise) {
          result.then(
            v => resolve(v),
            r => reject(r)
          );
        } else {
          // 结果的对象状态为成功
          resolve(result);
        }
      } catch (e) {
        reject(e);
      }
    }
    // 根据PromiseStates状态执行函数
    if (this.PromiseStates === 'fulfilled') {
      setTimeout(() => {
        callback(onResolved);
      });
    }
    if (this.PromiseStates === 'rejected') {
      setTimeout(() => {
        callback(onRejected);
      });
    }
    // 判断 pending状态
    if (this.PromiseStates === 'pending') {
      // 保存回调函数
      this.callbacks.push({
        onResolved: function (data) {
          callback(onResolved);
        },
        onRejected: function (data) {
          callback(onRejected);
        },
      });
    }
  });
};

Promise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected);
};

Promise.resolve = function (value) {
  return new Promise((resolve, reject) => {
    if (value instanceof Promise) {
      value.then(
        v => resolve(v),
        r => reject(r)
      );
    } else {
      resolve(value);
    }
  });
};

Promise.reject = function (value) {
  return new Promise((resolve, reject) => {
    reject(value);
  });
};

Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    // 声明计数变量
    let count = 0;
    // 存储promise成功的结果
    let arr = [];

    for (let i in promises) {
      promises[i].then(
        v => {
          count++;
          arr[i] = v;
          if (count === promises.length) {
            resolve(arr);
          }
        },
        r => {
          reject(r);
        }
      );
    }
  });
};

Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    for (let i in promises) {
      promises[i].then(
        v => {
          resolve(v);
        },
        r => {
          reject(r);
        }
      );
    }
  });
};
// module.exports = Promise;
