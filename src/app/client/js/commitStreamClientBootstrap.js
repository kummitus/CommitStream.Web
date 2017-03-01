(function() {
    $(function() {
        function getQueryVariable(variable) {
            var query = window.location.search.substring(1);
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (decodeURIComponent(pair[0]) == variable) {
                    return decodeURIComponent(pair[1]);
                }
            }
            return null;
        }

        function createSafeOrEmptyURL(url){
            if(isValidUrl(url))
                return url;
            return '';
        }

        function isValidUrl(url) {
            try {
                return testURLWithRegex(url);
            }
            catch (e) {
                return false;
            }
        }

        //Regex from jqueryValidate Plugin: https://github.com/jquery-validation/jquery-validation/commit/f33690b8a5ba256fe7f58e72c1b04db9dee13d4c
        function testURLWithRegex (url){
            return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url)
        }

        function handleError(data, status) {
            $('#commits').html('<div class="commitStream-panel"><div class="stream-title-area"><h3>Error Contacting CommitStream</h3>Please try again.</h3></div></div>');
        }

        var apiKey = getQueryVariable('apiKey');

        if (!apiKey) {
            alert('Must specify API key in the form of apiKey=<apikey> as a query string parameter');
        }

        var digestId = getQueryVariable('digestId');
        var instanceId = getQueryVariable('instanceId');
        var workitem = getQueryVariable('workitem');
        var mentionDetailUrl = getQueryVariable('mentionDetailUrlTemplate');
        var mentionDetailSafeURL = createSafeOrEmptyURL(mentionDetailUrl);

        $.getScript('app',
            function(data, status, jqxhr) {
                CommitStream.commitsDisplay(
                    '#commits',
                    workitem,
                    handleError,
                    digestId,
                    instanceId,
                    apiKey,
                    undefined,
                    mentionDetailSafeURL);
            }
        );
    });
})();