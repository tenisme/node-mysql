const connection = require('./mysql_connection')

let select_query = 'select title, rating from series as s join reviews as r on s.id = r.series_id'

select_query = 'select s.title, avg(r.rating) as avg_rating from series as s join reviews as r on s.id = r.series_id group by s.title order by avg_rating'

select_query = 'select rr.first_name, rr.last_name, rv.rating from reviewers as rr join reviews as rv on rr.id = rv.reviewer_id'

select_query = 'select s.title as unreviewed_series from series as s left join reviews as r on r.series_id = s.id where r.rating is null'

select_query = 'select s.genre, avg(r.rating) as avg_rating from series as s join reviews as r on s.id = r.series_id group by s.genre'

select_query = 'select rr.first_name, rr.last_name, count(rv.rating) as COUNT, \
                    ifnull(min(rv.rating), 0) as MIN, ifnull(max(rv.rating), 0) as MAX, ifnull(avg(rv.rating), 0) as "AVG", \
                        case \
                            when count(rv.rating) > 0 then "ACTIVE" \
                            else "INACTIVE" \
                        end as "STATUS" \
                    from reviewers as rr left join reviews as rv on rr.id = rv.reviewer_id \
                    group by rr.first_name, rr.last_name'

select_query = 'select s.title, rv.rating, concat(rr.first_name, " ", rr.last_name) as reviewer from series as s join reviews as rv on s.id = rv.series_id \
                join reviewers as rr on rr.id = rv.reviewer_id order by s.title'

connection.query(select_query, [], function(error, results, fields){
    
    for(let i = 0; i < results.length; i++){
        console.log(results[i])
    }
})

connection.end()
