# ecs-tester
Integration testing with Puppeteer, Chromium headless, Jest and Docker!

## Setup

This project relies on Docker but can also be run outside of Docker. You will need Docker 1.13.0 CE and/or a Node.js 8.6 or newer and npm v5.6 or newer to run this project.

The first thing to do is to create an IAM user with appropriate rights in your console so that the tests can log on as a user. Then create a file in this directory called `.env` and add eight keys to it. The keys are listed below. The region follows the standard AWS region code format, eg. `us-east-1`. The `USE_FARGATE` key can be used to enable the automated Fargate tests. The `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY` are optional. If not provided, resources created by the tests won't be deleted.

The `DEBUG` variable has 3 possible values, `none` which only creates a `manifest.json`, `screenshot` which will take screenshots at the end of each test and `interactive` which will take screenshots and run puppeteer in non-headless mode.

```
AWS_ACCOUNT=<your_account_id_or_alias>
IAM_USERNAME=<your_iam_username>
IAM_PASSWORD=<your_iam_password>
ACCESS_KEY_ID=<your_access_key_id>
SECRET_ACCESS_KEY=<your_secret_access_key>
REGION=<aws_region>
USE_FARGATE=<true|false>
DEBUG=<none|screenshot|interactive>
```

Once you have this created, you can either run `npm install` to install all the dependencies or run `docker build -t ecs-tester .` to build the image.

## Running the tests

### Docker easy mode

All you need to do is create the `.env` file like shown above _somewhere_ on your local machine. Then run `docker run --init -it --name <some_name> --env-file <path_to_env_file> yashdalfthegray/ecs-tester`. This will automatically pull the image from DockerHub and run all the tests in the test suite. You can then use the docker commands in results section to peek at the results.

### Locally/Build-Your-Own Docker Image

To run the tests locally, follow the steps above and run `npm test`. This will run the Jest tests using Puppeteer and Chromium headless. Any screenshots will be in the `artifacts` folder.

To run the tests using Docker, run `docker run --init -it --name <some_name> --env-file .env ecs-tester`. Since the container is running in interactive mode, it will print the test results as they happen.

## Results

Once the tests are done running in docker, `docker inspect --format='{{.State.ExitCode}}' <name_set_in_run_command>` to check if they ran successfully. If successful, this should return `0`.

Screenshots are taken at the end of the tests if the `DEBUG` environment variable is set to `true`. The screenshots get saved in `./artifacts` while running locally and they get saved inside the container while running with Docker. To get started, run `docker diff <name_set_in_run_command>` and you'll see what screenshots were created.

A file called `artifacts/manifest.json` also gets created every time a create flow test is run. It is there to detail what resources the tests have created in the AWS account for easy identification.

You can access the screenshots and the manifest file by copying them out of the container and onto your host machine. Run `docker cp <name_set_in_run_command>:/usr/app/artifacts <path_on_host>` to copy the entire folder of screenshots.

## Focusing tests

Jest parallelizes the tests that it runs so it doesn't know up front what tests to run or which ones to not. You can use `describe.only` or `test.only` to focus tests within the same module but Jest will still run the other test modules. To specifically focus on one module, run `npm test -- -t "<name_of_describe>"`. The `-t` flag only runs one spec.

## Puppeteer version
This project depends specifically on Puppeteer v0.13.0 because of a CSP issue with version 1.0.0 and newer. [This issue on the repository](https://github.com/GoogleChrome/puppeteer/issues/1229) and this [sandbox demo](https://puppeteersandbox.com/S0HVfA1j) has more information.

Until solved, we can't upgrade to the newer versions of Puppeteer and will have to use the v0.13.0 docs. The new version of Puppeteer, v1.3.0, has a new build of Chromium that breaks the main AWS sign-in page so that has to be debugged before the new version can be adopted. An issue has been created.

## Contributing

PRs are welcome! After making changes to the package, make sure that the tests are successful by running `npm test` and the linter is successful by running `npm run linter`.

Check the [contributing guide](.github/CONTRIBUTING.md) for more information.

## Resources

* [Puppeteer v1.2.0 API](https://github.com/GoogleChrome/puppeteer/blob/v1.2.0/docs/api.md)
* [Puppeteer v0.13.0 API](https://github.com/GoogleChrome/puppeteer/blob/v0.13.0/docs/api.md)
* [Jest API](https://facebook.github.io/jest/docs/en/getting-started.html)
* [Expect API](https://facebook.github.io/jest/docs/en/expect.html)
* [Faker Docs](https://github.com/marak/Faker.js/)
* [`docker run` options](https://docs.docker.com/engine/reference/commandline/run/)
* [Difference between Chromium and Chrome](https://www.howtogeek.com/202825/what%E2%80%99s-the-difference-between-chromium-and-chrome/)
