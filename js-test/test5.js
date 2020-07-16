const url = require("url");
const queryString = require("querystring");

const parsedUrl = url.parse(
  "https://www.gilbut.co.kr/?page=3&limit=10&category=nodejs&category=javascript"
); // url의 쿼리 부분(? 뒤) 문자열만 가져오는 함수
const query = queryString.parse(parsedUrl.query);
console.log("queryString.parse():", query);
console.log("queryString.stringify():", queryString.stringify(query)); // json에 stringify를 하면 json을 문자열로 보여준다.
