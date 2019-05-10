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
    var SPECIAL_SYMBOL = '~`!@#$%^&*()_+-=[]{}<>?/';

    function getDataFromRange(dataRange, fixed) {
        if (dataRange instanceof Array) {
            var arrayLength = dataRange.length;
            return dataRange[Math.floor(Math.random() * arrayLength)];
        } else {
            var min = dataRange.min;
            var max = dataRange.max;
            fixed = fixed || 0;
            var num = min + Math.floor(Math.random() * (max - min))
            return parseFloat(num.toFixed(fixed));
        }
    }

    function getStringData(name, maxLength, minLength, hasSpecialSymbol) {
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

    function initModalData(obj) {

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
    };

    /**
     * 重新定义所有模型，这个方法会覆盖掉之前定义的所有模型
     * **/
    Mock.prototype.defineModelConfig = function (config) {
        if (!config) {
            console.error('没有传入对应的config类型...');
            return;
        }
        this.config = config;
        this.dataList = {};
    };

    module.exports = Mock;
})();