// require() 메소드는 객체를 반환
var user = require('./user3');

function showUser(){
    return user.getUser().name + ',' + user.group.name;
}

console.log('사용자 정보 : %s', showUser());
