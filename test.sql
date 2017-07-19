use test2
select customers2.first_name2, customers2.last_name2, orders2.order_date2, orders2.order_amount2
from customers2 c
right join orders2 o
on c.customer_id = o.customer_id
where first_name is hola
use test
select first_name, last_name, orders.order_date, orders.order_amount
from customers c
right join orders o
on c.customer_id = o.customer_id
where first_name is NULL