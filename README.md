# ecs-tester
Integration testing with Puppeteer, Chromium headless, Jest and Docker!

## Setup

This project relies on Docker but can also be run outside of Docker. You will need Docker CE and/or a Node.js 8 or newer version to run this project.

The first thing to do is to create an IAM user with appropriate rights in your console so that the tests can log on as a user. Then create a file in this directory called `.env` and add three keys to it. The keys are listed below. The region follows the standard AWS region code format, eg. `us-east-1`.

```
IAM_USERNAME=<your_iam_username>
IAM_PASSWORD=<your_iam_password>
REGION=<aws_region>
```

Once you have this created, you can either run `npm install` to install all the dependencies or run `docker build -t ecs-tester .` to build the image.

## Running the tests

To run the tests locally, follow the steps above and run `npm test`. These will run the Jest tests using Puppeteer and Chromium headless. Any screenshots will be in the `artifacts` folder.

To run the tests using Docker, run `docker run -it --name <some_name> --env-file .env ecs-tester`. Since the container is running in interactive mode, it will print the test results as they happen.

Once the tests are done running in docker, `docker inspect --format='{{.State.ExitCode}} <name_set_in_run_command>` to check if they ran successfully. If successful, this should return `0`.

## Contributing

PRs are welcome! After making changes to the package, make sure that the tests are successful by running `npm test` and the linter is successful by running `npm run linter`.

## Resources

* [Puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/v1.2.0/docs/api.md)
* [Jest API](https://facebook.github.io/jest/docs/en/getting-started.html)
* [Expect API](https://facebook.github.io/jest/docs/en/expect.html)
* [Faker Docs](https://github.com/marak/Faker.js/)
* [`docker run` options](https://docs.docker.com/engine/reference/commandline/run/)
* [Difference between Chromium and Chrome](https://www.howtogeek.com/202825/what%E2%80%99s-the-difference-between-chromium-and-chrome/)
