/**
 * obj主要定义模拟的数据结构，定义方法借鉴于sequelize或bookshelf，可参照这两个
 * 库所对应的数据定义方法。
 * example：
 * {
 *      name: 'approval_list',
 *      data:{
 *          name: 'String',
 *          age: {
 *              type: 'Number'||'String'||'Boolean'||'Object'||'Null',
 *              dataRange: 范围随机选择{min: 18, max: 30}||[18,19,20,...,30],
 *              data: 对应数据,
 *              unique: Boolean //是否是非重复数据，可以在后面自动加上序号，
 *          },
 *          class: {
 *              type: 'String',
 *              data: ''
 *          },
 *          students:{
 *              type: 'Array',
 *              count: 10,
 *              data: {
 *                  id: {
 *                      type: 'Number',
 *                      unique: true,
 *                  },
 *                  student_name: {
 *                      type: 'String',
 *                      unique: true
 *                  }
 *              }
 *          }
 *      }
 *      count: 10,
 *      handle_mock_data: data => {
 *          return data.sort((a, b) => return (b.id - a.id););
 *      },
 *      get_api_data: res => {
 *          return res.data.approval_list;
 *      },
 *      url: '',
 *      api_type: 'get',
 *      api_alias:{
 *          pathName: 'name',
 *          userAge: 'age',
 *          class: 'class',
 *      }
 * }
 * **/

