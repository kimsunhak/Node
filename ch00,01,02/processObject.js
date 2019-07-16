console.log('argv 속성의 파라미터 수 : ' + process.argv.length);
console.dir(process.argv);

if(process.argv.length > 2){
    console.log('세 번째 파라미터의 값 : %s', process.argv[2]);
}

process.argv.forEach(function(item, index){
    console.log(index + ' : ' , item);
});

console.dir(process.env);

console.log('JAVA_HOME 환경 변수의 값 : ' + process.env[JAVA_HOME]);