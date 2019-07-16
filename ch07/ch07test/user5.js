// module.exports가 사용되면 exports는 무시됨
module.exports = {
    getUser : function(){
        return {id : 'test01', name : 'crush'}
    },
    group : {id : 'group01', name : 'friend'}
}

exports.group = {id : 'group02', name : '가족'};

