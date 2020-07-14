const request = require('postman-request'); // postman-request 사용하기
const connection = require('../mysql-test/mysql_connection.js')

const baseUrl = 'http://dummy.restapiexample.com/api/v1/employees'

var insert_query = 'insert into employee values '

request.get({url : baseUrl, json : true}, function (error, response, body) {

    if(error != null){console.log('error: '+error)}
    console.log('status code: '+response.statusCode)
    // console.log(response)

    for(let i = 0; i < body.data.length; i++){

        let name = body.data[i].employee_name
        let age = body.data[i].employee_age
        let salary = body.data[i].employee_salary

        // console.log(name +", "+age+", "+salary)

        let values = '(default , "'+name+'", '+age+', '+salary+')'

        connection.query(insert_query+values, [], function(error, results, fields){
            
            if(error != null){console.log('error: '+error)}
            console.log(results)

        })

        if(i == body.data.length - 1){
            
            connection.end()
            
        }
    }
})