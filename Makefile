install:
	npm ci

u := $(USER)
p := 
h := localhost
P := 5432
d := test

start:
	PG_CONNECTION_STRING=postgres://$(u):$(p)@$(h):$(P)/$(d) npm run dev -s

test:
	PG_CONNECTION_STRING=postgres://$(u):$(p)@$(h):$(P)/$(d) npm test -s

test-coverage:
	PG_CONNECTION_STRING=postgres://$(u):$(p)@$(h):$(P)/$(d) npm test -s -- --coverage

lint:
	npx eslint .
