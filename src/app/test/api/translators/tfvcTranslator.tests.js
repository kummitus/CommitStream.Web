var chai = require('chai'),
    should = chai.should(),
    proxyquire = require('proxyquire'),
    sinon = require('sinon'),
    uuidStub = sinon.stub(),
    tfvcTranslator = proxyquire('../../../api/translators/tfvcTranslator', {
        'uuid-v4': uuidStub
    });
require('../../helpers')(global);


var tfvcPushEventForOneProject = {
    "subscriptionId": "20019a9b-3534-4705-a755-198d23de2ed7",
    "notificationId": 6,
    "id": "b72be65b-614d-4652-9ca9-11d2942a5c91",
    "eventType": "tfvc.checkin",
    "publisherId": "tfs",
    "scope": "all",
    "message": {
        "text": "Josh Gough checked in changeset 17: Updated README.md S-12345",
        "html": "Josh Gough checked in changeset <a href=\"https://v1platformtest.visualstudio.com/web/cs.aspx?pcguid=6b1d2d92-0bb2-4ff1-b1e0-5b79fd2abd67&amp;cs=17\">17</a>: Updated README.md S-12345",
        "markdown": "Josh Gough checked in changeset [17](https://v1platformtest.visualstudio.com/web/cs.aspx?pcguid=6b1d2d92-0bb2-4ff1-b1e0-5b79fd2abd67&cs=17): Updated README.md S-12345"
    },
    "detailedMessage": {
        "text": "Josh Gough checked in changeset 17: Updated README.md S-12345",
        "html": "Josh Gough checked in changeset <a href=\"https://v1platformtest.visualstudio.com/web/cs.aspx?pcguid=6b1d2d92-0bb2-4ff1-b1e0-5b79fd2abd67&amp;cs=17\">17</a>: Updated README.md S-12345",
        "markdown": "Josh Gough checked in changeset [17](https://v1platformtest.visualstudio.com/web/cs.aspx?pcguid=6b1d2d92-0bb2-4ff1-b1e0-5b79fd2abd67&cs=17): Updated README.md S-12345"
    },
    "resource": {
        "hasMoreChanges": true,
        "teamProjectIds": [
            "b70385b4-ae0f-4afd-b166-6aff62bfd0b0"
        ],
        "changesetId": 17,
        "url": "https://v1platformtest.visualstudio.com/_apis/tfvc/changesets/17",
        "author": {
            "id": "0b88cae0-021f-4fa0-b723-d670c74ae474",
            "displayName": "Josh Gough",
            "uniqueName": "jsgough@gmail.com",
            "url": "https://app.vssps.visualstudio.com/A95780de7-c7d8-4742-a6e7-12e311437415/_apis/Identities/0b88cae0-021f-4fa0-b723-d670c74ae474",
            "imageUrl": "https://v1platformtest.visualstudio.com/_api/_common/identityImage?id=0b88cae0-021f-4fa0-b723-d670c74ae474"
        },
        "checkedInBy": {
            "id": "0b88cae0-021f-4fa0-b723-d670c74ae474",
            "displayName": "Josh Gough",
            "uniqueName": "jsgough@gmail.com",
            "url": "https://app.vssps.visualstudio.com/A95780de7-c7d8-4742-a6e7-12e311437415/_apis/Identities/0b88cae0-021f-4fa0-b723-d670c74ae474",
            "imageUrl": "https://v1platformtest.visualstudio.com/_api/_common/identityImage?id=0b88cae0-021f-4fa0-b723-d670c74ae474"
        },
        "createdDate": "2017-01-20T16:28:45Z",
        "comment": "Updated README.md S-12345"
    },
    "resourceVersion": "1.0",
    "resourceContainers": {
        "collection": {
            "id": "6b1d2d92-0bb2-4ff1-b1e0-5b79fd2abd67",
            "baseUrl": "https://v1platformtest.visualstudio.com/"
        },
        "account": {
            "id": "95780de7-c7d8-4742-a6e7-12e311437415",
            "baseUrl": "https://v1platformtest.visualstudio.com/"
        }
    },
    "createdDate": "2017-01-20T16:28:47.755774Z"
};

describe('when translating a push event that contains one commit', function() {
    var eventId = '87b66de8-8307-4e03-b2d3-da447c66501a';
    uuidStub.returns(eventId);

    var digestId = 'cd0b1089-7d6d-435a-adf2-125209b1c2c8';
    var instanceId = 'c4abe8e0-e4af-4cc0-8dee-92e698015694';
    var inboxId = 'f68ad5b0-f0e2-428d-847d-1302322eeeb1';

    describe('when translating a push event that contains one commit', function() {
        var expected = [{
            eventId: eventId,
            eventType: "TfvcCommitReceived",
            data: {
                sha: "b72be65b-614d-4652-9ca9-11d2942a5c91",
                commit: {
                    author: {
                        name: "Josh Gough",
                        email: "jsgough@gmail.com"
                    },
                    committer: {
                        name: "Josh Gough",
                        email: "jsgough@gmail.com",
                        date: ''
                    },
                    message: "Josh Gough checked in changeset 17: Updated README.md S-12345"
                },
                html_url: "https://v1platformtest.visualstudio.com/b70385b4-ae0f-4afd-b166-6aff62bfd0b0/_versionControl/changeset/17",
                repository: '',
                branch: '',
                originalMessage: tfvcPushEventForOneProject
            },
            metadata: {
                instanceId: instanceId,
                digestId: digestId,
                inboxId: inboxId
            }
        }];

        var actual = tfvcTranslator.translatePush(tfvcPushEventForOneProject, instanceId, digestId, inboxId);

        it('should match the expected translation', function () {
            actual.should.deep.equal(expected);
        });
    });
});