# MERN Backend with GQL Integration and Typescript

### GQL with graphql-yoga and auth with passportjs/cookie session

---

To start:
`pnpm i` and then `pnpm serve`.

Add an .env and use these settings that you are using for your mooody db.

> MONGODB_ADMINUSERNAME=username  
> MONGODB_ADMINPASSWORD=password

Server is hosted on `localhost:5173`

**Docker** handles the mongodb and mongo express.
You'll have to create an initial database, a database user to handle the database, and a initial collection.
Start up docker and do `docker-compose up -d` in the folder with docker-compose.yml.

With docker, you can use `docker exec -it moody-mongo-1 mongosh -u "root" -p "example"` to enter the mongo shell and log in as root admin created with docker compose.

`show dbs` to see default dbs.

Docker compose file creates an admin user "root" with pwd "example." In order for you to use a database and connect in the backend, you'll need to create a database user in admins.

`use admin` to switch to the admin database.

`db.create({
  user: username,
  pwd: password,
  roles: [ { role: "dbOwner", db: moody }]
})` will create the database owner for moody.

`use moody` to initialize a non-existing database and then you must store data in it for it to be properly created.  
For example: `db.createCollection("delete_me")`  
Or you can use mongoexpress at localhost:8081 to create a new database.

Create .env file in the backend folder.
