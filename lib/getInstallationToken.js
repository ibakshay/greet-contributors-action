"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const app_1 = require("@octokit/app");
const { request } = require("@octokit/request");
function setInstallationAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const PRIVATE_KEY = core.getInput('private_key');
        const APP_ID = 55339;
        const app = new app_1.App({ id: APP_ID, privateKey: PRIVATE_KEY });
        const jwt = app.getSignedJsonWebToken();
        console.log(`The JSON web token is ${jwt}`);
        const { data } = yield request("GET /repos/:owner/:repo/installation", {
            owner: github_1.context.issue.owner,
            repo: github_1.context.issue.repo,
            headers: {
                authorization: `Bearer ${jwt}`,
                accept: "application/vnd.github.machine-man-preview+json"
            }
        });
        const installationId = data.id;
        console.log(`Installation id for ${github_1.context.issue.repo} repo and owner ${github_1.context.issue.owner} is ${installationId}`);
        const installationAccessToken = yield app.getInstallationAccessToken({
            installationId
        });
        console.log(`Installation Access  token for ${github_1.context.issue.repo} repo and owner ${github_1.context.issue.owner} is ${installationAccessToken}`);
        return installationAccessToken;
    });
}
exports.setInstallationAccessToken = setInstallationAccessToken;