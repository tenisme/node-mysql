// 200713 월요일 실습 : module.exports = & require()
const connection = require('./mysql_connection.js')

// students/papers table 실습문제 1
let select_query = 'select s.first_name as first_name, p.title as title, p.grade as grade \
                    from papers as p join students as s on s.id = p.student_id order by grade desc'

// students/papers table 실습문제 2
select_query = 'select s.first_name as first_name, ifnull(p.title, "NULL") as title, ifnull(p.grade, "NULL") as grade \
                from students as s left join papers as p on s.id = p.student_id order by s.id'

// students/papers table 실습문제 3
select_query = 'select s.first_name as first_name, ifnull(p.title, "MISSING") as title, ifnull(p.grade, "0") as grade \
                from students as s left join papers as p on s.id = p.student_id order by s.id;'

// students/papers table 실습문제 4
select_query = 'select s.first_name as first_name, ifnull(avg(p.grade), 0) as average \
                from students as s left join papers as p on s.id = p.student_id group by s.id order by average desc'

// students/papers table 실습문제 5
select_query = 'select s.first_name as first_name, ifnull(avg(p.grade), 0) as average, \
                    case \
                        when ifnull(avg(p.grade), 0) >= 70 then "PASSING" \
                        else "FAILING" \
                    end as passing_status \
                from students as s left join papers as p on s.id = p.student_id group by s.id order by average desc'

connection.query(select_query, [], function(error, results, fields){
    // console.log(results)
    for(let i = 0; i < results.length; i++){
        console.log(results[i])
    }
}) // function(error, results, fields){} => "콜백" 함수(펑션)

connection.end()