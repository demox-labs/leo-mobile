# Leo Wallet Mobile

Expo/React Native wallet for the Aleo Network

## Getting Started with Demox Labs Leo Wallet Mobile App

Welcome to the Leo Wallet Mobile App, developed by Demox Labs. This guide will help you set up and build the app on your local machine.

> **Note**: Always double-check the installation documents for each tool to ensure you're using the latest installation scripts.

## Install Git LFS for the Rust-based SDK

1. **Install Git LFS**: Ensure that Git LFS is installed. If not, download and install it from [Git LFS](https://git-lfs.github.com/).

2. **Initialize Git LFS**: Run the following command in your local clone of the repository:

   ```bash
   git lfs install
   ```

   This sets up Git LFS and ensures that LFS-tracked files are handled properly.

3. **Pull LFS Objects**: Download the LFS objects by executing:

   ```bash
   git lfs pull
   ```

   Continue to use regular Git commands like `git pull`, `git fetch`, etc. Git LFS will automatically handle the LFS-tracked files during these operations.

## Setting Up the React Native Development Environment

For the most up-to-date guide on setting up React Native, please follow the instructions provided at [Expo Dev](https://docs.expo.dev/get-started/installation/) and [React Native](https://reactnative.dev/docs/environment-setup).

## Running the App

### Environment Setup

Create a `.env` file in the root of the project with the following content:

```bash
SENTRY_DISABLE_AUTO_UPLOAD=true
SENTRY_ALLOW_FAILURE=true
```

You can find the latest `.env` file example in the `.env.sample` file.

### Build Prerequisites

- **Node Version**: 14.17.0 (Use NVM to manage node versions)
- **Bun Version**: 1.1.13. Installation guide: [Bun](https://bun.sh/)
- **XCode Version**: 15.3 or later
- **Android Studio Version**: 2023.* or later

### Installation Steps

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Use the correct node version
nvm use

# Install sdkman
curl -s "https://get.sdkman.io" | bash

# Install Java 21.0.2-zulu
sdk install java 21.0.2-zulu

# Set default Java version if needed
sdk use java 21.0.2-zulu

# Install bun
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install # or "bun i" or just "bun"

# Build iOS and Android apps
bun prebuild --platform ios
bun prebuild --platform android
# or both at once
# bun prebuild
```

### Launching the Expo App

```bash
# Start the Expo development bundler server
bun start

# Run the app on iOS
bun build:ios:development

# Run the app on Android
bun build:android:development
```

## SQLite

To access the database:

1. Install the DB Browser for SQLite application: [SQLite Browser](https://sqlitebrowser.org/)

2. Find the iOS simulator’s unique identifier: Xcode -> Window -> Devices and Simulators.
- For example, iPhone 14 Pro might have Identifier formatted like this `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

3. Open terminal in the folder: `~/Library/Developer/CoreSimulator/Devices/[UNIQUE IDENTIFIER]`

4. Run the command:

   ```bash
   find . -name "leowallet.db" -print
   ```

   This will find the folder corresponding to the appropriate application and the place where the db file is stored.

5. Open this file from DB Browser for SQLite.

## Troubleshooting

1. **Avoid iCloud Managed Directories**: Don't build this repo in a directory that iCloud manages. Clone to a new directory and build from there. XCode will keep freezing and fail to even start or open the project.