(function () {
    require('@babel/polyfill');
    var request = require('./request');

    if (!Object.keys) {
        Object.keys = (function () {
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
                dontEnums = [
                    'toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'
                ],
                dontEnumsLength = dontEnums.length;

            return function (obj) {
                if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

                var result = [];

                for (var prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) result.push(prop);
                }

                if (hasDontEnumBug) {
                    for (var i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
                    }
                }
                return result;
            }
        })()
    }

    var SPECIAL_SYMBOL = '~`!@#$%^&*()_+-=[]{}<>?/';

    function getDataFromRange(dataRange, fixed) {
        if (dataRange instanceof Array) {
            var arrayLength = dataRange.length;
            return dataRange[Math.floor(Math.random() * arrayLength)];
        } else {
            var min = dataRange.min;
            var max = dataRange.max;
            fixed = fixed || 0;
            var num = min + Math.floor(Math.random() * (max - min));
            return parseFloat(num.toFixed(fixed));
        }
    }

    function getNumberData(data, index) {
        if (data.data) {
            return data.data;
        }
        if (data.dataRange) {
            var fixed = data.fixed || 0;
            return getDataFromRange(data.dataRange, fixed);
        }
        return index;
    }

    function getStringDataWithRange(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getStringDataWithLength(name, maxLength, minLength, hasSpecialSymbol) {
        minLength = minLength || 0;
        if (hasSpecialSymbol) {
            name += SPECIAL_SYMBOL;
        }
        var nameLength = name.length;
        var result = '';
        var stringLength = minLength + Math.floor(Math.random() * (maxLength - minLength));
        for (var i = 0; i < stringLength; i++) {
            result += name[Math.floor(Math.random() * nameLength)];
        }
        return result;
    }

    function getBooleanData() {
        return Math.random() > 0.5;
    }

    function verifyOption(obj) {
        if (!obj.count) {
            console.error('没有设置该数据的数量，请在对应数据内部设置count...');
            return false;
        }
        if (!obj.data) {
            console.error('没有定义该表的数据格式，请在对应数据内部设置data...');
            return false;
        }
        return true;
    }

    function getStringData(data, name, index) {
        if (data.data) {
            if (data.unique) {
                return data.data + index;
            }
            return data.data;
        }
        if (data.dataRange) {
            if (data.dataRange instanceof Array) {
                return getStringDataWithRange(data.dataRange);
            } else {
                var key = data.data || name;
                var maxLength = data.dataRange.max;
                var minLength = data.dataRange.min;
                return getStringDataWithLength(key, maxLength, minLength, data.hasSpecialSymbol);
            }
        } else {
            return name + index;
        }
    }

    function getObjData(name, obj, index) {
        var keys = Object.keys(obj);
        var keysLength = keys.length;
        var result = {};
        for (var i = 0; i < keysLength; i++) {
            var key = keys[i];
            var data = obj[key];
            if (data instanceof Object) {
                switch (data.type) {
                    case 'String': {
                        result[key] = getStringData(data, key, index);
                        break;
                    }
                    case 'Number':
                        result[key] = getNumberData(data, index);
                        break;
                    case 'boolean':
                        result[key] = getBooleanData();
                        break;
                    case 'Object':
                        result[key] = getObjData(name, data.data, index);
                        break;
                    case 'Array':
                        result[key] = initModalData(data);
                        break;
                    default:
                        break;
                }
            } else if (obj[key] === 'Number') {
                result[key] = index;
            } else {
                result[key] = key + index;
            }
        }
        return result;
    }

    function initModalData(obj) {
        if (!verifyOption(obj)) {
            return {};
        }
        var count = obj.count || 1,
            result = [];
        for (var i = 0; i < count; i++) {
            result.push(getObjData(obj.name, obj.data, i))
        }
        return result;
    }

    function initAllData(config) {
        var configLength = config.length;
        var initData = {};
        for (var i = 0; i < configLength; i++) {
            initData[config[i].name] = initModalData(config[i]);
        }
        return initData
    }

    function Mock(config) {
        this.config = config || [];
        this.dataList = initAllData(config);
    }

    /**
     * 添加一个新的modal定义
     * */
    Mock.prototype.addModel = function (obj) {
        var configLength = this.config.length;
        for (var i = 0; i < configLength; i++) {
            if (this.config[i].name === obj.name) {
                console.error('已经定义了相同名称的modal，或许你的模型定义名称有问题...');
                return;
            }
        }
        this.config.push(obj);
        this.dataList[obj.name] = initModalData(obj);
    };

    /**
     * 重新定义所有模型，这个方法会覆盖掉之前定义的所有模型
     * **/
    Mock.prototype.defineModelConfig = function (config) {
        if (!config) {
            console.error('没有传入对应的config类型...');
            return;
        }
        this.config = config || [];
        this.dataList = initAllData(config);
    };

    Mock.prototype.getData = function (name) {
        var configList = this.config;
        var configLength = configList.length;
        var configIndex = 0;
        for (var i = 0; i < configLength; i++) {
            if (configList[i].name === name) {
                if (configList[i].url) {
                    return request(configList[i].url, configList[i].requestData, 'get');
                }
                configIndex = i;
                break;
            }
        }
        if (this.dataList[name]) {
            var config = configList[configIndex];
            if (config.handleMockData) {
                return Promise.resolve(config.handleMockData(this.dataList[name]));
            }
            return Promise.resolve(this.dataList[name]);
        } else {
            return Promise.reject({status: 404, msg: '未找到对应数据'});
        }
    };

    Mock.prototype.addData = function (name, data) {
        var configList = this.config;
        var configLength = configList.length;
        var configIndex = 0;
        for (var i = 0; i < configLength; i++) {
            if (configList[i].name === name) {
                if (configList[i].url) {
                    return request(configList[i].url, data, 'post');
                }
                configIndex = i;
                break;
            }
        }
        if (this.dataList[name]) {
            this.dataList[name].push(data);
            return Promise.resolve({status: 0, msg: '添加成功'});
        } else {
            return Promise.reject({status: 404, msg: '未找到对应数据表'});
        }
    };

    function getUniqueKey(config) {
        var keys = Object.keys(config);
        var keyLength = keys.length;
        for (var i = 0; i < keyLength; i++) {
            var key = keys[i];
            if (config[key].unique) {
                return key;
            }
        }
        return null;
    }

    Mock.prototype.updateData = function (name, data) {
        var configList = this.config;
        var configLength = configList.length;
        var uniqueKey = '';
        for (var i = 0; i < configLength; i++) {
            if (configList[i].name === name) {
                if (configList[i].url) {
                    return request(configList[i].url, data, 'post');
                }
                uniqueKey = getUniqueKey(configList[i].data);
                if (!uniqueKey) {
                    return Promise.reject({status: 402, msg: '该数据表没有唯一主键，请对需要设置唯一主键的字段添加"unique:true"...'})
                }
                break;
            }
        }
        if (this.dataList[name]) {
            var dataArr = this.dataList[name];
            var dataLength = dataArr.length;
            for (var i = 0; i < dataLength; i++) {
                if (dataArr[i][uniqueKey] === data[uniqueKey]) {
                    dataArr[i] = data;
                    return Promise.resolve({status: 0, msg: '修改成功'});
                }
            }
            return Promise.reject({status: 403, msg: '未找到对应数据...'});
        } else {
            return Promise.reject({status: 404, msg: '未找到对应数据表...'});
        }
    };

    Mock.prototype.deleteData = function (name, data) {
        var configList = this.config;
        var configLength = configList.length;
        var uniqueKey = '';
        for (var i = 0; i < configLength; i++) {
            if (configList[i].name === name) {
                if (configList[i].url) {
                    return request(configList[i].url, data, 'post');
                }
                uniqueKey = getUniqueKey(configList[i].data);
                if (!uniqueKey) {
                    return Promise.reject({status: 402, msg: '该数据表没有唯一主键，请对需要设置唯一主键的字段添加"unique:true"...'})
                }
                break;
            }
        }
        if (this.dataList[name]) {
            var dataArr = this.dataList[name];
            var dataLength = dataArr.length;
            for (var i = 0; i < dataLength; i++) {
                if (dataArr[i][uniqueKey] === data[uniqueKey]) {
                    dataArr.splice(i, 1);
                    return Promise.resolve({status: 0, msg: '修改成功'});
                }
            }
            return Promise.reject({status: 403, msg: '未找到对应数据...'});
        } else {
            return Promise.reject({status: 404, msg: '未找到对应数据表...'});
        }
    };

    module.exports = Mock;
})();