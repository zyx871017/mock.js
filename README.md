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
        name: 'my_list',
        count: 10,
        url: `http://test.mock.com/get_my_list`,
        get_api_data: (res) => {
            const data = res.data.user_permissions;
            for (let i = 0; i < data.length; i++) {
                data[i].addTime = new Date(data[i].addTime * 1000).toLocaleDateString().split('/').join('-');
            }
            return data;
        },
        data: {
            id: {type: 'Number', unique: true},
            name: {type: 'String', unique: true},
            date: {type: 'String', dataRange: ['2018-06-02', '2018-06-03', '2018-06-04', '2018-06-05', '2018-06-06']},
            level: {type: 'String', dataRange: ['正常', '较敏感', '敏感']},
            group: {type: 'String', unique: true},
            path: 'String'
        },
        api_to_mock_alias: {
            pathId: 'id',
            pathName: 'name',
            addTime: 'date',
            groupName: 'group',
            permissionName: 'level',
            hadoopPath: 'path'
        }
    }
]
```
