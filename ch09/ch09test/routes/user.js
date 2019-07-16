var express = require('express');
var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var fs = require('fs');
var ejs = require('ejs');


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

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname,'public')));

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

// 사용자를 등록하는 함수
var addUser = function(id, name, age, password, callback){
    console.log('addUser 호출됨');

    // 커넥션 풀에서 연결 객체를 가져옴
    pool.getConnection(function(err,conn){
        if(err){
            conn.release();
            return;
        }
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

        //데이터를 객체로 만듬
        var data = {id:id, name:name, age:age, password:password};

        //SQL문을 실행
        var exec = conn.query('insert into users set ?', data, function(err, result){
            conn.release();
            console.log('실행 대상 SQL :' + exec.sql);

            if(err){
                console.log('SQL 실행 시 오류 발생');
                console.dir(err);

                callback(err,null);

                return;
            }
            callback(null,result);
        });
    });
}
// 서버 변수 설정 및 스태틱으로 public 폴더 설정
app.set('port', process.env.PORT || 3000);
app.use('/public', express.static(path.join(__dirname, 'public')));

//View 엔진 설정 
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');


// body-parser, cookie-parser, express-session 사용 설정
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({
  secret:'my key',
  resave:true,
  saveUninitialized:true
}));

//사용자 인증 요청 함수
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
                
                // 뷰 템플레이트를 이용하여 렌더링 후 전송
                var context = {userid:paramId, username:username};
                req.app.render('login 성공', context, function(err, html){
                    if(err){
                        throw err;
                    }
                    console.log('render :' + html);

                    res.end(html);
                });
            }else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div><p>아이디 패스워드를 다시 확인</p></div>');
                res.write("<br><a href='/public/login.html'>다시 로그인</a>");
            }
        });
    }
});

//사용자 추가 요청 함수
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
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            }else{
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
            }
        });
    }else{
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
});

//서버 시작
http.createServer(app).listen(app.get('port'), function(){
  console.log('서버가 시작되었습니다. 포트: '+ app.get('port'));

});

