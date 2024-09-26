# <b>Project default for a model typescript back-end</b>

This project aims to demonstrate the code standards that should be used in a back-end application.
The project uses Node.js with TypeScript, Express, MongoDB, and Jest.

Set up the `.env` and `.env.test` files as shown in the `.env.default` model.
Don't forget to start the MongoDB application and place the appropriate variables in their respective locations.

# Running Tests

To run the tests for this project, follow these steps:

1. Ensure you have all dependencies installed by running:

   ```bash
   yarn install
   ```

2. Run the tests using Jest:

   ```bash
   yarn test
   ```

This project aims to demonstrate the code standards that should be used in a back-end application.
The project uses Node.js with TypeScript, Express, MongoDB, and Jest.

# Running Tests

To run the tests for this project, follow these steps:

1. Ensure you have all dependencies installed by running:

   ```bash
   yarn install
   ```

2. Run the tests using Jest:

   ```bash
   yarn test
   ```

# How to run in development mode

    1. Ensure you have all dependencies installed by running:

    ```bash
    yarn install
    ```

2. Run the tests using Jest:
   ```bash
   yarn start:dev
   ```

## Running Locally

Set up the `.env` file as shown in the `.env.default` model.
Don't forget to start the MongoDB application and place the appropriate variables in their respective locations.

```bash
git clone https://github.com/StarsEncodingTechnology/backend-typescript-template
```

```bash
cd my-project
```

```bash
yarn install
```

```bash
yarn build
```

```bash
yarn start
```

## Technologies Used

- <code><img height="25" src="https://img.shields.io/badge/NodeJs-success?style=flat&logo=node.js&logoColor=white" alt="NodeJs"/></code>
- <code><img height="25" src="https://img.shields.io/badge/TypeScript-blue?style=flat&logo=typescript&logoColor=white" alt="TypeScript"/></code>
- <code><img height="25" src="https://img.shields.io/badge/ExpressJs-informational?style=flat&logo=express&logoColor=white" alt="ExpressJs"/></code>
- <code><img height="25" src="https://img.shields.io/badge/MongoDB-green?style=flat&logo=mongodb&logoColor=white" alt="MongoDB"/></code>
- <code><img height="25" src="https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white" alt="Jest"/></code>
- <code><img height="25" src="https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white" alt="GitHub"/></code>
- <code><img height="25" src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white" alt="GitHub Actions"/></code>

## Project Structure

The project is organized as follows:

- **src/**: Contains the source code of the application.
  - **controllers/**: Handles the incoming requests and returns responses.
  - **models/**: Defines the data models and schemas.
  - **middlewares/**: Middlewares for express.
  - **services/**: Contains the business logic of the application.
  - **utils/**: Utility functions and helpers.
  - **repositorys/**: Responsible for data access and communication with the database.
- **tests/**: Contains the test cases for the application.

This structure helps in maintaining a clean and organized codebase, making it easier to manage and scale the application.
