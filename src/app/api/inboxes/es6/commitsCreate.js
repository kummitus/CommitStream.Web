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
        // TODO do we need a try / catch here? See if you can throw an error from translatePush manually...
        const events = translator.translatePush(req.body, instanceId, digestId, inboxId);
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
        return Promise.reject(new MalformedPushEventError(req));
    }
};
