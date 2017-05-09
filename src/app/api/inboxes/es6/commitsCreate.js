import validateUUID from  '../validateUUID';
import eventStore from '../helpers/eventStoreClient';
import translatorFactory from '../translators/translatorFactory';
import commitsAddedFormatAsHal from './commitsAddedFormatAsHal';
import MalformedPushEventError from '../../middleware/malformedPushEventError';
import Promise from 'bluebird';

export default (req, res) => {
    const instanceId = req.instance.instanceId;
    const digestId = req.inbox.digestId;
    const inboxId = req.params.inboxId;

    validateUUID('inbox', inboxId);

    const translator = translatorFactory.create(req);

    if (translator) {
        let events;
        try {
            events = translator.translatePush(req.body, instanceId, digestId, inboxId);
        } catch (err) {
            console.log("****** CAUGHT A THROWN ERROR! ******");
            console.log(err);
            return Promise.reject(err);
        }
        const postArgs = {
            name: `inboxCommits-${inboxId}`,
            events
        };

        return eventStore.postToStream(postArgs)
            .then(() => {
                const inboxData = {
                    inboxId,
                    digestId
                };

                const hypermedia = commitsAddedFormatAsHal(req.href, instanceId, inboxData);
                res.hal(hypermedia, 201);
            });
    } else {
        throw new MalformedPushEventError(req);
    }
};
