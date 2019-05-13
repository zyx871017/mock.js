(function () {
    const cookie = {
        del_all_cookie: function () {
            var myDate = new Date();
            myDate.setTime(-1000);//设置时间
            var data = document.cookie;
            var dataArray = data.split('; ');
            for (var i = 0; i < dataArray.length; i++) {
                var varName = dataArray[i].split('=');
                document.cookie = varName[0] + '=""; expires=' + myDate.toGMTString();
            }
        },
        delete_cookie: function (name) {
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = this.get_cookie(name);
            if (cval !== null) {
                document.cookie = name + '=;expires=' + exp.toGMTString();
            }
        },
        get_cookie: function (c_name) {
            if (document.cookie.length > 0) {
                var c_start = document.cookie.indexOf(c_name + '=');
                if (c_start !== -1) {
                    c_start = c_start + c_name.length + 1;
                    var c_end = document.cookie.indexOf(';', c_start);
                    if (c_end === -1) {
                        c_end = document.cookie.length;
                    }
                    return decodeURI(document.cookie.substring(c_start, c_end));
                }
            }
            return '';
        }
    };

    function getQueryString(data) {
        var keys = Object.keys(data);
        var queryList = keys.map(function (key) {
            return key + '=' + data[key];
        });
        return queryList.join('&');
    }

    function apiRequest(url, data, type) {
        return new Promise(function (resolve, reject) {
            const ajax = new XMLHttpRequest();
            url += '?username=' + cookie.get_cookie('_adtech_user');
            if (type === 'get') {
                url += '&' + getQueryString(data);
            }
            ajax.open(type, url);
            if (type === 'post') {
                ajax.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
            }
            ajax.send(JSON.stringify(data));

            ajax.onreadystatechange = function () {
                if (ajax.readyState === 4 && ajax.status === 200) {
                    resolve(JSON.parse(ajax.responseText));
                } else if (ajax.readyState === 4) {
                    reject(ajax.responseText);
                }
            };
        });
    }

    module.exports = apiRequest;
})();