use test2
select first_name2, last_name2, order_date2, order_amount2
from customers2 c
right join orders2 o
on c.customer_id = o.customer_id
where first_name is hola
use test
select first_name, last_name, order_date, order_amount
from customers c
right join orders o
on c.customer_id = o.customer_id
where first_name is NULL