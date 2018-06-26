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
 *              dataRange: 范围随机选择{lowest: 18, biggest: 30}||[18,19,20,...,30],
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

class Mock {
    constructor(config) {
        this.model_config = config || [];
        this.data_list = {};
    }

    add_model(obj) {
        for (let i = 0; i < this.model_config.length; i++) {
            if (this.model_config[i].name = obj.name) {
                console.warn('已存入相同名称的模型！');
                return;
            }
        }
        this.model_config.push(obj);
    }

    define_model_config(config) {
        this.model_config = config;
    }

    edit_model(obj) {
        for (let i = 0; i < this.model_config.length; i++) {
            if (this.model_config[i].name = obj) {
                this.model_config[i] = Object.assign(this.model_config[i], obj);
            }
        }
    }

    save_data(data, name) {
        this.data_list[name] = data;
    }

    get_data(name) {
        for (let i = 0; i < this.model_config.length; i++) {
            if (this.model_config[i].name === name) {
                /*使用Promise模拟数据异步请求*/
                return new Promise((resolve, reject) => {
                    /*判断想要获取的数据是否已经初始化过，如果初始化过，返回存储的数据，否则初始化数据并返回*/
                    if (this.data_list[name]) {
                        resolve(this.data_list[name]);
                    } else {
                        this.data_list[name] = this._get_single_data(this.model_config[i].data, this.model_config[i].count);
                        resolve(this.data_list[name]);
                    }
                });
            }
        }
        console.warn('没有找到需要的数据！');
    }

    _parse_alias(alias, res) {
        if (res instanceof Array) {
            return res.map(item => {
                return this._parse_alias(alias, item);
            });
        } else if (res instanceof Object) {
            const obj = {};
            Object.keys(res).forEach(key => {
                const mock_key = alias[key] || key;
                obj[mock_key] = this._parse_alias(alias, res[key]);
            });
            return obj;
        } else {
            return res;
        }
    }

    /**针对每一个model生成一组数据*/
    _get_single_data(model, count) {
        const keys = Object.keys(model);
        const result = [];
        for (let i = 1; i <= count; i++) {
            let obj = {};
            for (let key_index = 0; key_index < keys.length; key_index++) {
                const key = keys[key_index];
                if (typeof model[key] === 'string') {
                    obj = Object.assign(obj, this._get_obj(key, model[key]));
                } else {
                    if (!model[key].type) {
                        throw new Error('type is required attribute');
                    }
                    const data = model[key].data;
                    const unique = model[key].unique || false;
                    const dataRange = model[key].dataRange;
                    if (unique) {
                        obj = Object.assign(obj, this._get_obj(key, model[key].type, true, i));
                    }
                    if (dataRange instanceof Array) {
                        obj[key] = dataRange[Math.floor(Math.random() * dataRange.length)];
                    } else if (dataRange instanceof Object) {
                        const low = dataRange.lowest;
                        const big = dataRange.biggest;
                        obj[key] = low + Math.floor(Math.random() * (big - low));
                    }
                    if (typeof data !== 'undefined') {
                        obj[key] = this._parse_data(model[key]);
                    }
                }
            }
            result.push(obj);
        }
        return result;
    }

    _parse_data(obj) {
        if (typeof obj.data !== 'object') {
            return obj.data;
        }
        if (obj.type === 'Array') {
            this._get_single_data(obj.data, obj.count);
        }
    }

    _get_obj(key, type, unique, index) {
        const obj = {};
        switch (type) {
            case 'String' :
                obj[key] = key + (unique ? index : '');
                return obj;
            case 'Number':
                obj[key] = unique ? index : Math.ceil(Math.random() * 10);
                return obj;
            case 'Boolean':
                obj[key] = Math.random() > 0.5 ? true : false;
                return obj;
        }
    }
}

module.exports = Mock;