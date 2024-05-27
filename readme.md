# Moody

### a pinterest clone learning project

---

Built with MERN stack - create app with vite + swc, Graphql-Yoga, graphql-request, TanStack Query, Tailwindcss, Chakra-Ui, Generouted, masonic, nanostore + persistent atoms, axios

---

Docker handles the mongodb and mongo express.
You'll have to create an initial database, a database user to handle the database, and a initial collection.

With docker, you can use `docker exec -it moody-mongo-1 mongosh -u "root" -p "example"` to enter the mongo shell and log in as root admin.
`show dbs` to see default dbs.
Docker compose file creates an admin user "root" with pwd "example." In order for you to use a database and connect in the backend, you'll need to create a database user in admins.
`use admin` to switch to the admin database.
`db.create({
  user: username,
  pwd: password,
  roles: [ { role: "dbOwner", db: moody }]
})`
`use moody` to initialize a non-existing database and then you must store data in it for it to be properly created.
for example: `db.createCollection("delete_me")`
Or you can use mongoexpress at localhost:8081 to create a new database.
Create .env file in the backend folder.
MONGODB_ADMINUSERNAME=username
MONGODB_ADMINPASSWORD=password

---

To do, saving each other's pins, following each other, deletions, editing, profile, search bar
