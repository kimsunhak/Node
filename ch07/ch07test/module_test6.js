// 가상으로 require() 함수를 정의해 보면 require() 함수가 내부적으로 처리 되는
// 방식을 이해할 수 있음
var require = function(){
    var exports = {
        getUser : function(){
            return {id : 'test01', name : 'crush'};
        },
        group : {id : 'group01', name : 'friend'}
    }

    return exports;
}

var user = require('...');

function showUser(){
    return user.getUser().name + ' ,' + user.group.name;
}

console.log('사용자 정보 : %s', showUser());