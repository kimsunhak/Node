var express = require('express');
var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var fs = require('fs');


// mysql 데이터베이스 모듈
var mysql = require('mysql');

// mysql 데이터베이스 연결 설정
var pool = mysql.createPool({
    connectionLimit : 10,
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'test',
    debug : false
});

var app = express();

// 사용자를 인증하는 함수
var authUser = function(id, password, callback){
    console.log('authUser 호출');

    //컨넥션 풀에서 연결 객체를 가져옴
    pool.getConnection(function(err, conn){
        if(err){
            conn.release();
            return;
        }
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

        var columns = ['id', 'name', 'age'];
        var tablename = 'users';

        //SQL문을 실행
        var exec = conn.query("select ?? from ?? where id = ? and password =?", [columns, tablename, id, password], function(err,rows){
            conn.release();
            console.log('실행 대상 SQL :' + exec.sql);

            if(rows.length > 0){
                console.log('아이디 [%s], 패스워드 [%s]가 일치하는 사용자 찾음', id, password);
                callback(null, rows);
            }else{
                console.log("일치하는 사용자를 찾지 못함");
                callback(null,null);
            }
        })
    });
}
// 서버 변수 설정 및 스태틱으로 public 폴더 설정
app.set('port', process.env.PORT || 3000);
app.use('/public', express.static(path.join(__dirname, 'public')));

// body-parser, cookie-parser, express-session 사용 설정
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({
  secret:'my key',
  resave:true,
  saveUninitialized:true
}));

app.post('/process/login',function(req, res){
    console.log('/process/login 호출');

    var paramId = req.param('id');
    var paramPassword = req.param('password');

    if(pool){
        authUser(paramId, paramPassword, function(err, rows){
            if(err){
                throw err;
            }

            if(rows){
                console.dir(rows);

                var username = rows[0].name;

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 성공</h1>');
                res.write('<div><p>사용자 아이디:' + paramId +'</p></div>');
                res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
                res.write("<br><br><a href='/public/login.html'> 다시 로그인하기</a>");
                res.end();
            }
        });
    }
});


//서버 시작
http.createServer(app).listen(app.get('port'), function(){
  console.log('서버가 시작되었습니다. 포트: '+ app.get('port'));

});

