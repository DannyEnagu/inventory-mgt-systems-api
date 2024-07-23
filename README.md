# A Boutique Inventory Management software API

I'm building a web based inventory management software for a boutique that service both men and women.

The product catalogue includes: cloths, men an women hand bags, wrist watches, shoes, chains (i.e neck, wrist, and leg chains, etc) eye glasses, perfumes an sprays, puse and men wallets etc.

## Project Features

1. User Authentication
2. Product Management
3. Inventory Management
4. Order Management
5. Reporting & Analytics
6. Supplier Management
7. Customer Management
8. Inventory Forecasting
9. Inventory tracking
10. Barcoding & Scanning

## Run Locally

Check database schema
`
$ docker exec -it invent_mgt_sys_db psql -U postgres
`
Initialize the database schema in the API service

`docker exec -it invent_mgt_sys_api npx prisma migrate dev --name init`
