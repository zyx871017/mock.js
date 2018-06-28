# mock.js
mock.js 是一个用于根据预设的环境变量，自动生成虚拟数据或者开启面向后端的数据请求的插件。
在配置好需要的数据结构后，即可通过给出的接口获取需要的数据列表，从而简化前端开发时需要模拟假数据所带来的繁琐操作。

### 安装

文件暂未上传到npm中，需要用户将文件复制到本地

新建文件夹在你的一个目录中并进入到该目录，打开git bash命令终端。

```javascript
   git clone https://github.com/zyx871017/mock.js.git
```

将里面的`api.js` `mock.js` 复制粘贴到你的项目的合适目录中。

### 使用

在项目中我们需要定义想要获取的数据的结构，因此我们需要对结构进行配置

在你们项目中新建一个`mock_config.js`文件
在其中可以写入如下的结构

```javascript
export default [
  {
        name: 'user_list',
        count: 10,
        url: `http://test.mock.com/get_user_list`,
        get_api_data: (res) => {
            const data = res.data.user_list;
            for (let i = 0; i < data.length; i++) {
                data[i].addTime = new Date(data[i].addTime * 1000).toLocaleDateString().split('/').join('-');
            }
            return data;
        },
        data: {
            id: {type: 'Number', unique: true},
            name: {type: 'String', unique: true},
            born: {type: 'String', dataRange: ['2018-06-02', '2018-06-03', '2018-06-04', '2018-06-05', '2018-06-06']},
            sex: {type: 'number', dataRange: [0, 1]},
            class: 'String'
        },
        api_to_mock_alias: {
            userId: 'id',
            userName: 'name',
            born: 'born',
            sex: 'sex',
            class: 'class'
        }
    }
]
```

在你的项目中建立一个你想用于接口定义的文件，比如request.js

#### mock.js
如果我们只希望插件提供数据虚拟方法，但是接口定义要在别的地方进行，我们可以在request.js中这样做

```javascript
import Mock from './mock.js';
import mock_config from './mock_config.js';

const mock = new Mock(mock_config);

export default {
   get_user_list: () => {
      return mock.get('user_list').then(res=>{
         console.log(res);
         return res;
      })
   }
}
```
此时，生成的数据会存储在mock对象中，我们可以通过`get_data`方法获取存储的数据。
如果我们希望对数据进行某些修改，只需将数据取出，做相应修改后再调用`save_data`方法，将修改的数据存回。

```javascript
export default {
   get_user_list: () => {
      return mock.get('user_list').then(res => {
         console.log(res);
         return res;
      })
   },
   change_user_class: data => {
      return mock.get('user_list').then(res => {
         res[data.index].class = data.newClass;
         mock.save_data(res, 'user_list');
         return {status: 200, msg: 'success'};
      })
   }
}
```

`这里目前有一个小的BUG，获取的数据是引用类型，这样做修改会直接修改响应数据，所以，save_data之前相应数据已经修改，后续会对这里的bug进行修复。`

#### api.js

这里我们不仅仅只是做了mock.js的封装用于虚拟数据获取，同时我们将接口定义也做了封装，方便与数据获取后自动将后端定义的数据字段转译成我们开发时定义的数据字段。

如果我们同时需要插件自动将数据转译的话，我们可以将api.js和mock_config引入到request.js中

```javascript
import Api from './api.js';
import mock_config from './mock_config.js';
```

此时，需要的文件便成功引入到项目中，我们初始化一个api对象，并将mock结构传入对象中，api.js可以自动解析结构，在需要时，获取我们想要的数据。

```javascript
const api = new Api(mock_config);

/*我们可以在这里定义其他需要的接口，将所有请求整合成一个对象。
api.do_other_request = ()=>{
   ajax(url).then(res=>(ok)
}*/

export default api;
```

此时，我们为api.js注册了结构中的用户数据，api会自动暴露一个以结构中name字段命名的方法
```javascript
   api.user_list().then(res=>{console.log(res);})
```
这样我们只需在我们需要的文件中引入request.js文件，并调用对应的数据获取方法即可。

当我们开发完成后，需要和后端进行联调时，我们希望通过Api.js从后台获取数据，并屏蔽掉mock.js的虚拟数据。这里我们只需要在webpack.config.js文件中做如下定义。

```javascript
const webpack = require('webpack');

module.exports = {
   plugins:[
      new webpack.DfinePlugin({
         JS_ENV: JSON.stringify(process.env.JS_ENV)
      })
   ]
}
```

另外我们要在package.json中做如下定义，从而可以设置全局环境变量

```javascript
   {
      "script": {
         "mock": "set JS_ENV=mock&& webpack-dev-server --config webpack/webpack.dev.js",
         "start": "set JS_ENV=test&& webpack-dev-server --config webpack/webpack.dev.js"
   }
```
这里需要注意一下，`set`命令在linux系统中不生效，需要替换为`export`;
这样我们在启动调试服务器时，只需要执行
```javascript
   npm run mock
```

在联调和测试时可以执行
```javascript
   npm start
```


### 结构定义

在mock_config.js中我们根据需要可以定义自己的数据结构和一些额外的配置

#### mock.js

如果系统需要
