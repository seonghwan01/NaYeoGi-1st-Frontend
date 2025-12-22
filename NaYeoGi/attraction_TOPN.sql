select *
from (
    select
        v.content_type_id,
        v.id,
        row_number() over (
            partition by v.content_type_id
            order by v.vote_sum desc
        ) rn
    from (
        select
            a.id,
            a.content_type_id,
            sum(af.vote) as vote_sum
        from attractions a
        join attraction_features af
          on a.id = af.attraction_id
        group by a.content_type_id, a.id
    ) v
) t
where rn <= 100;
