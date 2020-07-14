const request = require('postman-request'); // postman-request 사용하기

const baseUrl = 'http://api.weatherstack.com/'
let queryUrl = baseUrl + 
                'current?access_key=89fc809c26256f5c9944d2eac498c898' + 
                '&query='
let query = 'seoul'

// get 방식으로 가져옴
request.get({url : queryUrl+query, json : true}, function (error, response, body) {
  console.log('error:', error)
  console.log(response.statusCode)
  console.log(body)
  // 온도만 출력하기
  console.log(body.current.temperature)
})