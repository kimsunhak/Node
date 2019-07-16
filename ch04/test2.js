process.on('exit', function(){
    console.log('exit 실행');
});

setTimeout(function(){
    console.log('2초 후에 시스템 종료');
    process.exit();
},2000);

