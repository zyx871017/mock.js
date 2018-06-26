let Mock;
if (JS_ENV === 'mock') {
    Mock = require('./mock');
}

class api {
    constructor(config) {
        this._api_config = config || [];
        if (JS_ENV === 'mock' && Mock) {
            this._mock = new Mock(config);
            if (config && config.length > 0) {
                config.forEach(item => {
                    this[item.name] = () => (this._mock.get_data(item.name))
                });
            }
        } else {
            if (config && config.length > 0) {
                config.forEach(item => {
                    this[item.name] = data => {
                        return this._api_request(item.url, data, item.type);
                    }
                });
            }
        }
    }

    define_api(name, fn) {
        this[name] = fn;
    }

    _define_data_api() {

    }

    _get_query_string(data) {
        const keys = Object.keys(data);
        const query_list = keys.map(key => {
            return `${key}=${data[key]}`;
        });
        return query_list.join('&');
    }

    _api_request(url, data, type = 'get') {
        return new Promise((resolve, reject) => {
            const ajax = new XMLHttpRequest();

            if (type.toLowerCase() === 'get' && data) {
                url += `?${this._get_query_string(data)}`;
            }
            ajax.open(type, url);
            ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            ajax.send('req_data=' + JSON.stringify(data));

            ajax.onreadystatechange = () => {
                if (ajax.readyState === 4 && ajax.status === 200) {
                    resolve(JSON.parse(ajax.responseText));
                } else if (ajax.readyState === 4) {
                    reject(ajax.responseText);
                }
            };
        });
    }
}

export default api;