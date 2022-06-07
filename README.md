[![Maintainability](https://api.codeclimate.com/v1/badges/0091be501742dcac0b92/maintainability)](https://codeclimate.com/github/gomez-git/test-task-moy-klass/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/0091be501742dcac0b92/test_coverage)](https://codeclimate.com/github/gomez-git/test-task-moy-klass/test_coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/gomez-git/test-task-moy-klass/badge.svg)](https://snyk.io/test/github/gomez-git/test-task-moy-klass)
[![Node CI](https://github.com/gomez-git/test-task-moy-klass/actions/workflows/NodeCI.yml/badge.svg?branch=main)](https://github.com/gomez-git/test-task-moy-klass/actions/workflows/NodeCI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Краткое описание
Требуется создать веб-сервер на базе KoaJS или ExpressJS, который будет работать с данными по занятиям. Данные хранятся в СУБД PostgreSQL, дамп тестовых данных прилагается к тестовому заданию. Предлагается сделать 2 задачи. Первая - запрос данных, вторая - манипуляция с данными. Исполнителю предлагается сделать задачу, выбирая адекватные инструменты и общепринятые способы организации кода и API-интерфейсов, учитывая указанные в задании требования. Необходимо написать тесты для созданных методов. При разработке учитывать, что данных может быть очень много (миллионы занятий).

## Quick start
Clone repository:
```bash
git clone git@github.com:gomez-git/test-task-moy-klass.git
cd test-task-moy-klass
make install
```
Create Database test_database_moy_klass. If db exists, command drops it and creates it again:
```bash
make restart-test-db
```
Start server:
```bash
make start
```
Select data:
```bash
curl localhost:4000/
curl localhost:4000/?date=2019-05-01,2019-09-01&status=1&teacherIds=1,2,4&studentsCount=1,3&lessonsPerPage=3&page=2
```
Insert data:
```bash
curl -H 'Content-Type: application/json' localhost:4000/lessons -d '{"teacherIds":[1,4],"days":[0],"title":"First lesson","firstDate":"2022-01-11","lessonsCount":10}'
curl -H 'Content-Type: application/json' localhost:4000/lessons -d '{"teacherIds":[2],"days":[1,3,5],"title":"Second lesson","firstDate":"2022-11-11","lastDate":"2023-01-01"}'
```
## Test
Before test command drops test_database_moy_klass and creates it again:
```bash
make test
```
