DEVELOP_VERSION=$(git show origin/develop:version.ts | grep VersionCode | cut -d' ' -f5)
CURRENT_VERSION=$(grep VersionCode version.ts | cut -d' ' -f5)
if [ "$CURRENT_VERSION" -le "$DEVELOP_VERSION" ]; then
    echo "::error:: The version code in the current branch is less than or equal to the one in the develop branch."
    echo "::error::Current version code: $CURRENT_VERSION"
    echo "::error::Develop version code: $DEVELOP_VERSION"
    echo "::error::Please update the version code in the version.ts file."
    exit 1
else
    echo "The version code in the current branch is greater than the one in the develop branch."
    echo "Current version code: $CURRENT_VERSION"
    echo "Develop version code: $DEVELOP_VERSION"
fi