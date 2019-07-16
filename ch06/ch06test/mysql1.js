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

// 사용자를 등록하는 함수
var addUser = function(id, name, age, password, callback){
    console.log('addUser 호출');

    // 커넥션 풀에서 연결 객체를 가져옴
    pool.getConnection(function(err, conn){
        if(err){
            conn.release(); // 반드시 해제
            return;
        }
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

        // 데이터를 객체로 만듬
        var data = {
            id : id,
            name : name,
            age : age,
            password : password
        };

        // SQL문 실행
        var exec = conn.query('insert into users set ?', data, function(err, result){
            conn.release(); // 반드시 해제
            console.log('실행 대상 SQL : ' + exec.sql);

            if(err){
                console.log('SQL 실행 시 오류 발생');
                console.dir(err);

                callback(err, null);

                return;
            }
            
            callback(null, result);
        });
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


app.post('/process/adduser', function(req, res){
    console.log('/process/adduser 호출');

    var paramId = req.param('id');
    var paramName = req.param('name');
    var paramAge = req.param('age');
    var paramPassword = req.param('password');

    if(pool){
        addUser(paramId, paramName, paramAge, paramPassword, function(err, result){
            if(err){
                throw err;
            }

            if(result){
                console.dir(result);

                console.log('inserted' + result.affectedRows + 'rows');

                var insertId = result.insertId;
                console.log('추가한 레코드의 아이디 : ' + insertId);

                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            }else{
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    }else{
        res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
});




//서버 시작
http.createServer(app).listen(app.get('port'), function(){
  console.log('서버가 시작되었습니다. 포트: '+ app.get('port'));

});

