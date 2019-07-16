var fs = require('fs');

//파일을 비동기시 IO로 읽어 들입니다.
fs.readFile('./READE.md', 'utf8', function(err, data){
    //읽어 들인 데이터를 출력
    console.log(data);
});

console.log('프로젝트 폴더 안의 READE.md 파일을 읽도록 요청했습니다.');