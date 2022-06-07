install:
	npm ci

u := $(USER)
p := 
h := localhost
P := 5432
db := test_database_moy_klass

start:
	PG_CONNECTION_STRING=postgres://$(u):$(p)@$(h):$(P)/$(db) npm run dev -s

restart-test-db:
	-dropdb $(db)
	createdb $(db)
	psql $(db) < test.sql

test: restart-test-db
	PG_CONNECTION_STRING=postgres://$(u):$(p)@$(h):$(P)/$(db) npm test -s

test-coverage:
	PG_CONNECTION_STRING=postgres://$(u):$(p)@$(h):$(P)/$(db) npm test -s -- --coverage

lint:
	npx eslint .
