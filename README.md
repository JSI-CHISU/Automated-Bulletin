# Automated Bulletin App

The automated bulletin application provides a generic template that can be imported into District Health Information Software 2 (DHIS2) as a third party application. DHIS2, a global digital public good, is the web-based platform most commonly used as a country HMIS in over 70 low- and middle-income countries. CHISU envisions this application will be a generic, scalable, and robust bulletin that is configurable and adaptable to different country and subnational contexts.

This project is supported by CHISU 

Find the user guide [here](./user_guide_v1.pdf).

This project was bootstrapped with [DHIS2 Application Platform](https://github.com/dhis2/app-platform).

### Available Scripts

In the project directory, you can run:

#### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `yarn test`

Launches the test runner and runs all available tests found in `/src`.<br />

See the section about [running tests](https://platform.dhis2.nu/#/scripts/test) for more information.

#### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
A deployable `.zip` file can be found in `build/bundle`!

See the section about [building](https://platform.dhis2.nu/#/scripts/build) for more information.

#### `yarn deploy`

Deploys the built app in the `build` folder to a running DHIS2 instance.<br />
This command will prompt you to enter a server URL as well as the username and password of a DHIS2 user with the App Management authority.<br/>
You must run `yarn build` before running `yarn deploy`.<br />

See the section about [deploying](https://platform.dhis2.nu/#/scripts/deploy) for more information.

## Changelog
- Renamed app to automated_bulletin
- Namespace changed from malaria_bulletin to automated_bulletin
- Namespace changed from malaria-bulletin to malaria_bulletin

## Users

## Developers

### Learn More

You can learn more about the platform in the [DHIS2 Application Platform Documentation](https://platform.dhis2.nu/).

You can learn more about the runtime in the [DHIS2 Application Runtime Documentation](https://runtime.dhis2.nu/).

To learn React, check out the [React documentation](https://reactjs.org/).
