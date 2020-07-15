const request = require("postman-request");

const baseUrl = "https://api.mapbox.com";
const path = "/geocoding/v5/mapbox.places/화곡역.json?access_token=토큰값";
let encodedUrl = encodeURI(path);

request.get({ url: baseUrl + encodedUrl, json: true }, function (
  error,
  response,
  body
) {
  // response에는 http 통신을 통해 들어온 전체 데이터를 다 받는다
  // body에는 json 몸통만 들어온다(이걸 쓴다)

  if (error != null) {
    console.log("error: " + error);
  }
  if (error == null) {
    console.log("status code: " + response.statusCode);
    console.log("status: " + body.type);
  }

  // 화곡역의 위도, 경도를 뽑아서 출력하기.
  console.log(body.features[0].center[0]); // 경도
  console.log(body.features[0].center[1]); // 위도
});
