var express = require('express');
var http = require('http');
var path = require('path');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var expressSession = require('express-session');

var database = require('mysql');
var app = express();

// 뷰 엔진 설정
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs');

//서버 변수 설정 및 스태틱으로 public 폴더 설정
app.set('port', process.env.PORT || 3000);
app.use('/public', express.static(path.join(__dirname,'public')));


//라우터 정보를 읽어들여 라우팅 설정


// 서버 시작

//확인되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지
process.on('uncaughtException', function(err){
  console.log('uncaughtException : ' + err);
  console.log('서버 프로세스 종료하지 않고 유지');

  console.log(err.stack);
});
//프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function(){
  console.log("프로세스가 종료");
  app.close();
});

app.on('close', function(){
  console.log("express 서버 객체가 종료됨");
  if(database.db){
    database.db.close();
  }
});

var server = http.createServer(app).listen(app.get('port'),function(){
  console.log('서버 시작 : ' + app.get('port'));

  
});