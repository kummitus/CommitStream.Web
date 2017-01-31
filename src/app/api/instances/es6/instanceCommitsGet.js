import commitsGet from '../helpers/commitsGet';
import cacheCreate from '../helpers/cacheCreate';
import commitsChildrenGet from '../helpers/commitsChildrenGet';
import _ from 'underscore';
import config from '../../config';

const cache = cacheCreate();

export default function(req, res) {
  const workitemNumbers = req.query.numbers || '';
  const instanceId = req.instance.instanceId;

  const buildUri = page => req.href(`/api/${instanceId}/commits/tags/versionone/workitem?numbers=${workitemNumbers}&page=${page}&apiKey=${req.instance.apiKey}`);

  const workitemNumbersArray = workitemNumbers.split(',');

  if (workitemNumbersArray.length === 1) {
    const stream = `versionOne_CommitsWithWorkitems-${instanceId}_${workitemNumbers}`;

    commitsGet(req.query, stream, buildUri, cache).then(function(commits) {
      // TODO use hal?
      res.send(commits);
    });
  } else if (config.showChildrenFeatureToggle) {
      let streams = [];
        _.each(workitemNumbersArray, function(e, i) {
        streams.push(`versionOne_CommitsWithWorkitems-${instanceId}_${e}`);
      });
      commitsChildrenGet(req.query, streams, buildUri).then(function(commits) {
        res.send(commits);
      });
  } else {
    // Daniel says OK to send empty array here (9/24/2015)
    res.send({commits:[]});
  }
};