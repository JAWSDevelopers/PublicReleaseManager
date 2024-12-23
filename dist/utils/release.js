"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewRelease = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const semver_1 = __importDefault(require("semver"));
const ora_1 = __importDefault(require("ora"));
const child_process_1 = require("child_process");
const inquirer_2 = require("../inquirer");
// Funzione per ottenere il tipo di release
const getReleaseType = async () => {
    const { releaseType } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'releaseType',
            message: 'What type of release is it?',
            choices: ['major', 'minor', 'patch'],
        },
    ]);
    return releaseType;
};
// Funzione principale che gestisce la release
const createNewRelease = async () => {
    const currentVersion = require(process.env.NODE_ENV == "development" ? '../../package.json' : '../../../../package.json').version;
    const releaseType = (await inquirer_2.ReleaseManager.askReleaseType()).releaseType;
    const newVersion = semver_1.default.inc(currentVersion, releaseType);
    const commitMessagePrefix = (await inquirer_2.ReleaseManager.askCommitMessage()).commitMessage;
    const fullCommitMessage = `Version: ${newVersion} - ${commitMessagePrefix}`;
    inquirer_2.ReleaseManager.confirmUpdate(newVersion, currentVersion).then(data => {
        if (!data.confirm)
            return;
        console.log("\nSummary:");
        console.log(`- Current Version: ${currentVersion}`);
        console.log(`- New Version: ${newVersion}`);
        console.log(`- Commit Message: ${fullCommitMessage}\n`);
        // Esegui il commit
        const commitMessage = `Release version ${newVersion}`;
        (0, child_process_1.exec)(`git add . && git commit -m "${commitMessage}"`, (err, stdout, stderr) => {
            if (err) {
                return;
            }
            // Esegui il push
            const pushSpinner = (0, ora_1.default)('Pushing changes to GitHub...').start();
            (0, child_process_1.exec)('git push', (err, stdout, stderr) => {
                if (err) {
                    pushSpinner.fail(`Error during push: ${err.message}`);
                    return;
                }
                pushSpinner.succeed('Changes pushed successfully');
            });
        });
    });
};
exports.createNewRelease = createNewRelease;