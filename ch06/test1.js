var express = require('express');
var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var fs = require('fs');
// 모듈 불러들이기
var mongodb = require('mongodb');
var mongoose = require('mongoose');

var app = express();

//서버 변수 설정
app.set('port', process.env.PORT || 3000);
app.use('/public', express.static(path.join(__dirname, 'public')));


// 데이터베이스 연결
var database;
var UserSchema;
var UserModel;

// 데이터베이스에 연결하고 응답 객체의 속성으로 db 객체 추가
function connectDB(){
    
    //데이터베이스 연결 정보
    var databaseUrl = 'mongodb://localhost:27017/shopping';

    // 데이터베이스 연결
    mongoose.connect(databaseUrl,{useNewUrlParser : true});
    database = mongoose.connection;

    database.on('err', console.error.bind(console, 'mongoose connection error.'));
    database.on('open', function(){
        console.log('데이터베이스 연결 : '+ databaseUrl);

        // user 스키마 및 모델 객체 생성
        createUserSchema();
        
        //test 진행
        doTest();
        
    });
    database.on('disconnected', connectDB);
}

//user 스키마 및 모델 객체 생성
function createUserSchema(){

    //스키마 정의
    // password를 hashed_password로 변경, default 속성 모두 추가, salt 속성 추가
    UserSchema = mongoose.Schema({
        id : {type : String, required : true, unique : true},
        name : {type : String, index : 'hashed', 'default':''},
        age :{type : Number, 'default' : -1},
        _created : {type : Data, index : {unique : false}, 'default' : Date.now},
        _updated : {type : Data, index : {unique : false}, 'default' : Date.now}
    });

    // info를 virtual 메소드로 정의
    UserSchema.virual('info').set(function(info){
        var splitted = info.split('');
        this.id = splitted[0];
        this.name = splitted[1];
        console.log('virtual info 설정함 : %s, %s', this.id, this.name);
    })
    .get(function(){
        return this.id + '' + this.name
    });

    console.log('UserScheam 정의');

    // UserModel 모델 정의
    UserModel = mongoose.model("users",UserSchema);
    console.log('UserModel 정의함');
}

function doTest(){
    // UserModel 인스턴스 생성
    // id, name 속성은 할당하지 않고 info 속성만 할당함
    var user = new UserModel({"info" : 'test01 ethan'});

    //save()로 저장
    user.save(function(err){
        if(err){
            throw err;
        }

        console.log("사용자 데이터 추가함");

        findAll();
    });

    console.log('info 속성에 값 할당함');
    console.log('id : %s, name : %s', user.id, user.name);
}

function findAll(){
    UserModel.find({},function(err, results){
        if(err){
            throw err;
        }

        if(reults){
            console.log('조회된 user 문서 객체 #0 -> id : %s, name : %s', results[0]._doc.id, results[0]._doc.name);
        }
    });
}

http.createServer(app).listen(app.get('port'), function(){
    console.log('서버 시작' + app.get('port'));

    connectDB();
});

