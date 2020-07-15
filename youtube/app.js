const request = require("postman-request");
const connection = require("../mysql-test/mysql_connection.js");

const baseUrl = "https://www.googleapis.com/youtube/v3/search";
const path =
  "?part=snippet&key=키값&maxResults=20&order=date&type=video&q=고양이";
let encodedPath = encodeURI(path);

request.get({ url: baseUrl + encodedPath, json: true }, function (
  error,
  response,
  body
) {
  if (error != null) {
    console.log("error: " + error);
    // 에러 뜨면 리턴 넣어줘야 함. 아직 리턴 방법 모름.
  }
  if (error == null) {
    console.log("status code: " + response.statusCode);
  }

  let itemsArray = body.items;
  console.log("length: " + itemsArray.length);

  let insert_query =
    "insert into youtube (channelTitle, title, publishedAt, videoId) values ?";

  let values = [];

  for (let i = 0; i < arr.length; i++) {
    // 이렇게 필요한 값을 개별적으로 빼놓으면 나중에 유지보수하기 좋다고 함.
    let channelTitle = itemsArray[i].snippet.channelTitle;
    let title = itemsArray[i].snippet.title;
    let publishedAt = itemsArray[i].snippet.publishedAt;
    let videoId = itemsArray[i].id.videoId;

    values.push([channelTitle, title, publishedAt, videoId]);
  }

  // console.log(values)

  connection.query(insert_query, [values], function (error, results, fields) {
    if (error != null) {
      console.log("error: " + error);
    }
    if (error == null) {
      console.log(results);
    }

    connection.end();
  });
});
