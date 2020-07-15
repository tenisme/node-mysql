const request = require('postman-request'); // postman-request 사용하기
const connection = require('../mysql-test/mysql_connection.js')

const baseUrl = 'http://dummy.restapiexample.com'
let path = '/api/v1/employees' // base url과 path(경로)는 확실히 구분한다.

request.get({url : baseUrl+path, json : true}, function (error, response, body) {

    // response에는 http 통신을 통해 들어온 전체 데이터를 다 받는다
    // body에는 json 몸통만 들어온다(이걸 쓴다)

    if(error != null){console.log('error: '+error)}
    if(error == null){
        console.log('status code: '+response.statusCode)
        console.log('status: '+body.status)
    }

    let arr = body.data // array 줄임 처리

    // // 쿼리(문자열) 처리 방법 1 예시(기존 방법)
    // // let values = '("'+arr[i].employee_name+'", '+arr[i].employee_salary+', '+arr[i].employee_age+')'

    // // ★쿼리(문자열) 처리 방법 2 : ``과 ${} 사용 - 이게 더 좋음!★
    //     // `는 역슬래시를 안 넣고 엔터를 쳐도 하나의 문장으로 인식한다
    // // 2-1. values 뒤에 반복되는 인서트문은 제외한 문장을 insert_query를 초기화
    // let insert_query = `insert into employee (name, salary, age) values `
    // // 2-2. for문을 돌려서 insert_query에 반복되는 문장을 붙인다
    // for(let i = 0; i < arr.length; i++){
    //     insert_query = insert_query + 
    //                    `("${arr[i].employee_name}", ${arr[i].employee_salary}, ${arr[i].employee_age}),\n`
    // }
    // // 2-3. 마지막 문자인 ,과 \n을 .slice()로 지운다
    // insert_query = insert_query.slice(0, -2)
    // console.log(insert_query)
    // // 2-4. 완성된 insert_query를 query() 함수에 추가하고 connection.end()로 마무리한다
    // connection.query(insert_query, [], function(error, results, fields){
    
    //     if(error != null){console.log('error: '+error)}
    //     console.log(results)

    //     connection.end()

    // })
    // // 방법 2 끝

    // // ★쿼리(문자열) 처리 방법 3 : ?(물음표) 사용 - 이게 더 좋은가?★

    // // 쿼리(문자열) 처리 방법 3-1 : 물음표 여러개를 써서 처리하기
    // // 3-1-1. 가변적인 데이터가 들어가는 모든 곳에 ?(물음표) 처리한다. (문자열이 들어가도 ""표시는 필요없다)
    // let insert_query = 'insert into employee (name, salary, age) values (?,?,?)'
    // // 3-1-2. (?,?,?) 안에 들어갈 값들을 순서대로 깔아둔 array값을 만든다
    //     // ?에 들어가는 규칙은 [](array)안에 추가해야 한다.
    //     // ??? 이거는 for문을 어떻게 돌리지?
    // let values = [arr[0].employee_name, arr[0].employee_salary, arr[0].employee_age]
    // // 3-1-3. insert_query와 values를 query() 함수에 순서대로 추가하고 connection.end()로 마무리한다
    // connection.query(insert_query, values, function(error, results, fields){
    
    //     if(error != null){console.log('error: '+error)}
    //     console.log(results)

    //     connection.end()

    // })
    // // 방법 3-1 끝

    // 쿼리(문자열) 처리 방법 3-2 : 물음표 하나를 써서 처리하기
    // 3-1-1. 물음표 처리는 values 뒤에 ?(물음표) 하나만 쓴다
    let insert_query = 'insert into employee (name, salary, age) values ?'
    // 3-2-2. array 속성값을 가진 values 변수를 만든다
    let values = []
    // 3-2-3 : for문 처리 - values 어레이 안에 n가지 데이터가 들어있는 어레이를 .push()를 사용해 0번 자리부터 차례로 추가
    for(let i = 0; i < arr.length; i++){
        values.push([arr[i].employee_name, arr[i].employee_salary, arr[i].employee_age])
    }
    console.log(values)
    // 3-2-4. insert_query와 values를 query() 함수에 순서대로 추가한다
        // 아래 [values]의 뜻은, insert_query의 첫번째 ?(물음표) 가 data라는 뜻이다. 문장에 물음표가 두 개 이상 들어가면 [data, 값2, 값3, ...] 이렇게 적어주면 된다.
    connection.query(insert_query, [values], function(error, results, fields){
    
        if(error != null){console.log('error: '+error)}
        console.log(results)

        connection.end()

    })
    // 방법 3-2 끝

})