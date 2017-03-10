import uuid from 'uuid-v4';
import VcsFamilies from '../helpers/vcsFamilies';

let tfvcTranslator = {
    family: VcsFamilies.Tfvc,
    translatePush(event, instanceId, digestId, inboxId) {
        try {
            const commit = {
                sha: event.id,
                commit: {
                    author:{
                        name: event.resource.author.displayName,
                        email: event.resource.author.uniqueName
                    },
                    committer: {
                        name: event.resource.checkedInBy.displayName,
                        email: event.resource.checkedInBy.uniqueName,
                        date: ''
                    },
                    message: event.message.text
                },
                html_url: event.resourceContainers.collection.baseUrl +  event.resource.teamProjectIds[0] + "/_versionControl/changeset/" + event.resource.changesetId,
                repository:'',
                branch:'',
                originalMessage: event
            }

            return [{
                eventId: uuid(),
                eventType: tfvcTranslator.family + 'CommitReceived',
                data: commit,
                metadata: {
                    instanceId: instanceId,
                    digestId: digestId,
                    inboxId: inboxId
                }
            }];
        } catch (ex) {
        }
    }
}

export default tfvcTranslator;