
var result = 0;
console.time('duration_sum');

for(var i = 1; i <= 10; i++){
    result += i;
}

console.timeEnd('duration_sum');
console.log('1 부터 10까지 더한 결과물 : %d', result);
console.log('현재 실행한 파일의 이름 : %s', __filename);
console.log('현재 실행한 파일의 패스 : %s', __dirname);

var Person = {name : "소녀시대", age : 20};
console.log(Person); // console.log 와 console.dir 같은 기능.
console.dir(Person);