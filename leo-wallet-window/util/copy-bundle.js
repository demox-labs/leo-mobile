var fs = require("fs-extra");
var path = require("path");

// define paths relative to this script's directory
var mainAleoPath = path.join(__dirname, '../build/bundle.js');
var outputFilePath = path.join(__dirname, '../build/index.ts');
// read the main.aleo file
fs.readFile(mainAleoPath, 'utf8')
    .then(function (bundleContents) {
    var outputContents = "const LeoWalletWindow = `".concat(bundleContents, "` \n export default LeoWalletWindow;");
    // write the updated data to a new file
    return fs.writeFile(outputFilePath, outputContents);
})
    .then(function () {
    console.log('Successfully created and updated the file');
})
    .catch(function (err) {
    console.error('An error occurred:', err);
});
