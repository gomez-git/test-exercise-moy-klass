[![Maintainability](https://api.codeclimate.com/v1/badges/0091be501742dcac0b92/maintainability)](https://codeclimate.com/github/gomez-git/test-task-moy-klass/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/0091be501742dcac0b92/test_coverage)](https://codeclimate.com/github/gomez-git/test-task-moy-klass/test_coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/gomez-git/test-task-moy-klass/badge.svg)](https://snyk.io/test/github/gomez-git/test-task-moy-klass)
[![Node CI](https://github.com/gomez-git/test-task-moy-klass/actions/workflows/NodeCI.yml/badge.svg?branch=main)](https://github.com/gomez-git/test-task-moy-klass/actions/workflows/NodeCI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Solution of test task from Moy Klass

## Краткое описание
Требуется создать веб-сервер на базе KoaJS или ExpressJS, который будет работать с данными по занятиям. Данные хранятся в СУБД PostgreSQL, дамп тестовых данных прилагается к тестовому заданию. Предлагается сделать 2 задачи. Первая - запрос данных, вторая - манипуляция с данными. Исполнителю предлагается сделать задачу, выбирая адекватные инструменты и общепринятые способы организации кода и API-интерфейсов, учитывая указанные в задании требования. Необходимо написать тесты для созданных методов. При разработке учитывать, что данных может быть очень много (миллионы занятий).

## Quick start
```bash
git clone git@github.com:gomez-git/test-task-moy-klass.git
cd test-task-moy-klass
make install
make start
curl localhost:4000/

```
## Test
```bash
make test

```
