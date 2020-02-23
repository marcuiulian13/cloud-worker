# cloud-worker

Worker pattern implemented using Node.js and Redis

## Development

### Environment

Make sure you have the following installed:

- [Node.js](https://nodejs.org) >=12.14.0
- [Yarn](https://yarnpkg.com/) >= 1.21.1
- [Docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)

Following environment variables need to be defined in a `.env` file in the project root folder.

| Variable              | Description                                          | Values                  |
| --------------------- | ---------------------------------------------------- | ----------------------- |
| TYPE                  | Mode to run the service in                           | master / slave          |
| DEBUG                 | Used to output debug logs                            | true / false (optional) |
| REDIS_HOST            | Redis connection hostname                            | see docker-compose.yml  |
| REDIS_PORT            | Redis connection port                                | see docker-compose.yml  |
| REDIS_PASSWORD        | Redis connection password                            | see docker-compose.yml  |
| REDIS_TASKS_QUEUE     | Key in Redis for the tasks queue                     | any                     |
| REDIS_RESULTS_CHANNEL | Redis channel in which task results are published    | any                     |
| REDIS_RESULTS_LIST    | Key in Redis in which a lsit of task results is kept | any                     |

An example can be seen in `.env.example`.

### Running the project

#### Redis

To run the project, you first have to start a Redis instance: `docker-compose up redis`. This will make a Redis instance available on `localhost:6379`. Make sure to configure `.env` accordingly.

#### Slave

To run a slave, you first have to `yarn build` the project, then `yarn start:slave`. This will start a slave that will connect to the configured Redis instance (see `.env`) and will continuously check for new tasks.
You can run in parallel as many slaves as necessary.

#### Master

To start the master, `yarn build` the project if not done already, then `yarn start:master`. The service will connect to the configured Redis instance (see `.env`) and by default will publish 42 tasks for computing the first 42 Fibonacci numbers.
**Only one master should run at a time.**

### Checking stored data

To check the tasks queue or the results list, you can use the [redis-cli](https://redis.io/topics/rediscli) and check the configured `REDIS_TASKS_QUEUE` and `REDIS_RESULTS_LIST` keys:

```
AUTH <REDIS_PASSWORD>

LLEN <REDIS_TASKS_QUEUE> # outputs the amount of tasks currently queued
LLEN <REDIS_RESULTS_LIST> # outputs the amount of results currently stored

LRANGE <REDIS_TASKS_QUEUE> <start> <end> # lists all tasks from start to end index
LRANGE <REDIS_RESULTS_LIST> <start> <end> # lists all results from start to end index
```

You can also subscribe to the results channel to see the results coming through in realtime:

```
SUBSCRIBE <REDIS_RESULTS_CHANNEL>
```

## Running the project with docker-compose

You can run the project with `docker-compose up`. This will start a Redis instance, a slave and a master publishing the 42 Fibonacci tasks. You can run multiple slaves by duplicating the slave configuration in `docker-compose.yml`.
